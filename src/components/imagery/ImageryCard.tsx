import { ArrowUpRight, MagnifyingGlassPlus } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { adDescription } from '../../data/visitor-descriptions'
import { displaySrc } from '../../lib/ads'
import { cropLabel, subjectFiles, type ImagerySubject } from '../../lib/imagery'
import { pressCard, reveal } from '../../lib/motion'
import { buttonClass } from '../ui/button-styles'
import { DownloadMenu } from '../ui/DownloadMenu'
import { SmartImage } from '../ui/SmartImage'

/** A starter-library subject: the master image (opens larger on click) and one download menu with every crop. */
export function ImageryCard({ subject, onOpen }: { subject: ImagerySubject; onOpen: () => void }) {
  const { master, crops, name } = subject
  const src = displaySrc(master.files)!
  const description = adDescription(master)
  return (
    <motion.li variants={reveal} className="flex flex-col overflow-hidden rounded-site border border-edge bg-surface">
      {/* The view button is an overlay (not a wrapper) so it never nests with the image's own Retry button; the aspect
          ratio keeps the skeleton and the error state at the image's size. */}
      <SmartImage
        src={src}
        alt={description ?? name}
        width={master.width}
        height={master.height}
        style={{ aspectRatio: `${master.width} / ${master.height}` }}
        className="w-full bg-surface-2"
        imgClassName="size-full object-cover"
        overlay={
          <motion.button
            type="button"
            onClick={onOpen}
            aria-label={`View ${name} larger`}
            className="group absolute inset-0 cursor-zoom-in focus-visible:-outline-offset-4"
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
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p>
          <span className="block font-semibold text-text">{name}</span>
          <span className="text-step-small text-text-3">
            {crops.length > 1 ? `${crops.length} sizes: ${crops.map(cropLabel).join(', ')}` : cropLabel(master)}
          </span>
        </p>
        {description && <p className="text-step-small text-text-2">{description}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-2">
          {master.magnificUrl && (
            <a
              href={master.magnificUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Edit in Magnific: ${name} (opens in a new tab)`}
              className={buttonClass('link', 'sm', '-ms-4')}
            >
              Edit in Magnific <ArrowUpRight aria-hidden />
            </a>
          )}
          <DownloadMenu title={name} className="ml-auto" files={subjectFiles(subject)} />
        </div>
      </div>
    </motion.li>
  )
}
