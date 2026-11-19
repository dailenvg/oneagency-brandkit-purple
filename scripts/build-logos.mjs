#!/usr/bin/env node
/**
 * Logo pack from the live master logo, design/source/one-agency-logo.svg
 * (= https://oneagency.com/assets/img/one-agency-logo.svg): the chrome ONE mark over a white "Agency".
 *
 * The mark is never redrawn. Every file reuses the master's path data unchanged; only fills (recolour) and placement
 * (re-layout) differ. Colours come from the extracted site tokens, so run `npm run kit:tokens` first.
 *
 * Writes to public/kit/logos/{stacked,horizontal,icon,favicon,social}/, public/favicon.ico and src/data/logos.ts.
 * Usage: node scripts/build-logos.mjs [--contact path/to/contact-sheet.png]
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { luminance, mixOklab, parseColour, toHex } from './lib/colour.mjs'
import { KIT } from '../src/lib/kit.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = `${ROOT}/public/kit/logos`
const URL_BASE = '/kit/logos'
const MASTER = readFileSync(`${ROOT}/design/source/one-agency-logo.svg`, 'utf8')
const TOKENS = JSON.parse(readFileSync(`${ROOT}/public/kit/colour/one-agency_tokens_web.json`, 'utf8')).tokens
const contactArg = process.argv.indexOf('--contact')
const CONTACT = contactArg > 0 ? resolve(process.argv[contactArg + 1]) : null

const token = (name) => TOKENS.find((t) => t.name === name)
const GROUND = token('--ground').hex
const INK = token('--ink').hex
const PAPER = token('--paper').hex
const TEXT_2 = token('--text-2').hex
const TEXT_4 = token('--text-4').hex
const BAR = token('--bar').value

/** 1x PNG width per lockup; @2x and @4x follow. */
const PNG_WIDTH = { stacked: 480, horizontal: 720, icon: 320 }
const SCALES = [1, 2, 4]

/** Horizontal lockup gap between the mark and "Agency", as a share of the mark height. Wider than "Agency"'s own letter gaps. */
const HORIZONTAL_GAP = 0.6

/**
 * Favicon crop: the "O" of the mark alone, as on the live site's favicon (oneagency.com/assets/img/favicon-192.png).
 * 338.01 is the O's outer right edge in the master (cls-6 path: 254.31 + 83.7). The O fills 65% of the tile width.
 */
const O_RIGHT = 338.01
const FAVICON_FILL = 0.65

const VARIANTS = {
  'on-dark': { label: 'On dark', ground: '--ground', note: 'Master colours: chrome mark, white Agency.' },
  'on-light': { label: 'On light', ground: '--paper', note: 'Derived: chrome remapped from --ink (shadows) to --text-4 (highlights); Agency in --ink.' },
  white: { label: 'White (one colour)', ground: '--ground', note: 'Single colour --paper (#ffffff) for dark grounds and photos.' },
  ink: { label: 'Ink (one colour)', ground: '--paper', note: 'Single colour --ink (#01030f) for light grounds.' },
}

const master = parseMaster(MASTER)
const browser = await chromium.launch()
const page = await (await browser.newContext({ deviceScaleFactor: 1 })).newPage()

async function main() {
  rmSync(OUT, { recursive: true, force: true })
  const bounds = await measure(master)
  const layouts = buildLayouts(bounds)
  const logos = []
  for (const [lockup, layout] of Object.entries(layouts)) {
    for (const variant of Object.keys(VARIANTS)) logos.push(await writeLockup(lockup, variant, layout))
  }
  const favicons = await writeFavicons(bounds)
  const social = await writeSocial(svgFor(layouts.stacked, 'on-dark', 'oa-social'))
  writeManifest(logos, favicons, social)
  if (CONTACT) await writeContactSheet(logos, favicons, social, bounds)
  console.log(`logo files: ${logos.length * (1 + SCALES.length)} · favicons: ${favicons.length} · social: ${social.length}${CONTACT ? ` · contact sheet: ${CONTACT}` : ''}`)
}

/* ---------------------------------------------------------------- master */

