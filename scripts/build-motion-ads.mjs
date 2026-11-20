#!/usr/bin/env node
/**
 * Writes the animated HTML5 ads: public/kit/motion/ads/[concept]-[WxH]/index.html for the three sample concepts
 * (src/data/ad-copy.ts, verbatim) at 1080x1920, 1080x1080 and 300x250 (src/data/motion-ads.ts).
 *
 * Each folder is self-contained: index.html, one-motion.js, the logo and laurel SVGs and the font subsets it uses, so it
 * can be zipped and uploaded to an ad server as is. Each ad also gets that ZIP, as
 * public/kit/motion/exports/one-agency_motion-[concept]_[WxH].zip.
 *
 * The ads are pure functions of time on the one-motion.js player: ?t=3.2 renders that frame, ?export stops autoplay and
 * exposes window.oneAd.seek(t) for scripts/export-motion-ads.mjs. They play once and hold the final frame; under
 * prefers-reduced-motion they open on the final frame.
 *
 * Usage: node scripts/build-motion-ads.mjs   (after kit:tokens, kit:logos, kit:motion and kit:elements)
 */
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { zipFiles } from './lib/zip.mjs'
import { AD_CONCEPTS } from '../src/data/ad-copy.ts'
import { AD_TEXT_STYLES } from '../src/data/ad-styles.ts'
import { MOTION_AD_CONCEPTS, MOTION_AD_DURATION, MOTION_AD_SIZES, motionAdExport, motionAdSlug } from '../src/data/motion-ads.ts'
import { TOKENS } from '../src/data/tokens.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = resolve(ROOT, 'public')
const ADS = resolve(PUBLIC, 'kit/motion/ads')
const CLICK_URL = 'https://oneagency.com'

/** Files each ad folder carries, from where they are built. */
const SHARED = {
  'one-motion.js': 'public/kit/motion/one-motion.js',
  'logo-stacked.svg': 'public/kit/logos/stacked/one-agency_logo_stacked-on-navy.svg',
  'logo-horizontal.svg': 'public/kit/logos/horizontal/one-agency_logo_horizontal-on-navy.svg',
  'logo-icon.svg': 'public/kit/logos/mark/one-agency_logo_mark-on-navy.svg',
  'laurel.svg': 'public/kit/elements/one-agency_element_laurel.svg',
  'fonts/geist-500.woff2': 'src/assets/fonts/geist-500.woff2',
  'fonts/geist-600.woff2': 'src/assets/fonts/geist-600.woff2',
  'fonts/geist-700.woff2': 'src/assets/fonts/geist-700.woff2',
  'fonts/unbounded-600.woff2': 'src/assets/fonts/unbounded-600.woff2',
}

/* ------------------------------------------------------------------ styles */

const token = (name) => TOKENS.find((t) => t.name === name)
/** Brand tokens the ads use, written as resolved values (an ad folder carries no tokens.css). */
const TOKEN_CSS = ['--navy', '--mint', '--violet', '--violet-light', '--text', '--text-2', '--on-accent', '--edge', '--surface']
  .map((n) => `${n}:${token(n).hex}`)
  .join(';')

const style = (id, scale) => {
  const s = AD_TEXT_STYLES.find((x) => x.id === id)
  return `font-family:${s.face};font-weight:${s.weight};font-size:${s[scale]}px;line-height:${s.lineHeight};letter-spacing:${s.tracking}em${s.uppercase ? ';text-transform:uppercase' : ''}`
}

/** Spacing per format, px: outer padding, the gap between blocks, and the logo width. */
const LAYOUT = {
  '1080x1920': { pad: 120, gap: 84, logo: 480, laurel: 340, line: 220 },
  '1080x1080': { pad: 72, gap: 30, logo: 360, laurel: 190, line: 80 },
  '300x250': { pad: 16, gap: 7, logo: 40, laurel: 52, line: 0 },
}

const fontFaces = Object.keys(SHARED)
  .filter((f) => f.startsWith('fonts/'))
  .map((f) => {
    const [, family, weight] = f.match(/fonts\/(\w+)-(\d+)/)
    return `@font-face{font-family:"${family[0].toUpperCase()}${family.slice(1)}";font-weight:${weight};src:url(${f}) format("woff2")}`
  })
  .join('\n')

