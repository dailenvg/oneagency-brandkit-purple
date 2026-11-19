#!/usr/bin/env node
/**
 * Copies the nine reference ads (the source of the glass and texture style) into the kit, renamed to the kit's file
 * pattern, and writes a WebP preview of each for the site:
 *   public/kit/references/one-agency_reference-ad_[slug]_1254x1254.png   (byte-for-byte copy with its C2PA content
 *                                                                         credentials, in the "glass" ZIP)
 *   public/previews/references/one-agency_reference-ad_[slug]_640x640.webp (display only, not a download)
 *
 * The list and the names live in src/data/glass-references.ts.
 * Usage: node scripts/copy-references.mjs [source-folder]   (npm run kit:references)
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { GLASS_REFERENCES, REFERENCE_PREVIEW_SIZE, referenceFile, referencePreview } from '../src/data/glass-references.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = resolve(ROOT, 'public')
const SOURCE = resolve(process.argv[2] ?? resolve(ROOT, '../Ads'))
const QUALITY = 0.86

if (!existsSync(SOURCE)) {
  console.log(`No source folder at ${SOURCE}; keeping the references already in public/kit/references/.`)
  process.exit(0)
}

const missing = GLASS_REFERENCES.filter((r) => !existsSync(resolve(SOURCE, r.source)))
if (missing.length) {
  console.error(`Missing in ${SOURCE}:\n  ${missing.map((r) => r.source).join('\n  ')}`)
  process.exit(1)
}

for (const dir of ['kit/references', 'previews/references']) {
  rmSync(resolve(PUBLIC, dir), { recursive: true, force: true })
  mkdirSync(resolve(PUBLIC, dir), { recursive: true })
}

const browser = await chromium.launch()
const page = await browser.newPage()

/** Scales a PNG down in the browser and returns WebP bytes. */
async function toWebp(png) {
  const dataUrl = `data:image/png;base64,${png.toString('base64')}`
  const out = await page.evaluate(
    async ({ dataUrl, size, quality }) => {
      const img = new Image()
      img.src = dataUrl
      await img.decode()
      const canvas = new OffscreenCanvas(size, size)
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, size, size)
      const blob = await canvas.convertToBlob({ type: 'image/webp', quality })
      return [...new Uint8Array(await blob.arrayBuffer())]
    },
    { dataUrl, size: REFERENCE_PREVIEW_SIZE, quality: QUALITY },
  )
  return Buffer.from(out)
}

for (const ref of GLASS_REFERENCES) {
  const from = resolve(SOURCE, ref.source)
  const kitPath = resolve(PUBLIC, referenceFile(ref.slug).slice(1))
  copyFileSync(from, kitPath)
  const webp = await toWebp(readFileSync(from))
  writeFileSync(resolve(PUBLIC, referencePreview(ref.slug).slice(1)), webp)
  console.log(`${ref.slug.padEnd(40)} PNG ${(readFileSync(kitPath).length / 1024).toFixed(0)} KB · WebP ${(webp.length / 1024).toFixed(0)} KB`)
}

await browser.close()