/** Gradients (with xlink:href stops resolved), and the mark and "Agency" path lists with their master fills. */
function parseMaster(svg) {
  const fills = Object.fromEntries([...svg.matchAll(/\.(cls-\d+)\s*\{\s*fill:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
  const gradients = new Map()
  for (const m of svg.matchAll(/<linearGradient\s([^>]*?)>([\s\S]*?)<\/linearGradient>/g)) {
    const attrs = Object.fromEntries([...m[1].matchAll(/([\w:-]+)="([^"]*)"/g)].map((a) => [a[1], a[2]]))
    const stops = [...m[2].matchAll(/<stop\s+offset="([^"]+)"\s+stop-color="([^"]+)"/g)].map((s) => ({ offset: s[1], color: s[2] }))
    gradients.set(attrs.id, { attrs, stops })
  }
  for (const g of gradients.values()) {
    const ref = g.attrs['xlink:href'] ?? g.attrs.href
    if (ref && !g.stops.length) g.stops = gradients.get(ref.slice(1)).stops
    delete g.attrs['xlink:href']
    delete g.attrs.href
  }
  const groups = [...svg.matchAll(/<g>\s*((?:<path[^>]*>\s*(?:<\/path>)?\s*)+)<\/g>/g)].map((m) =>
    [...m[1].matchAll(/<path class="(cls-\d+)" d="([^"]+)"/g)].map((p) => ({ d: p[2], fill: fills[p[1]] })),
  )
  if (groups.length !== 2) throw new Error(`Expected the mark and "Agency" groups in the master, found ${groups.length}`)
  return { gradients, mark: groups[0], agency: groups[1] }
}

/** Tight bounds of the mark and "Agency", measured by the browser from the real geometry. */
async function measure(m) {
  const paths = (list) => `<g>${list.map((p) => `<path d="${p.d}"/>`).join('')}</g>`
  await page.setContent(`<svg xmlns="http://www.w3.org/2000/svg">${paths(m.mark)}${paths(m.agency)}</svg>`)
  const [mark, agency] = await page.evaluate(() => [...document.querySelectorAll('svg > g')].map((g) => {
    const b = g.getBBox()
    return { x: b.x, y: b.y, w: b.width, h: b.height }
  }))
  return { mark, agency }
}

/* ---------------------------------------------------------------- layout */

const r2 = (n) => Math.round(n * 100) / 100

function union(...boxes) {
  const x = Math.min(...boxes.map((b) => b.x))
  const y = Math.min(...boxes.map((b) => b.y))
  return { x, y, w: Math.max(...boxes.map((b) => b.x + b.w)) - x, h: Math.max(...boxes.map((b) => b.y + b.h)) - y }
}

const moved = (b, dx, dy) => ({ ...b, x: b.x + dx, y: b.y + dy })

function buildLayouts({ mark, agency }) {
  const dx = mark.x + mark.w + mark.h * HORIZONTAL_GAP - agency.x
  const dy = mark.y + mark.h / 2 - (agency.y + agency.h / 2)
  return {
    stacked: { primary: true, label: 'Stacked (primary, master layout)', parts: [['mark', 0, 0], ['agency', 0, 0]], box: union(mark, agency) },
    horizontal: { primary: false, label: 'Horizontal', parts: [['mark', 0, 0], ['agency', dx, dy]], box: union(mark, moved(agency, dx, dy)) },
    icon: { primary: false, label: 'Icon (ONE mark)', parts: [['mark', 0, 0]], box: mark },
  }
}

/* ---------------------------------------------------------------- paint */

/** Every chrome colour in the mark: gradient stops and the flat base fill. */
const chromeColours = [...[...master.gradients.values()].flatMap((g) => g.stops.map((s) => s.color)), ...master.mark.filter((p) => p.fill.startsWith('#')).map((p) => p.fill)]
const chromeLum = chromeColours.map((c) => luminance(parseColour(c)))
const [lumMin, lumMax] = [Math.min(...chromeLum), Math.max(...chromeLum)]

/** On-light chrome: keeps the master's light/dark banding, mapped into a dark range from --ink to --text-4. */
function darkChrome(colour) {
  const k = (luminance(parseColour(colour)) - lumMin) / (lumMax - lumMin)
  return toHex(mixOklab(parseColour(INK), parseColour(TEXT_4), k))
}

/** Fill for one master path in a variant, plus any gradient it needs. */
function painter(variant, prefix) {
  const defs = new Map()
  const flat = { white: PAPER, ink: INK }[variant]
  const gradient = (id) => {
    const g = master.gradients.get(id)
    const newId = `${prefix}-g${[...master.gradients.keys()].indexOf(id) + 1}`
    const attrs = Object.entries({ ...g.attrs, id: newId }).map(([k, v]) => `${k}="${v}"`).join(' ')
    const stops = g.stops.map((s) => `<stop offset="${s.offset}" stop-color="${variant === 'on-light' ? darkChrome(s.color) : s.color}"/>`).join('')
    defs.set(newId, `<linearGradient ${attrs}>${stops}</linearGradient>`)
    return `url(#${newId})`
  }
  return {
    mark: (fill) => {
      if (flat) return flat
      const ref = fill.match(/^url\(#(.+)\)$/)
      if (ref) return gradient(ref[1])
      return variant === 'on-light' ? darkChrome(fill) : fill
    },
    agency: (fill) => ({ 'on-dark': fill, 'on-light': INK, white: PAPER, ink: INK })[variant],
    defs: () => [...defs.values()].join(''),
  }
}

/** Clean SVG for a layout in a variant. `clip` crops the mark (used for the favicon O). */
function svgFor(layout, variant, prefix, { clip, title = 'ONE Agency' } = {}) {
  const paint = painter(variant, prefix)
  const box = clip ?? layout.box
  const parts = layout.parts.map(([part, dx, dy]) => {
    const paths = master[part].map((p) => `<path fill="${paint[part](p.fill)}" d="${p.d}"/>`).join('')
    const move = dx || dy ? ` transform="translate(${r2(dx)} ${r2(dy)})"` : ''
    return `<g${move}>${paths}</g>`
  })
  const clipDef = clip ? `<clipPath id="${prefix}-clip"><rect x="${r2(clip.x)}" y="${r2(clip.y)}" width="${r2(clip.w)}" height="${r2(clip.h)}"/></clipPath>` : ''
  const defs = paint.defs() + clipDef
  const inner = `<g transform="translate(${r2(-box.x)} ${r2(-box.y)})"${clip ? ` clip-path="url(#${prefix}-clip)"` : ''}>${parts.join('')}</g>`
  const [w, h] = [r2(box.w), r2(box.h)]
  return {
    width: w,
    height: h,
    inner: (defs ? `<defs>${defs}</defs>` : '') + inner,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}"><title>${title}</title>${defs ? `<defs>${defs}</defs>` : ''}${inner}</svg>\n`,
  }
}

/* ---------------------------------------------------------------- files */

function save(rel, data) {
  const path = `${OUT}/${rel}`
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, data)
  return { url: `${URL_BASE}/${rel}`, bytes: Buffer.byteLength(data) }
}

const dataUri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`

/** Renders HTML at an exact pixel size; transparent unless the HTML paints a background. */
async function shoot(html, width, height) {
  await page.setViewportSize({ width: Math.max(width, 64), height: Math.max(height, 64) })
  await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:transparent}</style></head><body>${html}</body></html>`)
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map((img) => img.decode()))
  })
  return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width, height } })
}