function css(size) {
  const scale = size.scale
  const L = LAYOUT[`${size.width}x${size.height}`]
  const banner = scale === 'banner'
  return `${fontFaces}
:root{${TOKEN_CSS}}
*{box-sizing:border-box;margin:0}
html,body{width:${size.width}px;height:${size.height}px;overflow:hidden;background:var(--navy)}
#ad{position:relative;display:block;width:${size.width}px;height:${size.height}px;overflow:hidden;color:var(--text);text-decoration:none;font-family:Geist,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.stack{position:absolute;inset:${L.pad}px;display:flex;flex-direction:column;justify-content:center;gap:${L.gap}px;${banner ? 'align-items:flex-start;text-align:left' : 'align-items:center;text-align:center'}}
.logo{display:block;width:${L.logo}px;height:auto}
.bar{display:block;height:${banner ? 3 : 8}px;width:${banner ? 48 : 180}px;border-radius:8px;background:linear-gradient(90deg,var(--mint) 0%,var(--violet) 100%);transform-origin:left center;transform:scaleX(0)}
.eyebrow{${style('eyebrow', scale)};color:var(--mint)}
.tag{display:inline-block;padding:${banner ? '3px 6px 2px' : '12px 24px 10px'};border:${banner ? 1 : 2}px solid color-mix(in srgb,var(--text) 70%,transparent);${style('eyebrow', scale)};letter-spacing:0.32em;color:var(--text)}
.headline{${style('headline', scale)};max-width:${banner ? 268 : 900}px;text-wrap:balance}
.acc{background:linear-gradient(90deg,var(--mint) 0%,var(--violet-light) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;padding:.1em .05em .14em;margin:-.1em 0 -.14em}
.sub{${style('subhead', scale)};color:var(--text-2);max-width:${banner ? 268 : 860}px;text-wrap:balance}
.attr{${style('subhead', scale)};font-weight:700;color:var(--text)}
.cta{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:var(--mint);color:var(--on-accent);${style('cta', scale)};padding:${banner ? '7px 14px' : '30px 60px'};opacity:0}
.small{${style('legal', scale)};color:var(--text-2)}
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));row-gap:${banner ? 6 : L.gap}px;width:100%}
.stat{position:relative;display:flex;flex-direction:column;align-items:${banner ? 'flex-start' : 'center'};gap:${banner ? 1 : 8}px;padding-inline:${banner ? 0 : 16}px;opacity:0}
.stat:nth-child(even)::before{content:"";position:absolute;left:${banner ? -8 : 0}px;top:6%;bottom:6%;width:1px;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--mint) 70%,transparent) 30%,color-mix(in srgb,var(--violet-light) 70%,transparent) 70%,transparent)}
.num{${style('stat', scale)};background:linear-gradient(90deg,var(--mint),var(--violet-light));-webkit-background-clip:text;background-clip:text;color:transparent}
.label{${style('statLabel', scale)}}
.line{display:block;width:100%;height:${L.line}px;overflow:visible}
.line path{opacity:0}
.line circle{transform-box:fill-box;transform-origin:center;opacity:0}
.laurel{position:relative;display:grid;place-items:center;width:${L.laurel}px;height:${L.laurel}px;opacity:0}
.laurel img{position:absolute;inset:0;width:100%;height:100%;opacity:.9}
.laurel b{position:relative;font-family:Unbounded;font-weight:600;font-size:${Math.round(L.laurel * 0.19)}px;letter-spacing:.04em}
.wipe{position:relative;display:inline-block}
.sweep{position:absolute;top:-10%;bottom:-10%;left:0;width:${banner ? 4 : 14}px;background:linear-gradient(180deg,var(--mint) 0%,var(--violet) 100%);opacity:0}
.corner{position:absolute;top:${L.pad}px;right:${L.pad}px;width:${L.logo}px;height:auto}
.row{display:flex;align-items:center;gap:10px}`
}

/* ------------------------------------------------------------------ markup per concept */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

