import { STORY_SAFE, type CreativeAdConcept, type CreativeAdSize } from '../../../data/ad-creative'
import { adAlt, creativeAdFiles } from '../../../lib/creative-ads'
import { DownloadLink } from '../../ui/DownloadLink'
import { Lightbox } from '../../ui/Lightbox'

export interface OpenCreativeAd {
  concept: CreativeAdConcept
  size: CreativeAdSize
}

/** One creative ad at true pixel size: the PNG and WebP of the size being viewed, then the PNG itself. Scrolls inside. */
export function CreativeAdLightbox({ open, onClose }: { open: OpenCreativeAd | null; onClose: () => void }) {
  const files = open ? creativeAdFiles(open.concept.id, open.size.format) : {}
  const dims = open ? `${open.size.width}×${open.size.height}` : ''
  return (
    <Lightbox open={!!open} onClose={onClose} title={open ? `${open.concept.name} · ${dims}` : ''}>
      {open && (
        <div className="flex flex-col gap-4">
          {(files.png || files.webp) && (
            <div className="flex flex-wrap gap-2">
              {files.png && <DownloadLink url={files.png.url} label={`PNG ${dims}`} />}
              {files.webp && <DownloadLink url={files.webp.url} label={`WebP ${dims}`} />}
            </div>
          )}
          {open.size.format === 'story' && (
            <p className="text-step-small text-text-3">
              Story safe zone: the top {STORY_SAFE.top} px and bottom {STORY_SAFE.bottom} px carry only ground and the glass art.
            </p>
          )}
          {files.png ? (
            <img src={files.png.url} alt={adAlt(open.concept, open.size)} width={open.size.width} height={open.size.height} className="mx-auto max-w-none" style={{ width: open.size.width }} />
          ) : (
            <p className="text-step-0 text-text-2">This size isn&apos;t exported yet. Import it from Magnific with scripts/import-magnific-ads.py.</p>
          )}
        </div>
      )}
    </Lightbox>
  )
}
