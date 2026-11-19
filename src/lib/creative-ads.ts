import type { CreativeAdExt, CreativeConceptId, CreativeFormat } from '../data/ad-creative'

/** Shape of src/data/ads-creative.generated.json, written by scripts/export-creative-ads.mjs from the files on disk. */
interface CreativeAdManifest {
  generatedAt: string
  items: {
    concept: CreativeConceptId
    format: CreativeFormat
    width: number
    height: number
    files: Partial<Record<CreativeAdExt, { url: string; bytes: number }>>
  }[]
}

/** Optional at build time so a fresh checkout still builds before `npm run kit:ads` has run. */
const raw = import.meta.glob<CreativeAdManifest>('../data/ads-creative.generated.json', { eager: true, import: 'default' })
const manifest: CreativeAdManifest | null = Object.values(raw)[0] ?? null

const byKey = new Map((manifest?.items ?? []).map((item) => [`${item.concept}/${item.format}`, item.files]))

/** The exported PNG and WebP of one ad (either may be missing until the export has run). */
export const creativeAdFiles = (concept: CreativeConceptId, format: CreativeFormat) => byKey.get(`${concept}/${format}`) ?? {}
