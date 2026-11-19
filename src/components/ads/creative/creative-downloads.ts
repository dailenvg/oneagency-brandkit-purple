import { CREATIVE_AD_SIZES, type CreativeAdConcept } from '../../../data/ad-creative'
import { creativeAdFiles } from '../../../lib/creative-ads'
import type { DownloadFile } from '../../ui/DownloadMenu'

/** Every exported size of a concept for the download menu: one row per size, PNG and WebP buttons. */
export const creativeDownloads = (concept: CreativeAdConcept): DownloadFile[] =>
  CREATIVE_AD_SIZES.flatMap((size) => {
    const files = creativeAdFiles(concept.id, size.format)
    const group = `${size.width}×${size.height}`
    return (['png', 'webp'] as const).flatMap((ext) => (files[ext] ? [{ url: files[ext].url, label: ext === 'png' ? 'PNG' : 'WebP', bytes: files[ext].bytes, group }] : []))
  })
