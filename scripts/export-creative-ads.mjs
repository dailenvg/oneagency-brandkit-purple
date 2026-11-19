#!/usr/bin/env node
/**
 * Renders the creative ads (src/data/ad-creative.ts, drawn by src/components/ads/creative/) in headless Chromium through
 * the render-ad.html Vite entry, at true pixel size and in their final state, to
 *   public/kit/ads/creative/[concept]/one-agency_ad-[concept]_[WxH].png
 *   public/kit/ads/creative/[concept]/one-agency_ad-[concept]_[WxH].webp
 * optimises the PNGs losslessly with scripts/optimise-pngs.py (the same pass as kit:optimise, so the later full-kit pass
 * finds nothing left to shrink and the byte sizes stay true), then lists every file on disk in
 * src/data/ads-creative.generated.json (the hub's download links).
 *
 * Usage: node scripts/export-creative-ads.mjs [concept ...] [--format=square,story]   (npm run kit:ads)
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { CREATIVE_AD_SIZES, CREATIVE_CONCEPTS, creativeAdFile } from '../src/data/ad-creative.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = resolve(ROOT, 'public')
const MANIFEST = resolve(ROOT, 'src/data/ads-creative.generated.json')
const WEBP_QUALITY = 0.9

const args = process.argv.slice(2)
const formatArg = args.find((a) => a.startsWith('--format='))
const formats = formatArg ? formatArg.slice('--format='.length).split(',') : null
const ids = args.filter((a) => !a.startsWith('--'))
const concepts = CREATIVE_CONCEPTS.filter((c) => !ids.length || ids.includes(c.id))
const sizes = CREATIVE_AD_SIZES.filter((s) => !formats || formats.includes(s.format))
const disk = (url) => resolve(PUBLIC, url.slice(1))

/** PNG bytes to WebP bytes, encoded by the page's own canvas. */
async function toWebp(page, png, quality) {
  const bytes = await page.evaluate(
    async ({ dataUrl, quality }) => {
      const img = new Image()
      img.src = dataUrl
      await img.decode()
      const canvas = new OffscreenCanvas(img.naturalWidth, img.naturalHeight)
      canvas.getContext('2d').drawImage(img, 0, 0)
      const blob = await canvas.convertToBlob({ type: 'image/webp', quality })
      return [...new Uint8Array(await blob.arrayBuffer())]
    },
    { dataUrl: `data:image/png;base64,${png.toString('base64')}`, quality },
  )
  return Buffer.from(bytes)
}

/** Every exported file on disk, so a partial run still leaves a complete manifest. */
function writeManifest() {
  const items = CREATIVE_CONCEPTS.flatMap((c) =>
    CREATIVE_AD_SIZES.flatMap((s) => {
      const files = Object.fromEntries(
        ['png', 'webp'].flatMap((ext) => {
          const url = creativeAdFile(c.id, s, ext)
          return existsSync(disk(url)) ? [[ext, { url, bytes: statSync(disk(url)).size }]] : []
        }),
      )
      return Object.keys(files).length ? [{ concept: c.id, format: s.format, width: s.width, height: s.height, files }] : []
    }),
  )
  writeFileSync(MANIFEST, `${JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2)}\n`)
  return items.length
}

const server = await createServer({ root: ROOT, logLevel: 'error', server: { port: 5191, strictPort: false } })
await server.listen()
const base = server.resolvedUrls.local[0]
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ deviceScaleFactor: 1, reducedMotion: 'no-preference' })
  page.on('pageerror', (e) => console.error(`page error: ${e.message}`))
  await page.goto(`${base}render-ad.html`)
  await page.waitForFunction(() => typeof window.renderAd === 'function')
  for (const concept of concepts) {
    mkdirSync(dirname(disk(creativeAdFile(concept.id, sizes[0], 'png'))), { recursive: true })
    for (const size of sizes) {
      await page.setViewportSize({ width: size.width, height: size.height })
      await page.evaluate(([id, format]) => window.renderAd(id, format), [concept.id, size.format])
      const png = await page.screenshot({ clip: { x: 0, y: 0, width: size.width, height: size.height } })
      const webp = await toWebp(page, png, WEBP_QUALITY)
      writeFileSync(disk(creativeAdFile(concept.id, size, 'png')), png)
      writeFileSync(disk(creativeAdFile(concept.id, size, 'webp')), webp)
      console.log(`${concept.id.padEnd(20)} ${`${size.width}x${size.height}`.padEnd(10)} PNG ${(png.length / 1024).toFixed(0).padStart(5)} KB · WebP ${(webp.length / 1024).toFixed(0).padStart(4)} KB`)
    }
  }
} finally {
  await browser.close()
  await server.close()
}
/** The kit's lossless PNG pass on this folder only, before the manifest records the byte sizes. */
execFileSync('python3', [resolve(ROOT, 'scripts/optimise-pngs.py'), resolve(PUBLIC, 'kit/ads/creative')], { stdio: 'inherit' })
console.log(`Manifest: ${writeManifest()} ads in src/data/ads-creative.generated.json`)
