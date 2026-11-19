#!/usr/bin/env node
/**
 * The Möbius loop as ad stills, in public/kit/elements/mobius/:
 *   one-agency_element_mobius-[look]-[crop]-[ground]_[WxH].[jpg|png]
 * and a half-size WebP of each in public/previews/elements/mobius/ for the hub (not part of the kit). Looks, crops,
 * grounds and sizes are src/data/mobius.ts; ground colours come from src/data/tokens.ts.
 *
 * The loop is always big and cropped: a background graphic that bleeds off the frame like the loop behind the
 * oneagency.com hero. Each crop puts one point of the loop (an anchor on its bounding box) at one point of the format,
 * at two to three times the format's short side, and whatever falls outside is cut off.
 *
 * The loop is the vendored <ciq-loop> web component (public/vendor/ciq/ciq-loop.js), drawn with WebGL, so these are
 * rasters only. The file is loaded as is; everything below happens in the capture page around it:
 *
 *   One moment. Math.random is seeded and requestAnimationFrame is driven by the script, so the loop's clock walks to
 *   FRAME_MS the same way every run; then it is paused. Every still shows the same frame.
 *
 *   The whole loop. The component composes the loop as a bleed (radius 0.62 of the short side, centre at 58% of the
 *   height), so it always runs off its own canvas. Its shaders map scene pixels through two uniforms, uRes and uOY,
 *   and its comment says they "may reach past" the canvas; the component just never asks. The page wraps the WebGL
 *   context so the drawing buffer gets BLEED of extra height above and below and the scene is offset into the middle.
 *   The complete loop lands in the buffer and is read back with readPixels (the buffer is not preserved, so each read
 *   redraws the paused frame first).
 *
 *   Native size. The loop is drawn at a few sizes (NATIVE, device px of its width, at devicePixelRatio 2 as on a
 *   phone), and each crop is cut from the smallest one at least as large as the loop it places, so it is only ever
 *   scaled down a little and its lines keep the fine weight they have on the site.
 *
 * Usage: node scripts/build-mobius.mjs   (npm run kit:mobius)
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { MOBIUS_CROPS, MOBIUS_DIR, MOBIUS_LOOKS, MOBIUS_PREVIEWS_DIR, MOBIUS_SIZES, mobiusFileName, mobiusPlacement } from '../src/data/mobius.ts'
import { TOKENS } from '../src/data/tokens.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, `public${MOBIUS_DIR}`)
const PREVIEWS = resolve(ROOT, `public${MOBIUS_PREVIEWS_DIR}`)
const LOOP_JS = resolve(ROOT, 'public/vendor/ciq/ciq-loop.js')

/** The chosen moment, ms on the loop's clock: both half-twists read, top and bottom centre. */
const FRAME_MS = 44000
/** Clock step while walking to the frame (the component caps a frame's step at 100 ms). */
const STEP_MS = 100
const DPR = 2
/** Canvas the loop is drawn on: wide enough for it side to side, BLEED of its height added above and below. */
const ASPECT = 2.6
const BLEED = 0.5
/** Widths the loop is drawn at natively, device px. The largest covers the biggest crop (sweep, 2.6 x 1080). */
const NATIVE = [1500, 2300, 3000]
/** Probe canvas height (CSS px), for measuring the loop before the real renders. */
const PROBE_H = 200
/** A pixel counts as the loop above this alpha (0 to 255), so faint haze does not move the framing. */
const ALPHA_EDGE = 20
const JPG_QUALITY = 0.9
const PREVIEW_QUALITY = 0.82

const hex = (name) => {
  const t = TOKENS.find((x) => x.name === name)
  if (!t?.hex) throw new Error(`No hex for ${name}`)
  return t.hex
}

/**
 * Runs in the page before the loop loads: a seeded Math.random, a requestAnimationFrame only window.__step moves, the
 * WebGL bleed (window.__bleed, CSS px), window.__read (reads the paused frame back and finds the loop) and
 * window.__place (puts the last read loop into a format).
 */
