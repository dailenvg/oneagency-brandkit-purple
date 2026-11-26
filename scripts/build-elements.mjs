#!/usr/bin/env node
/**
 * Graphic elements for the kit, as downloads in public/kit/elements/:
 *   one-agency_element_[id].svg            vector, colours from the brand tokens; text elements embed their (Latin subset) fonts
 *   one-agency_element_[id].png            the same SVG rendered in Chromium (2x, transparent where the element is)
 *   one-agency_element_[id]-on-dark.svg    the kit graphics (signature devices, patterns, illustrations), once per tone,
 *   one-agency_element_[id]-on-light.svg   each with its PNG (2x; patterns are 1080 px full-bleed, so 1x)
 *   icons/one-agency_icon_[name].svg       the Phosphor bold subset used in ads, white fill
 *
 * The kit graphics are the hub's own React components (src/kit/graphics/), loaded through Vite's SSR loader and
 * rendered to static markup, so the download is exactly what the page shows, minus the motion.
 *
 * The element list and icon subset live in src/data/elements.ts; colours come from src/data/tokens.ts (generated from
 * design/source/rebrand/brand-tokens.json), so nothing here hard-codes a brand value.
 *
 * Usage: node scripts/build-elements.mjs   (needs `npm run kit:tokens` first)
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as Phosphor from '@phosphor-icons/react/dist/ssr'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { AD_CONCEPTS } from '../src/data/ad-copy.ts'
import { AD_ICONS, ELEMENTS, ELEMENTS_DIR, elementPath } from '../src/data/elements.ts'
import { TOKENS } from '../src/data/tokens.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, `public${ELEMENTS_DIR}`)
const FONTS = resolve(ROOT, 'src/assets/fonts')

/* ------------------------------------------------------------------ tokens */

const hex = (name) => {
  const t = TOKENS.find((x) => x.name === name)
  if (!t?.hex) throw new Error(`No hex for ${name}`)
  return t.hex
}
const C = {
  navy: hex('--navy'),
  mint: hex('--mint'),
  violet: hex('--violet'),
  violetLight: hex('--violet-light'),
  text: hex('--text'),
  text2: hex('--text-2'),
  onAccent: hex('--on-accent'),
  ink: hex('--ink'),
  paper: hex('--paper'),
}
const PROOF = AD_CONCEPTS.find((c) => c.id === 'proof')
const AD_COPY_PROOF = PROOF.stats
const LEGAL = PROOF.legal

/** The --gradient stops (Mint to Ultra Violet), read from the token so the rule matches tokens.css exactly. */
const BAR = TOKENS.find((t) => t.name === '--gradient').stops.map((s) => s.split(' ').at(-1))

/* ------------------------------------------------------------------ fonts */

const FACES = {
  'Geist-500': ['Geist', 500, 'geist-500.woff2'],
  'Geist-600': ['Geist', 600, 'geist-600.woff2'],
  'Geist-700': ['Geist', 700, 'geist-700.woff2'],
  'Unbounded-600': ['Unbounded', 600, 'unbounded-600.woff2'],
}
const fontFace = (key) => {
  const [family, weight, file] = FACES[key]
  const data = readFileSync(resolve(FONTS, file)).toString('base64')
  return `@font-face{font-family:"${family}";font-weight:${weight};src:url(data:font/woff2;base64,${data}) format("woff2")}`
}
const fontStyle = (keys) => `<style>${keys.map(fontFace).join('')}</style>`

/* ------------------------------------------------------------------ svg helpers */

