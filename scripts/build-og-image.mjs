/**
 * The hub's own link preview (og:image): what ClickUp, Slack and the rest show when the deploy URL is shared.
 * Not a kit download (the logo's plain og-image in public/kit/logos/social is), so it lives in public/og and is never zipped.
 *
 * Composed from kit assets: the energy Möbius on navy, the horizontal logo on dark, Geist with a Metal accent word lit
 * by the site's neon filter, Lato for the version line. Run: npm run kit:og
 */
import { mkdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { KIT } from '../src/lib/kit.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/og/one-agency_brand-kit_og-image_1200x630.jpg')
const W = 1200
const H = 630

const dataUri = (path, type) => `data:${type};base64,${readFileSync(resolve(ROOT, path)).toString('base64')}`
const font = (family, file, weight) =>
  `@font-face { font-family: "${family}"; src: url(${dataUri(`src/assets/fonts/${file}`, 'font/woff2')}) format("woff2"); font-weight: ${weight}; }`

const BG = dataUri('public/kit/elements/mobius/one-agency_element_mobius-energy-side-on-navy_1200x628.jpg', 'image/jpeg')
const LOGO = dataUri('public/kit/logos/horizontal/one-agency_logo_horizontal-on-dark.svg', 'image/svg+xml')

const html = /* html */ `<!doctype html>
<html><head><meta charset="utf-8" /><style>
${font('Geist', 'geist-500.woff2', 500)}
${font('Geist', 'geist-700.woff2', 700)}
${font('Lato', 'lato-700.woff2', 700)}
${font('Metal', 'metal-400.woff2', 400)}
* { margin: 0; box-sizing: border-box; }
html, body { width: ${W}px; height: ${H}px; background: #01030f; overflow: hidden; }
body { position: relative; font-family: "Geist", sans-serif; color: #fff; -webkit-font-smoothing: antialiased; }
.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 100% 50%; transform: translateX(40px) scale(1.08); transform-origin: right center; }
/* Keeps the type side clean and lets the loop fall away at the edges. */
.scrim { position: absolute; inset: 0;
  background:
    linear-gradient(90deg, #01030f 0%, #01030f 30%, rgba(1,3,15,.7) 46%, rgba(1,3,15,0) 62%),
    radial-gradient(60% 80% at 0% 100%, rgba(55,141,240,.10), transparent 70%),
    linear-gradient(0deg, rgba(1,3,15,.55), transparent 26%); }
.content { position: absolute; inset: 0; padding: 72px 80px; display: flex; flex-direction: column; justify-content: space-between; }
.logo { height: 46px; width: auto; display: block; align-self: flex-start; }
h1 { font-weight: 700; font-size: 132px; line-height: .95; letter-spacing: -.035em; }
.accent { font-family: "Metal", serif; font-weight: 400; letter-spacing: 0; font-size: 1.12em;
  background: linear-gradient(90deg, #ffa0aa 0%, #378df0 100%); -webkit-background-clip: text; background-clip: text; color: transparent;
  padding: 0 .06em .12em 0; filter: url(#oa-neon); }
.bar { width: 128px; height: 6px; border-radius: 3px; margin: 30px 0 26px; background: linear-gradient(90deg, #F59FAE 0%, #6D92DE 100%); }
.lede { font-weight: 500; font-size: 30px; line-height: 1.35; color: #b0b2c1; max-width: 560px; }
.meta { font-family: "Lato", sans-serif; font-weight: 700; font-size: 20px; letter-spacing: .04em; color: #9a9db0; display: flex; gap: 14px; align-items: center; }
.meta i { width: 5px; height: 5px; border-radius: 50%; background: #767a90; }
</style></head>
<body>
  <svg width="0" height="0" style="position:absolute">
    <filter id="oa-neon" x="-25%" y="-60%" width="150%" height="220%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="core" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="glow" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="bloom" />
      <feComposite in="core" in2="glow" operator="arithmetic" k2="0.55" k3="0.75" result="cg" />
      <feComposite in="cg" in2="bloom" operator="arithmetic" k2="1" k3="0.8" result="light" />
      <feComposite in="SourceGraphic" in2="light" operator="arithmetic" k2="1" k3="1" />
    </filter>
  </svg>
  <img class="bg" src="${BG}" alt="" />
  <div class="scrim"></div>
  <div class="content">
    <img class="logo" src="${LOGO}" alt="ONE Agency" />
    <div>
      <h1>Brand <span class="accent">kit</span></h1>
      <div class="bar"></div>
      <p class="lede">Logos, colour, type, elements, motion and ads, ready to download.</p>
    </div>
    <p class="meta"><span>v${KIT.version}</span><i></i><span>Updated ${KIT.updated}</span></p>
  </div>
</body></html>`

mkdirSync(dirname(OUT), { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
await page.setContent(html, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: OUT, type: 'jpeg', quality: 90 })
await browser.close()
console.log(`og image → ${OUT.replace(`${ROOT}/`, '')} (${Math.round(statSync(OUT).size / 1024)} KB)`)