function capturePage(alphaEdge) {
  let seed = 7
  Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  let queue = []
  let now = 0
  window.requestAnimationFrame = (cb) => queue.push(cb)
  window.cancelAnimationFrame = () => {}
  window.__step = (frames, dt) => {
    for (let i = 0; i < frames; i++) {
      now += dt
      const due = queue
      queue = []
      due.forEach((cb) => cb(now))
    }
  }

  window.__bleed = 0
  const names = new WeakMap()
  const gl = WebGLRenderingContext.prototype
  const { getUniformLocation, uniform2f, uniform1f, viewport } = gl
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2)
  gl.getUniformLocation = function (program, name) {
    const loc = getUniformLocation.call(this, program, name)
    if (loc) names.set(loc, name)
    return loc
  }
  gl.uniform2f = function (loc, x, y) {
    return uniform2f.call(this, loc, x, names.get(loc) === 'uRes' ? y + 2 * window.__bleed : y)
  }
  gl.uniform1f = function (loc, v) {
    return uniform1f.call(this, loc, names.get(loc) === 'uOY' ? v + window.__bleed : v)
  }
  gl.viewport = function (x, y, w, h) {
    const full = h + Math.round(2 * window.__bleed * dpr())
    if (this.canvas.height !== full) this.canvas.height = full
    return viewport.call(this, x, y, w, full)
  }

  /** Redraws the paused frame and reads it back in the same task: un-premultiplied pixels and the loop's bounds. */
  window.__read = () => {
    const el = document.querySelector('ciq-loop')
    el.setAttribute('theme', el.getAttribute('theme'))
    const cv = el.shadowRoot.querySelector('canvas.gl')
    const ctx = cv.getContext('webgl')
    const { width: w, height: h } = cv
    const px = new Uint8Array(w * h * 4)
    ctx.readPixels(0, 0, w, h, ctx.RGBA, ctx.UNSIGNED_BYTE, px)
    const img = new ImageData(w, h)
    let x0 = w
    let y0 = h
    let x1 = -1
    let y1 = -1
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = ((h - 1 - y) * w + x) * 4
        const o = (y * w + x) * 4
        const a = px[i + 3]
        if (!a) continue
        for (let c = 0; c < 3; c++) img.data[o + c] = Math.min(255, Math.round((px[i + c] * 255) / a))
        img.data[o + 3] = a
        if (a > alphaEdge) {
          x0 = Math.min(x0, x)
          x1 = Math.max(x1, x)
          y0 = Math.min(y0, y)
          y1 = Math.max(y1, y)
        }
      }
    const source = document.createElement('canvas')
    source.width = w
    source.height = h
    source.getContext('2d').putImageData(img, 0, 0)
    const box = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }
    window.__src = { source, box }
    return { box, touches: x0 <= 0 || y0 <= 0 || x1 >= w - 1 || y1 >= h - 1, ratio: box.w / window.innerHeight }
  }

  /**
   * Places the last read loop in a w x h format: its width `width` px, the anchor point of its bounding box (fractions)
   * at `to` (fractions of the format). Once per ground (null: transparent); each output comes with a half-size WebP.
   */
  window.__place = (w, h, width, anchor, to, outputs, previewQuality) => {
    const { source, box } = window.__src
    const s = width / box.w
    const dx = to[0] * w - anchor[0] * box.w * s
    const dy = to[1] * h - anchor[1] * box.h * s
    const out = document.createElement('canvas')
    out.width = w
    out.height = h
    const g = out.getContext('2d')
    g.imageSmoothingQuality = 'high'
    const preview = document.createElement('canvas')
    preview.width = w / 2
    preview.height = h / 2
    const pg = preview.getContext('2d')
    pg.imageSmoothingQuality = 'high'
    return outputs.map(({ ground, type, quality }) => {
      g.clearRect(0, 0, w, h)
      if (ground) {
        g.fillStyle = ground
        g.fillRect(0, 0, w, h)
      }
      g.drawImage(source, box.x, box.y, box.w, box.h, dx, dy, box.w * s, box.h * s)
      pg.clearRect(0, 0, w / 2, h / 2)
      pg.drawImage(out, 0, 0, w / 2, h / 2)
      return {
        file: out.toDataURL(type, quality).split(',')[1],
        preview: preview.toDataURL('image/webp', previewQuality).split(',')[1],
      }
    })
  }
}