const imgTag = (svg, width, height) => `<img src="${dataUri(svg)}" width="${width}" height="${height}" style="display:block;width:${width}px;height:${height}px" alt="">`

async function writeLockup(lockup, variant, layout) {
  const name = `one-agency_logo_${lockup}-${variant}`
  const doc = svgFor(layout, variant, `oa-${lockup[0]}${variant.replace(/[^a-z]/g, '').slice(0, 3)}`)
  const svg = save(`${lockup}/${name}.svg`, doc.svg)
  const pngs = []
  for (const scale of SCALES) {
    const width = PNG_WIDTH[lockup] * scale
    const height = Math.round((width * doc.height) / doc.width)
    const file = save(`${lockup}/${name}_${scale}x.png`, await shoot(imgTag(doc.svg, width, height), width, height))
    pngs.push({ scale, width, height, ...file })
  }
  return { lockup, variant, primary: layout.primary, lockupLabel: layout.label, ...VARIANTS[variant], svg: { ...svg, width: doc.width, height: doc.height }, pngs }
}

/** Favicon tile: the O crop on --ground, full bleed (platforms round the corners themselves). */
function faviconSvg(bounds, mode = 'o') {
  const markOnly = { parts: [['mark', 0, 0]], box: bounds.mark }
  const clip = mode === 'o' ? { x: bounds.mark.x, y: bounds.mark.y, w: O_RIGHT - bounds.mark.x, h: bounds.mark.h } : null
  const glyph = svgFor(markOnly, 'on-dark', `oa-fav${mode}`, { clip })
  const size = r2(glyph.width / FAVICON_FILL)
  const [x, y] = [r2((size - glyph.width) / 2), r2((size - glyph.height) / 2)]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="ONE Agency"><title>ONE Agency</title><rect width="${size}" height="${size}" fill="${GROUND}"/><svg x="${x}" y="${y}" width="${glyph.width}" height="${glyph.height}" viewBox="0 0 ${glyph.width} ${glyph.height}">${glyph.inner}</svg></svg>\n`
}

async function writeFavicons(bounds) {
  const svg = faviconSvg(bounds)
  const out = [{ kind: 'svg', width: null, height: null, ...save('favicon/one-agency_logo_favicon.svg', svg) }]
  const png = async (size) => shoot(imgTag(svg, size, size), size, size)
  const icoParts = []
  for (const size of [16, 32, 48]) {
    const buf = await png(size)
    icoParts.push({ size, buf })
    out.push({ kind: 'png', width: size, height: size, ...save(`favicon/one-agency_logo_favicon_${size}x${size}.png`, buf) })
  }
  const ico = icoFile(icoParts)
  out.push({ kind: 'ico', width: 48, height: 48, ...save('favicon/one-agency_logo_favicon.ico', ico) })
  writeFileSync(`${ROOT}/public/favicon.ico`, ico)
  out.push({ kind: 'apple-touch-icon', width: 180, height: 180, ...save('favicon/one-agency_logo_apple-touch-icon_180x180.png', await png(180)) })
  for (const size of [192, 512]) out.push({ kind: 'app-icon', width: size, height: size, ...save(`favicon/one-agency_logo_app-icon_${size}x${size}.png`, await png(size)) })
  return out
}

/** ICO container holding PNG-compressed entries (supported by every current browser and OS). */
function icoFile(parts) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(parts.length, 4)
  let offset = 6 + 16 * parts.length
  const entries = parts.map(({ size, buf }) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(size % 256, 0)
    e.writeUInt8(size % 256, 1)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(buf.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += buf.length
    return e
  })
  return Buffer.concat([header, ...entries, ...parts.map((p) => p.buf)])
}

function fontFace(family, weight, file) {
  const b64 = readFileSync(`${ROOT}/public/kit/fonts/${file}`).toString('base64')
  return `@font-face{font-family:"${family}";font-weight:${weight};src:url(data:font/woff2;base64,${b64}) format("woff2")}`
}

/** Social avatar (stacked logo on --ground, inside the circle crop) and the OG link-preview image. */
async function writeSocial(stacked) {
  const out = []
  const avatarW = 660
  const avatarH = Math.round((avatarW * stacked.height) / stacked.width)
  const avatar = `<div style="width:1080px;height:1080px;background:${GROUND};display:grid;place-items:center">${imgTag(stacked.svg, avatarW, avatarH)}</div>`
  out.push({ kind: 'avatar', width: 1080, height: 1080, ...save('social/one-agency_logo_social-avatar_1080x1080.png', await shoot(avatar, 1080, 1080)) })

  const ogW = 520
  const ogH = Math.round((ogW * stacked.height) / stacked.width)
  const og = `<style>${fontFace('Geist', 500, 'one-agency_font_geist-500.woff2')}</style>
    <div style="width:1200px;height:630px;background:${GROUND};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;font-family:Geist,sans-serif">
      ${imgTag(stacked.svg, ogW, ogH)}
      <div style="width:200px;height:6px;border-radius:6px;background:${BAR}"></div>
      <div style="color:${TEXT_2};font-size:30px;font-weight:500;letter-spacing:-0.01em">Brand kit v${KIT.version} · ${KIT.updated}</div>
    </div>`
  out.push({ kind: 'og', width: 1200, height: 630, ...save('social/one-agency_logo_og-image_1200x630.png', await shoot(og, 1200, 630)) })
  return out
}

/* ---------------------------------------------------------------- manifest */

function writeManifest(logos, favicons, social) {
  const json = (v) => JSON.stringify(v, null, 2)
  writeFileSync(
    `${ROOT}/src/data/logos.ts`,
    `/* GENERATED by scripts/build-logos.mjs. Do not edit; run \`npm run kit:logos\`. */

export type LogoLockup = 'stacked' | 'horizontal' | 'icon'
export type LogoVariant = 'on-dark' | 'on-light' | 'white' | 'ink'

export interface AssetFile {
  /** Public URL path. */
  url: string
  bytes: number
}

export interface LogoPng extends AssetFile {
  scale: number
  width: number
  height: number
}

export interface LogoAsset {
  lockup: LogoLockup
  variant: LogoVariant
  /** The master layout: use this one unless space dictates otherwise. */
  primary: boolean
  lockupLabel: string
  label: string
  /** Token of the ground this variant is made for. */
  ground: string
  note: string
  svg: AssetFile & { width: number; height: number }
  pngs: LogoPng[]
}

export interface IconFile extends AssetFile {
  kind: string
  width: number | null
  height: number | null
}

export const LOGOS: LogoAsset[] = ${json(logos)}

export const FAVICONS: IconFile[] = ${json(favicons)}

export const SOCIAL_IMAGES: IconFile[] = ${json(social)}
`,
  )
}

/* ---------------------------------------------------------------- review */

/** One PNG of every variant on its intended ground, plus favicons and social images, for design review. */
async function writeContactSheet(logos, favicons, social, bounds) {
  const read = (url) => `data:image/png;base64,${readFileSync(`${ROOT}/public${url}`).toString('base64')}`
  const svgSrc = (url) => dataUri(readFileSync(`${ROOT}/public${url}`, 'utf8'))
  const groundOf = (t) => token(t).hex
  const tile = (l) => `
    <figure style="margin:0">
      <div style="background:${groundOf(l.ground)};border-radius:16px;height:200px;display:grid;place-items:center;padding:24px;box-sizing:border-box;${l.ground === '--paper' ? 'box-shadow:inset 0 0 0 1px #d6d8e0' : ''}">
        <img src="${svgSrc(l.svg.url)}" style="max-width:${l.lockup === 'horizontal' ? 92 : 78}%;max-height:${l.lockup === 'icon' ? 70 : 150}px">
      </div>
      <figcaption>${l.lockupLabel} · ${l.label}<br><code>${l.svg.url.split('/').pop()}</code></figcaption>
    </figure>`
  const fav = (f, shown) => `<figure style="margin:0"><img src="${read(f.url)}" style="width:${shown}px;height:${shown}px;image-rendering:pixelated;border-radius:6px;display:block"><figcaption>${f.width}px${shown !== f.width ? ` (shown at ${shown})` : ''}</figcaption></figure>`
  const pngFavs = favicons.filter((f) => f.url.endsWith('.png'))
  const fullMarkAlt = faviconSvg(bounds, 'one')
  const html = `<style>${fontFace('Geist', 400, 'one-agency_font_geist-400.woff2')}${fontFace('Geist', 600, 'one-agency_font_geist-600.woff2')}
      body{font-family:Geist,sans-serif;background:#eef0f4;color:${INK}}
      figcaption{font-size:13px;line-height:1.4;margin-top:8px;color:#444}
      code{font-size:11px;color:#616161}
      h2{font-size:20px;font-weight:600;margin:40px 0 16px}
    </style>
    <div style="width:1600px;padding:48px;box-sizing:border-box">
      <h1 style="font-size:30px;font-weight:600;margin:0">ONE Agency logo pack: contact sheet</h1>
      <p style="margin:6px 0 0;color:#444">Master: oneagency.com/assets/img/one-agency-logo.svg. Shapes unchanged; recolour and re-layout only. Generated by scripts/build-logos.mjs.</p>
      ${['stacked', 'horizontal', 'icon'].map((k) => `<h2>${logos.find((l) => l.lockup === k).lockupLabel}</h2><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px">${logos.filter((l) => l.lockup === k).map(tile).join('')}</div>`).join('')}
      <h2>Favicons: the "O" crop, following the live site's favicon</h2>
      <div style="display:flex;gap:28px;align-items:flex-end">
        ${pngFavs.map((f) => fav(f, f.width <= 48 ? f.width * 4 : Math.min(f.width, 192))).join('')}
        ${pngFavs.filter((f) => f.width <= 32).map((f) => fav(f, f.width)).join('')}
        <figure style="margin:0 0 0 40px"><img src="${dataUri(fullMarkAlt)}" style="width:128px;height:128px;border-radius:6px;display:block"><figcaption>Not shipped: full ONE mark<br>as a favicon, for comparison</figcaption></figure>
        <figure style="margin:0"><img src="${dataUri(fullMarkAlt)}" style="width:32px;height:32px;display:block"><figcaption>same at 32px</figcaption></figure>
      </div>
      <h2>Social</h2>
      <div style="display:flex;gap:28px;align-items:flex-start">
        ${social.map((s) => `<figure style="margin:0"><img src="${read(s.url)}" style="height:315px;border-radius:12px;display:block"><figcaption><code>${s.url.split('/').pop()}</code></figcaption></figure>`).join('')}
      </div>
    </div>`
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.setContent(`<!doctype html><html><body style="margin:0">${html}</body></html>`)
  await page.evaluate(() => document.fonts.ready)
  mkdirSync(dirname(CONTACT), { recursive: true })
  await page.screenshot({ path: CONTACT, fullPage: true })
}

try {
  await main()
} finally {
  await browser.close()
}
