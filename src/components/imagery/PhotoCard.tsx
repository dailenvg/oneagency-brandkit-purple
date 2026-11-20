import { ArrowUpRight, MagnifyingGlassPlus } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { unsplashUrl, type BrandPhoto } from '../../data/imagery-photos'
import { photoZoom, pressCard, reveal } from '../../lib/motion'
import { buttonClass } from '../ui/button-styles'
import { DownloadLink } from '../ui/DownloadLink'
import { SmartImage } from '../ui/SmartImage'

/** One photo of the Nova set: the image (zooms gently on hover, opens larger on click), its credit and its download. */
export function PhotoCard({ photo, onOpen }: { photo: BrandPhoto; onOpen: () => void }) {
  return (
    <motion.li variants={reveal} whileHover="hover" className="flex flex-col overflow-hidden rounded-site border border-edge bg-surface">
      <div className="overflow-hidden" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
        {/* The card's reveal drives "show"; at rest the photo sits at its own size. */}
        <motion.div variants={{ ...photoZoom, show: photoZoom.rest }} className="size-full">
          <SmartImage
            src={photo.url}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            className="size-full bg-surface-2"
            imgClassName="size-full object-cover"
            overlay={
              <motion.button
                type="button"
                onClick={onOpen}
                aria-label={`View ${photo.title} larger`}
                // Two-tone ring (navy edge, white inside) so focus shows on any photo, Mint and Violet ones included.
                className="group absolute inset-0 cursor-zoom-in focus-visible:-outline-offset-4 focus-visible:outline-paper focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-inset"
                whileTap={pressCard.whileTap}
              >
                <span
                  className="absolute right-3 bottom-3 grid size-touch place-items-center rounded-full bg-void/70 text-text opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                  aria-hidden
                >
                  <MagnifyingGlassPlus className="size-5" />
                </span>
              </motion.button>
            }
          />
        </motion.div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p>
          <span className="block font-semibold text-text">{photo.title}</span>
          <span className="text-step-small text-text-3">
            Pairs with {photo.mood} · {photo.width}×{photo.height}
          </span>
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <a
            href={unsplashUrl(photo.unsplashId)}
            target="_blank"
            rel="noopener noreferrer"
            // Starts with the visible text (WCAG 2.5.3 label in name).
            aria-label={`Unsplash ${photo.unsplashId}, the photo's source page (opens in a new tab)`}
            className={buttonClass('link', 'sm', '-ms-4')}
          >
            Unsplash {photo.unsplashId} <ArrowUpRight aria-hidden />
          </a>
          <DownloadLink url={photo.url} label="WebP" bytes={photo.bytes} className="ml-auto" />
        </div>
      </div>
    </motion.li>
  )
}