/** Rising line from bottom left to top right, ending on a result dot. */
function lineSvg(width, height) {
  const w = width
  const h = Math.max(height, 1)
  const pts = [
    [8, h - 8],
    [w * 0.25, h * 0.78],
    [w * 0.45, h * 0.62],
    [w * 0.66, h * 0.4],
    [w * 0.84, h * 0.24],
    [w - 16, 12],
  ]
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const [ex, ey] = pts.at(-1)
  return `<svg class="line" id="line" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><linearGradient id="lg" gradientUnits="userSpaceOnUse" x1="8" x2="${w - 16}" y1="0" y2="0"><stop style="stop-color:var(--mint)"/><stop offset="1" style="stop-color:var(--violet-light)"/></linearGradient></defs><path id="line-path" pathLength="1" d="${d}" fill="none" stroke="url(#lg)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle id="line-ring" cx="${ex}" cy="${ey}" r="12" fill="none" stroke-width="4" style="stroke:var(--violet-light)"/><circle id="line-dot" cx="${ex}" cy="${ey}" r="12" style="fill:var(--violet-light)"/></svg>`
}

function body(concept, size) {
  const c = AD_CONCEPTS.find((x) => x.id === concept)
  const banner = size.scale === 'banner'
  const L = LAYOUT[`${size.width}x${size.height}`]
  const innerW = size.width - L.pad * 2
  if (concept === 'audit') {
    return `<div class="stack">
  <img class="logo" id="logo" src="${banner ? 'logo-icon.svg' : 'logo-stacked.svg'}" alt="ONE Agency">
  <span class="bar" id="bar"></span>
  <p class="${banner ? 'eyebrow' : 'tag'}" id="eyebrow">${esc(c.eyebrow)}</p>
  <h1 class="headline" id="headline">${esc(c.headline)}</h1>
  <p class="sub" id="sub">${esc(c.sub)}</p>
  <span class="cta" id="cta">${esc(c.cta)}</span>
  <p class="small" id="small">${esc(c.small)}</p>
</div>`
  }
  if (concept === 'proof') {
    return `<div class="stack">
  <img class="logo" id="logo" src="${banner ? 'logo-icon.svg' : 'logo-horizontal.svg'}" alt="ONE Agency">
  <h1 class="headline" id="headline">${esc(c.headline)}</h1>
  ${L.line ? lineSvg(innerW, L.line) : ''}
  <ul class="stats" style="list-style:none;padding:0">
    ${c.stats.map((s, i) => `<li class="stat" id="stat-${i}"><span class="num">${esc(s.value)}</span><span class="label">${esc(s.label)}</span></li>`).join('\n    ')}
  </ul>
  <span class="cta" id="cta">${esc(c.cta)}</span>
  <p class="small" id="small">${esc(c.legal)}</p>
</div>`
  }
  return `${banner ? '<img class="corner" id="logo" src="logo-icon.svg" alt="ONE Agency">' : ''}
<div class="stack">
  ${banner ? '<div class="row">' : ''}<div class="laurel" id="laurel"><img src="laurel.svg" alt=""><b>2026</b></div>
  ${banner ? '<div>' : ''}<p class="tag" id="eyebrow">${esc(c.eyebrow)}</p>
  <h1 class="headline" id="headline">${esc(c.headline)}</h1>${banner ? '</div></div>' : ''}
  <p class="sub" id="sub">${esc(c.sub)}</p>
  <p class="wipe"><span class="attr" id="attr">${esc(c.attribution)}</span><span class="sweep" id="sweep" aria-hidden="true"></span></p>
  <span class="cta" id="cta">${esc(c.cta)}</span>
  <p class="small" id="small">${esc(c.small)}</p>
  ${banner ? '' : '<img class="logo" id="logo" src="logo-horizontal.svg" alt="ONE Agency" style="width:300px">'}
</div>`
}

/* ------------------------------------------------------------------ timelines (seconds) */

