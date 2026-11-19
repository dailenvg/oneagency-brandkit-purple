#!/usr/bin/env node
/**
 * Builds the download ZIPs and the asset list from whatever is in public/kit/ right now, so it can be re-run any time
 * (for example after the Magnific templates and imagery land):
 *   public/kit/zips/one-agency_kit_[group].zip   one per group with files (logos, colour, fonts, elements, glass,
 *                                                templates, ads, imagery, motion, copy)
 *   public/kit/zips/one-agency_kit_full.zip      everything, under one-agency_kit/
 *   src/data/assets.generated.json              every listed file with format, dimensions, size and preview
 *
 * A group is public/kit/[group] unless src/lib/kit.ts gives it `paths` (glass: illustrations, textures, references and
 * the ConversionIQ credit). Inside the ZIPs, paths drop the leading kit/.
 *
 * The full kit keeps one raster format per illustration: the WebP twin of an illustration PNG is left out of
 * one-agency_kit_full.zip (its README says so) to stay under GitHub's 100 MiB file limit. The glass ZIP has both.
 * For the same reason, the Möbius stills (elements/mobius/, rendered by scripts/build-mobius.mjs) and the creative ads
 * (ads/creative/, rendered by scripts/export-creative-ads.mjs) are on the site and in their group ZIPs (elements and
 * ads) but not in the full kit.
 *
 * The HTML5 ad source folders (motion/ads/) go into the ZIPs but are not listed one by one: each ad is listed as its
 * package, motion/exports/one-agency_motion-[concept]_[WxH].zip.
 *
 * Usage: node scripts/build-zips.mjs   (npm run kit:zips)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mediaInfo } from './lib/media-info.mjs'
import { zipFiles } from './lib/zip.mjs'
import { ASSET_GROUPS, FULL_KIT_URL, groupPaths, KIT, VERSION_NOTE, zipUrl } from '../src/lib/kit.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = resolve(ROOT, 'public')
const ZIPS = resolve(PUBLIC, 'kit/zips')
const MANIFEST = resolve(ROOT, 'src/data/assets.generated.json')

const IMAGE = /\.(png|jpe?g|webp|gif|svg)$/i
const VIDEO = /\.(mp4|webm)$/i
const UNLISTED = /^kit\/motion\/ads\//

const README = `ONE Agency brand kit
${VERSION_NOTE}

Digital only: RGB colour, px sizes, SVG/PNG/JPG/WebP, web fonts, MP4/GIF and HTML5.
File names follow one-agency_[asset]_[variant]_[size].[ext].

Folders
  logos/      stacked, horizontal and icon lockups (on dark, on light, white, ink), favicons, social images
  colour/     the live site's colour tokens as CSS and JSON
  fonts/      Geist, Lato and Metal (TTF and WOFF2) with their licences
  elements/   signature devices, patterns and illustrations (on dark and on light), the Möbius loop stills
              (elements/mobius/, not in the full kit), halo, glow field, laurel, CTA buttons, proof bar, award badge, icons
  illustrations/, textures/  glass illustrations (AI-generated in Magnific) and textures (made in code)
  references/ the nine reference ads the glass and texture style comes from
  vendor/ciq/ ConversionIQ's README for the Möbius loop, the source of its credit
  templates/  ad templates and sample ads (editable versions live in Magnific)
  ads/        the creative ads: ten concepts in four sizes, PNG and WebP (not in the full kit). Three of them
              (technology, results, vacation-ownership) are built on the Möbius loop stills.
  imagery/    starter image library, AI-generated in Magnific (no real people or clients); stand-ins until real client work exists
  motion/     one-motion.js (the motion runtime), HTML5 ad sources, and exports (MP4, GIF, end frames, HTML5 ZIPs)
  copy/       the copy bank (Markdown and JSON)

Licences
  Geist, Lato and Metal are under the SIL Open Font License 1.1 (see fonts/*_ofl.txt).
  Logos and all other brand assets belong to ONE Agency, LLC. Use them only for ONE Agency work.
  The 2026 ARDY Award belongs to ConversionIQ.ai; say so wherever it appears.
  The Möbius loop is ConversionIQ's key visual, used as supplied: the stills in elements/mobius/ and the three ads
  in ads/ built on them. Never edit, redraw or recolour it, and credit it wherever it appears:
  "Möbius loop: ConversionIQ key visual, used as supplied."

Sources
  Colour: ${KIT.liveCss} (pulled ${KIT.liveCssPulled})
  Logo: ${KIT.site}/assets/img/one-agency-logo.svg
  Proof figures 10M+, $100M+, 7B+, 450K+: as published on oneagency.com, November 2026.
`

/** Every file under a folder (or the file itself), as paths relative to public/ with forward slashes. Dotfiles are skipped. */
function walk(path) {
  if (!existsSync(path)) return []
  if (!statSync(path).isDirectory()) return [relative(PUBLIC, path).split(sep).join('/')]
  return readdirSync(path, { withFileTypes: true }).flatMap((d) => (d.name.startsWith('.') ? [] : walk(resolve(path, d.name))))
}