/** Renders every ground drawn in one theme: the loop runs once; each ground is the same frame, placed per crop and size. */
async function renderLook(browser, look, theme) {
  const grounds = look.grounds.filter((g) => g.theme === theme)
  const outputs = grounds.map((g) => ({ ground: g.ground ? hex(g.ground) : null, type: g.format === 'jpg' ? 'image/jpeg' : 'image/png', quality: g.format === 'jpg' ? JPG_QUALITY : undefined }))
  const page = await browser.newPage({ viewport: { width: Math.round(PROBE_H * ASPECT), height: PROBE_H }, deviceScaleFactor: DPR })
  await page.setContent(
    `<body style="margin:0;background:transparent"><ciq-loop look="${look.id}" shape="mobius" place="center" theme="${theme}" background="none" style="display:block;width:100vw;height:100vh"></ciq-loop></body>`,
  )
  await page.evaluate(capturePage, ALPHA_EDGE)
  await page.evaluate((b) => (window.__bleed = b), Math.round(PROBE_H * BLEED))
  await page.addScriptTag({ path: LOOP_JS })
  await page.evaluate(() => customElements.whenDefined('ciq-loop'))
  await page.evaluate(([frames, dt]) => window.__step(frames, dt), [FRAME_MS / STEP_MS, STEP_MS])
  await page.evaluate(() => document.querySelector('ciq-loop').setAttribute('paused', ''))
  await page.waitForTimeout(150)
  const probe = await page.evaluate(() => window.__read())
  if (probe.touches) throw new Error(`${look.id} ${theme}: the loop touches the probe canvas edge`)

  // Every still to make, with the loop width it needs and the native render it is cut from.
  const jobs = MOBIUS_CROPS.flatMap((crop) =>
    MOBIUS_SIZES.map((size) => {
      const p = mobiusPlacement(crop, size)
      const width = Math.round(p.scale * Math.min(size.width, size.height))
      return { crop, size, p, width, native: NATIVE.find((n) => n >= width * 0.98) ?? NATIVE[NATIVE.length - 1] }
    }),
  )

  let count = 0
  for (const native of NATIVE) {
    const todo = jobs.filter((j) => j.native === native)
    if (!todo.length) continue
    // Size the element so the loop is drawn `native` device px wide, and let its ResizeObserver redraw first.
    const h = Math.round(native / probe.ratio)
    await page.evaluate((b) => (window.__bleed = b), Math.round(h * BLEED))
    await page.setViewportSize({ width: Math.round(h * ASPECT), height: h })
    await page.waitForTimeout(250)
    const { touches } = await page.evaluate(() => window.__read())
    if (touches) throw new Error(`${look.id} ${theme}: the loop touches the canvas edge at ${native} px: raise BLEED or ASPECT`)
    for (const { crop, size, p, width } of todo) {
      const results = await page.evaluate(([W, H, L, a, t, o, q]) => window.__place(W, H, L, a, t, o, q), [size.width, size.height, width, p.anchor, p.to, outputs, PREVIEW_QUALITY])
      results.forEach(({ file, preview }, i) => {
        const name = mobiusFileName(look, crop, grounds[i], size)
        writeFileSync(resolve(OUT, name), Buffer.from(file, 'base64'))
        writeFileSync(resolve(PREVIEWS, name.replace(/\.(png|jpg)$/, '.webp')), Buffer.from(preview, 'base64'))
        count++
      })
    }
  }
  await page.close()
  return count
}

// Start clean, so a renamed or dropped crop never leaves a stale file in the kit.
rmSync(OUT, { recursive: true, force: true })
rmSync(PREVIEWS, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
mkdirSync(PREVIEWS, { recursive: true })
const browser = await chromium.launch()
let count = 0
try {
  for (const look of MOBIUS_LOOKS) for (const theme of new Set(look.grounds.map((g) => g.theme))) count += await renderLook(browser, look, theme)
} finally {
  await browser.close()
}

console.log(`mobius: ${count} stills (and WebP previews), ${MOBIUS_CROPS.length} crops x ${MOBIUS_SIZES.length} sizes, in public${MOBIUS_DIR}`)