const TIMELINES = {
  audit: (accent) => `
  M.logoIn(el.logo, t, 0)
  M.bar(el.bar, t, 0.6)
  M.pop(el.eyebrow, t, 0.9)
  M.rise(el.headline, t, 1.15, { accent: [${accent}] })
  M.rise(el.sub, t, 2.2)
  M.pop(el.cta, t, 3.1)
  M.rise(el.small, t, 3.5)`,
  proof: (accent) => `
  M.logoIn(el.logo, t, 0)
  M.rise(el.headline, t, 0.5, { accent: [${accent}] })
  if (el.linePath) M.lineDraw({ path: el.linePath, dot: el.lineDot, ring: el.lineRing }, t, 1.3)
  el.stats.forEach((s, i) => M.pop(s, t, 1.7 + i * 0.25))
  M.pop(el.cta, t, 3.3)
  M.rise(el.small, t, 3.7)`,
  award: (accent) => `
  M.pop(el.laurel, t, 0.1)
  M.hop(el.eyebrow, t, 0.5)
  M.rise(el.headline, t, 0.85, { accent: [${accent}] })
  M.rise(el.sub, t, 1.5)
  M.wipe({ sweep: el.sweep, to: el.attr, width: el.attr.offsetWidth }, t, 2.3)
  M.logoIn(el.logo, t, 2.7)
  M.pop(el.cta, t, 3.2)
  M.rise(el.small, t, 3.6)`,
}

function html(concept, size) {
  const c = AD_CONCEPTS.find((x) => x.id === concept)
  const dims = `${size.width}x${size.height}`
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="ad.size" content="width=${size.width},height=${size.height}">
<meta name="viewport" content="width=${size.width},initial-scale=1">
<title>ONE Agency · ${esc(c.name)} · ${dims}</title>
<!-- ONE Agency brand kit v1.0 (2026-11-17). Concept ${c.letter}: ${esc(c.name)}. Generated by scripts/build-motion-ads.mjs; edit the copy in src/data/ad-copy.ts and rebuild. -->
<style>
${css(size)}
</style>
</head>
<body>
<a id="ad" href="${CLICK_URL}" target="_blank" rel="noopener">
${body(concept, size)}
</a>
<script src="one-motion.js"></script>
<script>
var clickTag = '${CLICK_URL}'
document.getElementById('ad').addEventListener('click', function (e) { e.preventDefault(); window.open(clickTag, '_blank') })
;(function () {
  var M = window.OneMotion
  var $ = function (id) { return document.getElementById(id) }
  var el = {
    logo: $('logo'), bar: $('bar'), eyebrow: $('eyebrow'), headline: $('headline'), sub: $('sub'),
    attr: $('attr'), sweep: $('sweep'), laurel: $('laurel'), cta: $('cta'), small: $('small'),
    linePath: $('line-path'), lineDot: $('line-dot'), lineRing: $('line-ring'),
    stats: Array.prototype.slice.call(document.querySelectorAll('.stat'))
  }
  function render(t) {${TIMELINES[concept](c.accent)}
  }
  var params = new URLSearchParams(location.search)
  var still = params.has('export') || params.has('t')
  var ad = M.player(render, { duration: ${MOTION_AD_DURATION[concept]}, autoplay: false })
  document.fonts.ready.then(function () {
    if (params.has('t')) ad.seek(Number(params.get('t')))
    else if (!still) ad.play()
  })
  window.oneAd = { duration: ${MOTION_AD_DURATION[concept]}, width: ${size.width}, height: ${size.height}, seek: ad.seek, ready: document.fonts.ready }
})()
</script>
</body>
</html>
`
}

/* ------------------------------------------------------------------ write */

rmSync(ADS, { recursive: true, force: true })
mkdirSync(resolve(PUBLIC, 'kit/motion/exports'), { recursive: true })
for (const concept of MOTION_AD_CONCEPTS) {
  for (const size of MOTION_AD_SIZES) {
    const slug = motionAdSlug(concept, size)
    const dir = resolve(ADS, slug)
    mkdirSync(resolve(dir, 'fonts'), { recursive: true })
    for (const [name, from] of Object.entries(SHARED)) copyFileSync(resolve(ROOT, from), resolve(dir, name))
    writeFileSync(resolve(dir, 'index.html'), html(concept, size))
    const files = ['index.html', ...Object.keys(SHARED)].map((name) => ({ name, data: readFileSync(resolve(dir, name)) }))
    writeFileSync(resolve(PUBLIC, motionAdExport(concept, size, 'zip').slice(1)), zipFiles(files))
  }
}
console.log(`motion ads: ${MOTION_AD_CONCEPTS.length * MOTION_AD_SIZES.length} HTML5 ads in public/kit/motion/ads, packages in public/kit/motion/exports`)
