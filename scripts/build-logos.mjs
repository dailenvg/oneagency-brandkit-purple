#!/usr/bin/env node
/**
 * Logo pack from the moodboard masters in design/source/rebrand/ (Figma file Ex4UgCrCeAKPnv8H6BdHMm, node 133:305,
 * written by design/source/rebrand/build-source.mjs): the ONE wordmark with its Violet-to-Mint gradient, AGENCY, the
 * "O" mark and the three app tiles.
 *
 * The artwork is never redrawn. Every file reuses a master's paths and placement unchanged; only fills differ
 * (recolour). The gradient is the master's own, stops and coordinates as drawn. Colours come from the generated
 * tokens, so run `npm run kit:tokens` first.
 *
 * Writes to public/kit/logos/{horizontal,stacked,wordmark,mark,tile,favicon,social}/, public/favicon.ico and
 * src/data/logos.ts.
 * Usage: node scripts/build-logos.mjs [--contact path/to/contact-sheet.png]
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { KIT } from '../src/lib/kit.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MASTERS = `${ROOT}/design/source/rebrand`
const OUT = `${ROOT}/public/kit/logos`
const URL_BASE = '/kit/logos'
const TOKENS = JSON.parse(readFileSync(`${ROOT}/public/kit/colour/one-agency_tokens_web.json`, 'utf8')).tokens
const contactArg = process.argv.indexOf('--contact')
const CONTACT = contactArg > 0 ? resolve(process.argv[contactArg + 1]) : null

const hex = (name) => {
  const t = TOKENS.find((x) => x.name === name)
  if (!t?.hex) throw new Error(`No hex for ${name}`)
  return t.hex
}
const NAVY = hex('--navy')
const MINT = hex('--mint')
const PAPER = hex('--paper')
const TEXT_2 = hex('--text-2')
const GRADIENT = TOKENS.find((t) => t.name === '--gradient').value.replace(/var\((--[\w-]+)\)/g, (_, n) => hex(n))

/** Lockups, each from its master, in the order the Logo view shows them. 1x PNG width; @2x and @4x follow. */
const LOCKUPS = {
  horizontal: { master: 'logo_horizontal_gradient-navy.svg', primary: true, label: 'Horizontal (primary, master layout)', png: 960 },
  stacked: { master: 'logo_stacked_gradient-navy.svg', primary: false, label: 'Stacked', png: 480 },
  wordmark: { master: 'wordmark-one_gradient.svg', primary: false, label: 'Wordmark (ONE)', png: 480 },
  mark: { master: 'mark_gradient.svg', primary: false, label: 'Mark (the O)', png: 240 },
}
const SCALES = [1, 2, 4]

/**
 * Colour variants. `one` fills ONE (or the mark), `agency` fills AGENCY; 'gradient' keeps the master's own gradient.
 * The first two are the board's colourways; the one-colour versions are for single-colour reproduction.
 */
const VARIANTS = {
  'on-light': { label: 'Gradient on light', ground: '--paper', one: 'gradient', agency: NAVY, note: 'As drawn on the board: the Violet-to-Mint gradient, AGENCY in Navy. For white, Mist and Sky grounds.' },
  'on-navy': { label: 'Mint and white on navy', ground: '--navy', one: MINT, agency: PAPER, note: 'The reversed version from the board: ONE in Mint, AGENCY in white. For Navy and dark photos.' },
  navy: { label: 'Navy (one colour)', ground: '--paper', one: NAVY, agency: NAVY, note: 'Single colour Navy, as on the board. When the gradient cannot print or render.' },
  white: { label: 'White (one colour)', ground: '--navy', one: PAPER, agency: PAPER, note: 'Single colour white for dark grounds and photos where Mint would clash.' },
}

/** App tiles from the board: 855 square, radius 210, the mark centred. */
const TILES = {
  sky: { master: 'icon_sky_gradient.svg', label: 'Sky tile', note: 'Sky ground, gradient mark. The light app icon.' },
  navy: { master: 'icon_navy_mint.svg', label: 'Navy tile', note: 'Navy ground, Mint mark. The default app icon and favicon.' },
  mint: { master: 'icon_mint_navy.svg', label: 'Mint tile', note: 'Mint ground, Navy mark. For launches and highlights.' },
}
const TILE_PNG = 256

/**
 * Favicons: the navy tile. Below 64 px the board's mark (57% of the tile) gets small, so the favicon tile enlarges the
 * mark to fill this share of the tile width (derived for legibility; same mark, same colours).
 */
