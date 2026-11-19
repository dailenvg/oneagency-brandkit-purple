import { ArrowsOut } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { GLASS_REFERENCES, REFERENCE_PREVIEW_SIZE, REFERENCE_SIZE, referenceFile, referencePreview, type GlassReference } from '../../data/glass-references'
import { assetFor } from '../../lib/assets'
import { reveal } from '../../lib/motion'
import { DownloadLink } from '../ui/DownloadLink'
import { Lightbox } from '../ui/Lightbox'
import { Reveal } from '../ui/Reveal'
import { SmartImage } from '../ui/SmartImage'

/** The nine reference ads: preview, what each shows of the style, the PNG download and a full-size view. */
export function ReferenceGallery() {
  const [open, setOpen] = useState<GlassReference | null>(null)
  return (
    <>
      <Reveal as="ul" stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {GLASS_REFERENCES.map((ref) => {
          const file = referenceFile(ref.slug)
          return (
            <motion.li key={ref.slug} variants={reveal} className="flex flex-col overflow-hidden rounded-site border border-edge bg-surface">
              <SmartImage
                src={referencePreview(ref.slug)}
                alt={ref.alt}
                width={REFERENCE_PREVIEW_SIZE}
                height={REFERENCE_PREVIEW_SIZE}
                className="aspect-square bg-surface-2"
                imgClassName="size-full object-cover"
                overlay={
                  <button type="button" onClick={() => setOpen(ref)} aria-label={`Open ${ref.title} at full size`} className="group absolute inset-0 cursor-zoom-in focus-visible:-outline-offset-4">
                    <span
                      aria-hidden
                      className="absolute right-3 bottom-3 grid size-touch place-items-center rounded-full bg-void/70 text-text opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                    >
                      <ArrowsOut className="size-5" />
                    </span>
                  </button>
                }
              />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="font-semibold text-text">{ref.title}</h3>
                <p className="text-step-small text-text-2">{ref.shows}</p>
                <div className="mt-auto">
                  <DownloadLink url={file} label={`PNG ${REFERENCE_SIZE}×${REFERENCE_SIZE}`} bytes={assetFor(file)?.bytes} />
                </div>
              </div>
            </motion.li>
          )
        })}
      </Reveal>
      <Lightbox open={!!open} onClose={() => setOpen(null)} title={open ? `${open.title} · ${REFERENCE_SIZE}×${REFERENCE_SIZE}` : ''}>
        {open && <img src={referenceFile(open.slug)} alt={open.alt} width={REFERENCE_SIZE} height={REFERENCE_SIZE} className="mx-auto h-auto max-h-[75svh] w-auto max-w-full rounded-site-sm" />}
      </Lightbox>
    </>
  )
}