/** Name inside a ZIP: the path under public/kit/, or under public/ for anything outside kit/. */
const zipName = (rel) => rel.replace(/^kit\//, '')

function previewFor(rel, files) {
  if (IMAGE.test(rel)) return `/${rel}`
  if (VIDEO.test(rel)) {
    const poster = rel.replace(VIDEO, '.png')
    return files.includes(poster) ? `/${poster}` : null
  }
  return null
}

function entry(rel, group, files) {
  const path = resolve(PUBLIC, rel)
  const buf = readFileSync(path)
  const name = rel.slice(rel.lastIndexOf('/') + 1)
  return {
    url: `/${rel}`,
    name,
    group,
    format: name.slice(name.lastIndexOf('.') + 1).toUpperCase(),
    bytes: buf.length,
    ...mediaInfo(path, buf),
    preview: previewFor(rel, files),
  }
}

/** An illustration WebP whose PNG twin is in the kit: the full ZIP carries the PNG only. */
const WEBP_TWIN = /^kit\/illustrations\/(.+)\.webp$/
const isWebpTwin = (rel, all) => WEBP_TWIN.test(rel) && all.has(rel.replace(/\.webp$/, '.png'))
/** The Möbius stills: in the elements ZIP, not in the full kit (size). */
const MOBIUS_STILL = /^kit\/elements\/mobius\//
/** The creative ads: in the ads ZIP, not in the full kit (size). */
const CREATIVE_ADS = /^kit\/ads\//
const leftOutOfFull = (rel, all) => isWebpTwin(rel, all) || MOBIUS_STILL.test(rel) || CREATIVE_ADS.test(rel)

const FULL_NOTE = `
Full kit only
  Illustrations come as PNG only here, to keep this ZIP under 100 MiB. Their WebP versions are in
  one-agency_kit_glass.zip and on the site.
  The Möbius loop stills (elements/mobius/) are in one-agency_kit_elements.zip and on the site, not here.
  The creative ads (ads/creative/) are in one-agency_kit_ads.zip and on the site, not here.
`

const zipEntries = (rels, prefix = '', note = '') => [
  { name: `${prefix}README.txt`, data: Buffer.from(README + note) },
  ...rels.map((rel) => ({ name: `${prefix}${zipName(rel)}`, data: readFileSync(resolve(PUBLIC, rel)) })),
]

rmSync(ZIPS, { recursive: true, force: true })
mkdirSync(ZIPS, { recursive: true })

const groups = []
const listed = []
const everything = []
for (const g of ASSET_GROUPS) {
  const rels = groupPaths(g.id)
    .flatMap((p) => walk(resolve(PUBLIC, p)))
    .sort()
  everything.push(...rels)
  const shown = rels.filter((rel) => !UNLISTED.test(rel))
  listed.push(...shown.map((rel) => entry(rel, g.id, rels)))
  let zip = null
  if (rels.length) {
    const data = zipFiles(zipEntries(rels))
    writeFileSync(resolve(PUBLIC, zipUrl(g.id).slice(1)), data)
    zip = { url: zipUrl(g.id), bytes: data.length, files: rels.length }
  }
  groups.push({ id: g.id, label: g.label, count: shown.length, bytes: shown.reduce((n, rel) => n + statSync(resolve(PUBLIC, rel)).size, 0), zip })
}

const everyRel = new Set(everything)
const fullRels = everything.filter((rel) => !leftOutOfFull(rel, everyRel))
const full = zipFiles(zipEntries(fullRels, 'one-agency_kit/', FULL_NOTE))
writeFileSync(resolve(PUBLIC, FULL_KIT_URL.slice(1)), full)

const manifest = {
  generatedAt: new Date().toISOString(),
  version: VERSION_NOTE,
  groups,
  full: { url: FULL_KIT_URL, bytes: full.length, files: fullRels.length },
  files: listed,
}
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`
for (const g of groups) console.log(`${g.id.padEnd(10)} ${String(g.count).padStart(4)} listed  ${g.zip ? `${mb(g.zip.bytes).padStart(8)} ZIP (${g.zip.files} files)` : '  (empty, no ZIP)'}`)
console.log(`full kit   ${mb(full.length)} (${fullRels.length} files; ${everything.length - fullRels.length} left out: illustration WebP twins, Möbius stills, creative ads) · ${listed.length} files listed in src/data/assets.generated.json`)