const FAVICON_MARK_FILL = 0.74

const browser = await chromium.launch()
const page = await (await browser.newContext({ deviceScaleFactor: 1 })).newPage()

async function main() {
  rmSync(OUT, { recursive: true, force: true })
  const logos = []
  for (const [lockup, spec] of Object.entries(LOCKUPS)) {
    const master = parseMaster(spec.master)
    for (const variant of Object.keys(VARIANTS)) logos.push(await writeLockup(lockup, spec, variant, master))
  }
  const tiles = []
  for (const [id, spec] of Object.entries(TILES)) tiles.push(await writeTile(id, spec))
  const favicons = await writeFavicons()
  const social = await writeSocial()
  writeManifest(logos, tiles, favicons, social)
  if (CONTACT) await writeContactSheet(logos, tiles, favicons, social)
  const files = logos.length * (1 + SCALES.length) + tiles.length * (1 + SCALES.length)
  console.log(`logo files: ${files} · favicons: ${favicons.length} · social: ${social.length}${CONTACT ? ` · contact sheet: ${CONTACT}` : ''}`)
}

/* ---------------------------------------------------------------- masters */

/** Size, the gradient definition (if any) and the shapes in drawing order, from one master SVG. */
function parseMaster(file) {
  const svg = readFileSync(`${MASTERS}/${file}`, 'utf8')
  const [, width, height] = svg.match(/<svg[^>]*width="([\d.]+)" height="([\d.]+)"/)
  const gradient = svg.match(/<linearGradient id="g"([^>]*)>([\s\S]*?)<\/linearGradient>/)
  const shapes = [...svg.matchAll(/<(path|rect)\s([^>]*?)\/>/g)].map((m) => ({ tag: m[1], attrs: m[2].replace(/\s*fill="[^"]*"/, ''), fill: m[2].match(/fill="([^"]*)"/)[1] }))
  return { width: Number(width), height: Number(height), gradient: gradient ? { attrs: gradient[1], stops: gradient[2] } : null, shapes }
}

/** The master's gradient under a file-unique id (several logos can share one page). */
const gradientDef = (master, id) => `<linearGradient id="${id}"${master.gradient.attrs}>${master.gradient.stops}</linearGradient>`

function svgDoc(width, height, body, defs = '', title = 'ONE Agency') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-label="${title}"><title>${title}</title>${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>\n`
}

/** A lockup in one variant: shape 0 is ONE (or the mark), shape 1 is AGENCY. */
function recolour(master, variant, prefix) {
  const v = VARIANTS[variant]
  const gradientId = `${prefix}-g`
  const fills = [v.one === 'gradient' ? `url(#${gradientId})` : v.one, v.agency]
  const body = master.shapes.map((s, i) => `<${s.tag} ${s.attrs} fill="${fills[i]}"/>`).join('')
  const defs = v.one === 'gradient' ? gradientDef(master, gradientId) : ''
  return svgDoc(master.width, master.height, body, defs)
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

async function pngSet(rel, svg, baseWidth, width, height) {
  const out = []
  for (const scale of SCALES) {
    const w = baseWidth * scale
    const h = Math.round((w * height) / width)
    out.push({ scale, width: w, height: h, ...save(`${rel}_${scale}x.png`, await shoot(imgTag(svg, w, h), w, h)) })
  }
  return out
}

async function writeLockup(lockup, spec, variant, master) {
  const name = `one-agency_logo_${lockup}-${variant}`
  const svg = recolour(master, variant, `oa-${lockup}-${variant}`)
  const file = save(`${lockup}/${name}.svg`, svg)
  const pngs = await pngSet(`${lockup}/${name}`, svg, spec.png, master.width, master.height)
  const { label, ground, note } = VARIANTS[variant]
  const meta = { label, ground, note }
  // ONE alone and the mark have no AGENCY: the reversed version is Mint only.
  if (master.shapes.length === 1 && variant === 'on-navy') Object.assign(meta, { label: 'Mint on navy', note: 'The reversed colour from the board: Mint on Navy and dark photos.' })
  if (master.shapes.length === 1 && variant === 'on-light') Object.assign(meta, { note: 'As drawn on the board: the Violet-to-Mint gradient. For white, Mist and Sky grounds.' })
  return { lockup, variant, primary: spec.primary, lockupLabel: spec.label, ...meta, svg: { ...file, width: master.width, height: master.height }, pngs }
}

/** A board tile as drawn, gradient id made file-unique. */
function tileSvg(spec, prefix) {
  const raw = readFileSync(`${MASTERS}/${spec.master}`, 'utf8').trim()
  return raw
    .replace('<svg ', '<svg role="img" aria-label="ONE Agency" ')
    .replace(/(<svg[^>]*>)/, '$1<title>ONE Agency</title>')
    .replaceAll('id="g"', `id="${prefix}-g"`)
    .replaceAll('url(#g)', `url(#${prefix}-g)`) + '\n'
}

async function writeTile(id, spec) {
  const name = `one-agency_logo_app-tile-${id}`
  const svg = tileSvg(spec, `oa-tile-${id}`)
  const file = save(`tile/${name}.svg`, svg)
  const pngs = await pngSet(`tile/${name}`, svg, TILE_PNG, 855, 855)
  return { id, label: spec.label, note: spec.note, svg: { ...file, width: 855, height: 855 }, pngs }
}

/** Navy ground with the Mint mark centred at `fill` of the width; rounded like the board tile unless `square`. */
function navyIconSvg(fill, square) {
  const mark = parseMaster('mark_mint.svg')
  const size = 855
  const w = size * fill
  const h = (w * mark.height) / mark.width
  const s = w / mark.width
  const shape = mark.shapes[0]
  const radius = square ? 0 : 210
  const body = `<rect width="${size}" height="${size}" rx="${radius}" fill="${NAVY}"/><g transform="translate(${(size - w) / 2} ${(size - h) / 2}) scale(${s})"><${shape.tag} ${shape.attrs} fill="${MINT}"/></g>`
  return svgDoc(size, size, body)
}

async function writeFavicons() {
  const svg = navyIconSvg(FAVICON_MARK_FILL, false)
  const out = [{ kind: 'svg', width: null, height: null, ...save('favicon/one-agency_logo_favicon.svg', svg) }]
  const png = async (doc, size) => shoot(imgTag(doc, size, size), size, size)
  const icoParts = []
  for (const size of [16, 32, 48]) {
    const buf = await png(svg, size)
    icoParts.push({ size, buf })
    out.push({ kind: 'png', width: size, height: size, ...save(`favicon/one-agency_logo_favicon_${size}x${size}.png`, buf) })
  }
  const ico = icoFile(icoParts)
  out.push({ kind: 'ico', width: 48, height: 48, ...save('favicon/one-agency_logo_favicon.ico', ico) })
  writeFileSync(`${ROOT}/public/favicon.ico`, ico)
  // Platforms round these themselves, so they are full-bleed squares with the board's mark proportion.
  const square = navyIconSvg(492 / 855, true)
  out.push({ kind: 'apple-touch-icon', width: 180, height: 180, ...save('favicon/one-agency_logo_apple-touch-icon_180x180.png', await png(square, 180)) })
  for (const size of [192, 512]) out.push({ kind: 'app-icon', width: size, height: size, ...save(`favicon/one-agency_logo_app-icon_${size}x${size}.png`, await png(square, size)) })
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

/** Social avatar (stacked logo on navy, inside the circle crop) and the plain OG link-preview image. */
async function writeSocial() {
  const stacked = parseMaster(LOCKUPS.stacked.master)
  const horizontal = parseMaster(LOCKUPS.horizontal.master)
  const out = []
  const avatarW = 640
  const avatarH = Math.round((avatarW * stacked.height) / stacked.width)
  const avatar = `<div style="width:1080px;height:1080px;background:${NAVY};display:grid;place-items:center">${imgTag(recolour(stacked, 'on-navy', 'oa-avatar'), avatarW, avatarH)}</div>`
  out.push({ kind: 'avatar', width: 1080, height: 1080, ...save('social/one-agency_logo_social-avatar_1080x1080.png', await shoot(avatar, 1080, 1080)) })

  const ogW = 760
  const ogH = Math.round((ogW * horizontal.height) / horizontal.width)
  const og = `<style>${fontFace('Geist', 500, 'one-agency_font_geist-500.woff2')}</style>
    <div style="width:1200px;height:630px;background:${NAVY};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;font-family:Geist,sans-serif">
      ${imgTag(recolour(horizontal, 'on-navy', 'oa-og'), ogW, ogH)}
      <div style="width:200px;height:6px;border-radius:6px;background:${GRADIENT}"></div>
      <div style="color:${TEXT_2};font-size:30px;font-weight:500;letter-spacing:-0.01em">Brand kit v${KIT.version} · ${KIT.updated}</div>
    </div>`
  out.push({ kind: 'og', width: 1200, height: 630, ...save('social/one-agency_logo_og-image_1200x630.png', await shoot(og, 1200, 630)) })
  return out
}

/* ---------------------------------------------------------------- manifest */

function writeManifest(logos, tiles, favicons, social) {
  const json = (v) => JSON.stringify(v, null, 2)
  writeFileSync(
    `${ROOT}/src/data/logos.ts`,
    `/* GENERATED by scripts/build-logos.mjs from the moodboard masters. Do not edit; run \`npm run kit:logos\`. */

export type LogoLockup = ${Object.keys(LOCKUPS).map((k) => `'${k}'`).join(' | ')}
export type LogoVariant = ${Object.keys(VARIANTS).map((k) => `'${k}'`).join(' | ')}

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
  ground: '--paper' | '--navy'
  note: string
  svg: AssetFile & { width: number; height: number }
  pngs: LogoPng[]
}

export interface AppTile {
  id: string
  label: string
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

export const APP_TILES: AppTile[] = ${json(tiles)}

export const FAVICONS: IconFile[] = ${json(favicons)}

export const SOCIAL_IMAGES: IconFile[] = ${json(social)}
`,
  )
}

/* ---------------------------------------------------------------- review */

/** One PNG of every variant on its intended ground, plus tiles, favicons and social images, for design review. */
async function writeContactSheet(logos, tiles, favicons, social) {
  const read = (url) => `data:image/png;base64,${readFileSync(`${ROOT}/public${url}`).toString('base64')}`
  const svgSrc = (url) => dataUri(readFileSync(`${ROOT}/public${url}`, 'utf8'))
  const tile = (l) => `
    <figure style="margin:0">
      <div style="background:${hex(l.ground)};border-radius:16px;height:180px;display:grid;place-items:center;padding:24px;box-sizing:border-box;${l.ground === '--paper' ? 'box-shadow:inset 0 0 0 1px #d6d8e0' : ''}">
        <img src="${svgSrc(l.svg.url)}" style="max-width:${l.lockup === 'horizontal' ? 92 : 70}%;max-height:${l.lockup === 'mark' ? 70 : 130}px">
      </div>
      <figcaption>${l.lockupLabel} · ${l.label}<br><code>${l.svg.url.split('/').pop()}</code></figcaption>
    </figure>`
  const fav = (f, shown) => `<figure style="margin:0"><img src="${read(f.url)}" style="width:${shown}px;height:${shown}px;image-rendering:pixelated;display:block"><figcaption>${f.width}px${shown !== f.width ? ` (shown at ${shown})` : ''}</figcaption></figure>`
  const pngFavs = favicons.filter((f) => f.url.endsWith('.png'))
  const html = `<style>${fontFace('Geist', 400, 'one-agency_font_geist-400.woff2')}${fontFace('Geist', 600, 'one-agency_font_geist-600.woff2')}
      body{font-family:Geist,sans-serif;background:#eef0f4;color:${NAVY}}
      figcaption{font-size:13px;line-height:1.4;margin-top:8px;color:#444}
      code{font-size:11px;color:#616161}
      h2{font-size:20px;font-weight:600;margin:40px 0 16px}
    </style>
    <div style="width:1600px;padding:48px;box-sizing:border-box">
      <h1 style="font-size:30px;font-weight:600;margin:0">ONE Agency logo pack: contact sheet</h1>
      <p style="margin:6px 0 0;color:#444">Masters: design/source/rebrand (${KIT.board}). Shapes unchanged; recolour only. Generated by scripts/build-logos.mjs.</p>
      ${Object.keys(LOCKUPS).map((k) => `<h2>${LOCKUPS[k].label}</h2><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px">${logos.filter((l) => l.lockup === k).map(tile).join('')}</div>`).join('')}
      <h2>App tiles</h2>
      <div style="display:flex;gap:28px">${tiles.map((t) => `<figure style="margin:0"><img src="${svgSrc(t.svg.url)}" style="width:160px;height:160px;display:block"><figcaption>${t.label}</figcaption></figure>`).join('')}</div>
      <h2>Favicons</h2>
      <div style="display:flex;gap:28px;align-items:flex-end">
        ${pngFavs.map((f) => fav(f, f.width <= 48 ? f.width * 4 : Math.min(f.width, 192))).join('')}
        ${pngFavs.filter((f) => f.width <= 32).map((f) => fav(f, f.width)).join('')}
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
