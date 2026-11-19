#!/usr/bin/env node
/**
 * Renders the HTML5 motion ads (public/kit/motion/ads/, from scripts/build-motion-ads.mjs) frame by frame in headless
 * Chromium, seeking the ad's own clock (window.oneAd.seek(t)) so every frame is exact, then encodes to
 * public/kit/motion/exports/:
 *   one-agency_motion-[concept]_[WxH].mp4   H.264, 30 fps (ffmpeg)
 *   one-agency_motion-[concept]_[WxH].gif   15 fps; 300x250 must fit 3 MB
 *   one-agency_motion-[concept]_[WxH].png   the end frame (also the video poster)
 * Without ffmpeg it falls back to a real-time WebM per ad via Playwright's recorder and skips the GIF.
 *
 * Usage: node scripts/export-motion-ads.mjs [audit proof award] [--stills]
 *   --stills   end-frame PNGs only (fast layout check)
 */
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rename, rm, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { extname, join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { chromium } from 'playwright'
import { MOTION_AD_CONCEPTS, MOTION_AD_DURATION, MOTION_AD_SIZES, motionAdExport, motionAdSlug } from '../src/data/motion-ads.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = resolve(ROOT, 'public')
const FPS = 30
const GIF_FPS = 15
const MB = 1024 * 1024
/** GIF budgets: the banner is a hard limit (ad-server rule); the 1080s are best effort. */
const GIF_BUDGET = { banner: 3 * MB, social: 6 * MB }
const GIF_LOSSY = { banner: 0, social: 40 }
const FFMPEG = ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg', '/usr/bin/ffmpeg'].find(existsSync) ?? process.env.FFMPEG
const GIFSICLE = ['/opt/homebrew/bin/gifsicle', '/usr/local/bin/gifsicle', '/usr/bin/gifsicle'].find(existsSync)

const run = promisify(execFile)
const out = (concept, size, ext) => resolve(PUBLIC, motionAdExport(concept, size, ext).slice(1))

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' }

/** Static server for public/, so the ads load fonts and scripts over http exactly as an ad server would. */
function serve() {
  const server = createServer(async (req, res) => {
    const path = resolve(PUBLIC, `.${decodeURIComponent(new URL(req.url, 'http://x').pathname)}`)
    if (!path.startsWith(PUBLIC)) return res.writeHead(403).end()
    try {
      res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' }).end(await readFile(path))
    } catch {
      res.writeHead(404).end()
    }
  })
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)))
}

async function open(browser, base, concept, size, query) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height }, reducedMotion: 'no-preference' })
  await page.goto(`${base}/kit/motion/ads/${motionAdSlug(concept, size)}/index.html?${query}`)
  await page.waitForFunction(() => window.oneAd)
  await page.evaluate(() => window.oneAd.ready)
  return page
}

async function endFrame(page, concept, size) {
  await page.evaluate((t) => window.oneAd.seek(t), MOTION_AD_DURATION[concept])
  await page.screenshot({ path: out(concept, size, 'png') })
}

async function frames(page, concept, dir) {
  const count = Math.round(MOTION_AD_DURATION[concept] * FPS)
  for (let i = 0; i < count; i++) {
    await page.evaluate((t) => window.oneAd.seek(t), i / FPS)
    await page.screenshot({ path: join(dir, `${String(i).padStart(4, '0')}.png`) })
  }
  return count
}

async function encodeMp4(dir, file) {
  await run(FFMPEG, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(dir, '%04d.png'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file])
}

async function encodeGif(dir, file, { fps, colors, lossy }) {
  const filter = `fps=${fps},split[a][b];[a]palettegen=stats_mode=diff:max_colors=${colors}[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle`
  await run(FFMPEG, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(dir, '%04d.png'), '-filter_complex', filter, '-loop', '0', file])
  if (GIFSICLE) await run(GIFSICLE, ['-O3', ...(lossy ? [`--lossy=${lossy}`] : []), '--batch', file])
  return (await stat(file)).size
}

/**
 * Tries richer settings first and steps down until the GIF fits its budget. The 1080 GIFs always get gifsicle's lossy
 * pass (level 40: about 2.5x smaller, no visible banding on the gradients); the banner stays lossless.
 */
async function gifWithinBudget(dir, file, budget, lossy) {
  const steps = [
    { fps: GIF_FPS, colors: 256, lossy },
    { fps: GIF_FPS, colors: 128, lossy },
    { fps: 10, colors: 128, lossy },
    { fps: 10, colors: 64, lossy },
  ]
  for (const step of steps) {
    const bytes = await encodeGif(dir, file, step)
    if (bytes <= budget || step === steps.at(-1)) return { bytes, ...step }
  }
}

async function recordWebm(browser, base, concept, size) {
  const dir = await mkdtemp(join(tmpdir(), 'one-ad-webm-'))
  const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, recordVideo: { dir, size: { width: size.width, height: size.height } } })
  const page = await context.newPage()
  await page.goto(`${base}/kit/motion/ads/${motionAdSlug(concept, size)}/index.html`)
  await page.waitForTimeout((MOTION_AD_DURATION[concept] + 0.5) * 1000)
  const video = page.video()
  await context.close()
  await rename(await video.path(), out(concept, size, 'webm'))
  await rm(dir, { recursive: true, force: true })
}

const args = process.argv.slice(2)
const stillsOnly = args.includes('--stills')
const concepts = args.filter((a) => !a.startsWith('--')).filter((a) => MOTION_AD_CONCEPTS.includes(a))
await mkdir(resolve(PUBLIC, 'kit/motion/exports'), { recursive: true })
const server = await serve()
const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch()
const report = []
try {
  for (const concept of concepts.length ? concepts : MOTION_AD_CONCEPTS) {
    for (const size of MOTION_AD_SIZES) {
      const name = `${concept} ${size.width}x${size.height}`
      const page = await open(browser, base, concept, size, 'export')
      await endFrame(page, concept, size)
      if (stillsOnly) {
        await page.close()
        report.push(`${name}: end frame`)
        continue
      }
      if (!FFMPEG) {
        await page.close()
        await recordWebm(browser, base, concept, size)
        report.push(`${name}: WebM (real-time, no ffmpeg), no GIF`)
        continue
      }
      const dir = await mkdtemp(join(tmpdir(), 'one-ad-frames-'))
      try {
        const count = await frames(page, concept, dir)
        await page.close()
        await encodeMp4(dir, out(concept, size, 'mp4'))
        const mp4 = (await stat(out(concept, size, 'mp4'))).size
        const budget = GIF_BUDGET[size.scale]
        const gif = await gifWithinBudget(dir, out(concept, size, 'gif'), budget, GIF_LOSSY[size.scale])
        report.push(
          `${name}: ${count} frames, ${MOTION_AD_DURATION[concept]} s · MP4 ${(mp4 / MB).toFixed(2)} MB · GIF ${(gif.bytes / MB).toFixed(2)} MB at ${gif.fps} fps/${gif.colors} colours${gif.lossy ? `, lossy ${gif.lossy}` : ''}${gif.bytes > budget ? ' (OVER BUDGET)' : ''}`,
        )
      } finally {
        await rm(dir, { recursive: true, force: true })
      }
    }
  }
} finally {
  await browser.close()
  server.close()
}
console.log(report.join('\n'))