const svg = (w, h, body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>\n`

const linear = (id, stops, { x2 = 1, y2 = 0, units = 'objectBoundingBox' } = {}) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}" gradientUnits="${units}">${stops
    .map(([offset, color, opacity = 1]) => `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`)
    .join('')}</linearGradient>`

/** --hairline / --stat-divider shape: transparent, Mint, light Violet, transparent. */
const fadeStops = (a, b, opacity) => [
  [0, C.mint, 0],
  [a, C.mint, opacity],
  [b, C.violetLight, opacity],
  [1, C.violetLight, 0],
]

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

/* ------------------------------------------------------------------ text measuring (Chromium, real fonts) */

async function measurer(page) {
  const css = Object.keys(FACES).map(fontFace).join('')
  await page.setContent(`<style>${css}</style><body>${Object.values(FACES).map(([f, w]) => `<span style="font:${w} 20px ${f}">Ag</span>`).join('')}</body>`)
  await page.evaluate(() => document.fonts.ready)
  return (text, font, tracking = 0) =>
    page.evaluate(
      ([t, f, tr]) => {
        const ctx = document.createElement('canvas').getContext('2d')
        ctx.font = f
        ctx.letterSpacing = `${tr}px`
        return ctx.measureText(t).width
      },
      [text, font, tracking],
    )
}

/* ------------------------------------------------------------------ elements */

async function cta(measure, label, { fill, stroke, color }) {
  const size = 32
  const padX = 48
  const h = 88
  const w = Math.ceil((await measure(label, `600 ${size}px Geist`)) + padX * 2)
  const body = `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${(h - 2) / 2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
<text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="central" font-family="Geist" font-weight="600" font-size="${size}" fill="${color}">${esc(label)}</text>`
  return svg(w, h, fontStyle(['Geist-600']) + body)
}

function statBar() {
  const col = 400
  const w = col * AD_COPY_PROOF.length
  const h = 280
  // Numbers are solid Mint: text never takes a gradient. Only the dividers keep the fade.
  const defs = linear('div', fadeStops(0.3, 0.7, 0.7), { x2: 0, y2: 1 })
  const cols = AD_COPY_PROOF.map((s, i) => {
    const cx = col * i + col / 2
    const divider = i ? `<rect x="${col * i}" y="10" width="2" height="170" fill="url(#div)"/>` : ''
    return `${divider}<text x="${cx}" y="96" text-anchor="middle" font-family="Unbounded" font-weight="600" font-size="62" letter-spacing="-1.2" fill="${C.mint}">${esc(s.value)}</text>
<text x="${cx}" y="150" text-anchor="middle" font-family="Geist" font-weight="500" font-size="26" fill="${C.text}">${esc(s.label)}</text>`
  }).join('')
  const legal = `<text x="${w / 2}" y="252" text-anchor="middle" font-family="Geist" font-weight="500" font-size="22" fill="${C.text2}">${esc(LEGAL)}</text>`
  return svg(w, h, fontStyle(['Unbounded-600', 'Geist-500']) + cols + legal, defs)
}

const laurelPaths = () =>
  readFileSync(resolve(ROOT, 'design/source/award-laurel.svg'), 'utf8')
    .replace(/^[\s\S]*?<g fill="currentColor">/, '<g fill="currentColor">')
    .replace(/<\/svg>\s*$/, '')

function laurel() {
  return svg(240, 240, `<g color="${C.text}" transform="scale(2)">${laurelPaths()}</g>`)
}

async function awardBadge(measure) {
  const h = 240
  const pad = 48
  const title = 'Best AI Product'
  const org = '2026 ARDY AWARDS · AMERICAN RESORT DEVELOPMENT ASSOCIATION'
  const titleW = await measure(title, '600 48px Unbounded', -1)
  const orgW = await measure(org, '600 16px Geist', 16 * 0.16)
  const toW = await measure('ConversionIQ.ai', '700 32px Geist')
  const mid = Math.ceil(Math.max(titleW, orgW))
  const x1 = pad + 160 + pad
  const x2 = x1 + mid + pad
  const w = Math.ceil(x2 + pad + toW + pad)
  const rule = (x) => `<rect x="${x}" y="40" width="1" height="${h - 80}" fill="${C.text}" fill-opacity="0.18"/>`
  const body = `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="24" fill="${C.navy}"/>
<rect x="0" y="0" width="${w}" height="2" fill="url(#bar)" fill-opacity="0.7"/><rect x="0" y="${h - 2}" width="${w}" height="2" fill="url(#bar)" fill-opacity="0.7"/>
<g color="${C.text}" transform="translate(${pad} 40) scale(1.333)" fill-opacity="0.9">${laurelPaths()}</g>
<text x="${pad + 80}" y="${h / 2 + 2}" text-anchor="middle" dominant-baseline="central" font-family="Unbounded" font-weight="600" font-size="24" fill="${C.text}">2026</text>
${rule(x1 - pad / 2)}
<rect x="${x1}" y="46" width="112" height="28" fill="none" stroke="${C.text}" stroke-opacity="0.7"/>
<text x="${x1 + 56}" y="61" text-anchor="middle" dominant-baseline="central" font-family="Geist" font-weight="700" font-size="13" letter-spacing="4.2" fill="${C.text}">WINNER</text>
<text x="${x1}" y="140" font-family="Unbounded" font-weight="600" font-size="48" letter-spacing="-1" fill="${C.text}">${title}</text>
<text x="${x1}" y="184" font-family="Geist" font-weight="600" font-size="16" letter-spacing="2.56" fill="${C.text2}">${esc(org)}</text>
${rule(x2)}
<text x="${x2 + pad}" y="106" font-family="Geist" font-weight="700" font-size="13" letter-spacing="3.6" fill="${C.text2}">AWARDED TO</text>
<text x="${x2 + pad}" y="148" font-family="Geist" font-weight="700" font-size="32" fill="${C.text}">ConversionIQ.ai</text>`
  const defs = linear('bar', BAR.map((c, i) => [i / (BAR.length - 1), c]))
  return svg(w, h, fontStyle(['Geist-600', 'Geist-700', 'Unbounded-600']) + body, defs)
}

/* ------------------------------------------------------------------ kit graphics (src/kit/graphics) */

const TONE_OF = { 'on-dark': 'dark', 'on-light': 'light' }

/** Embeds the faces a graphic's text uses, and drops the hub-only motion hooks. */
function finishGraphic(markup) {
  const faces = [markup.includes('font-family="Unbounded"') && 'Unbounded-600', markup.includes('font-family="Geist"') && 'Geist-500', markup.includes('font-family="Geist"') && 'Geist-600'].filter(Boolean)
  const clean = markup.replace(/ data-anim="[a-z]+"/g, '')
  return `${faces.length ? clean.replace(/^(<svg[^>]*>)/, `$1${fontStyle(faces)}`) : clean}\n`
}

/** Renders every kit graphic, once per tone: file path → [svg, png scale]. */
async function buildGraphics() {
  const vite = await createServer({ root: ROOT, configFile: false, server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { GRAPHICS } = await vite.ssrLoadModule('/src/kit/graphics/registry.ts')
    const files = {}
    for (const g of GRAPHICS) {
      const e = ELEMENTS.find((x) => x.id === g.id)
      if (!e) throw new Error(`Graphic ${g.id} is not in src/data/elements.ts`)
      for (const v of e.variants) {
        const markup = renderToStaticMarkup(createElement(g.Component, { tone: TONE_OF[v.id], idPrefix: `oa-${g.id}` }))
        files[elementPath(e, 'svg', v.id)] = [finishGraphic(markup), e.family === 'pattern' ? 1 : 2]
      }
    }
    return files
  } finally {
    await vite.close()
  }
}

/** The hand-built elements: file path → [svg, png scale]. */
async function buildElements(measure) {
  const byId = {
    'cta-primary': [await cta(measure, 'Call to action', { fill: C.mint, stroke: C.mint, color: C.onAccent }), 2],
    'cta-secondary': [await cta(measure, 'Call to action', { fill: 'none', stroke: C.text, color: C.text }), 2],
    'cta-on-light': [await cta(measure, 'Call to action', { fill: C.ink, stroke: C.ink, color: C.paper }), 2],
    'stat-bar': [statBar(), 2],
    'award-badge': [await awardBadge(measure), 2],
    laurel: [laurel(), 2],
  }
  return Object.fromEntries(
    Object.entries(byId).map(([id, built]) => {
      const e = ELEMENTS.find((x) => x.id === id)
      if (!e) throw new Error(`Element ${id} is not in src/data/elements.ts`)
      return [elementPath(e, 'svg'), built]
    }),
  )
}

/** Every SVG file the registry expects (PNG twins follow), except the rendered Möbius set. */
const expectedSvgs = () =>
  ELEMENTS.filter((e) => e.formats.includes('svg')).flatMap((e) => (e.variants.length ? e.variants.map((v) => elementPath(e, 'svg', v.id)) : [elementPath(e, 'svg')]))

/* ------------------------------------------------------------------ run */

mkdirSync(resolve(OUT, 'icons'), { recursive: true })
const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  const measure = await measurer(page)
  const built = { ...(await buildElements(measure)), ...(await buildGraphics()) }
  const missing = expectedSvgs().filter((file) => !built[file])
  if (missing.length) throw new Error(`No generator for: ${missing.join(', ')}`)

  for (const [file, [markup, scale]] of Object.entries(built)) {
    writeFileSync(resolve(OUT, file), markup)
    const [, w, h] = markup.match(/width="([\d.]+)" height="([\d.]+)"/)
    const shot = await browser.newPage({ viewport: { width: Math.ceil(w), height: Math.ceil(h) }, deviceScaleFactor: scale })
    await shot.setContent(`<html><body style="margin:0;background:transparent">${markup}</body></html>`)
    await shot.evaluate(() => document.fonts.ready)
    await shot.locator('svg').first().screenshot({ path: resolve(OUT, file.replace(/\.svg$/, '.png')), omitBackground: true })
    await shot.close()
  }

  for (const i of AD_ICONS) {
    const Icon = Phosphor[i.name]
    if (!Icon) throw new Error(`Unknown Phosphor icon ${i.name}`)
    const markup = renderToStaticMarkup(createElement(Icon, { weight: 'bold', size: 256, color: C.text }))
    writeFileSync(resolve(OUT, 'icons', `one-agency_icon_${i.file}.svg`), `${markup}\n`)
  }
} finally {
  await browser.close()
}

console.log(`elements: ${expectedSvgs().length} SVG + PNG and ${AD_ICONS.length} icons in public${ELEMENTS_DIR}`)
