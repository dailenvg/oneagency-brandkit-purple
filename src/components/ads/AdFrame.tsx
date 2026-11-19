import { ArrowsOut } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { adDescription } from '../../data/visitor-descriptions'
import { displaySrc, type AdItem } from '../../lib/ads'
import { formatSize } from '../../lib/format'
import { reveal } from '../../lib/motion'
import { SmartImage } from '../ui/SmartImage'
import { AdFileLinks } from './AdFileLinks'

interface AdFrameProps {
  item: AdItem
  /** Scale down to the column width instead of true pixel size. */
  fit: boolean
  onOpen: () => void
}

/** Fitted preview box, px (8pt grid): never wider or taller than this, never larger than the ad itself. */
const FIT_W = 448
const FIT_H = 560
/** Narrow formats (160x600) still get a caption column wide enough for the file chips. */
const CAPTION_MIN = 192

/**
 * A template or sample ad, fitted (default: no sideways scroll on phones, tall formats capped) or at true pixel size
 * (scrolls sideways inside its own strip when wider than the screen).
 */
export function AdFrame({ item, fit, onOpen }: AdFrameProps) {
  const src = displaySrc(item.files)!
  const description = adDescription(item)
  const fitWidth = Math.min(item.width, FIT_W, Math.round((FIT_H * item.width) / item.height))
  // Fitted: the box keeps the ad's aspect ratio so the skeleton and the error state hold their space.
  const box = fit ? { width: fitWidth, maxWidth: '100%', aspectRatio: `${item.width} / ${item.height}` } : { width: item.width, height: item.height }
  return (
    <motion.figure variants={reveal} layout className="flex max-w-full flex-col gap-3" style={fit ? { width: Math.max(fitWidth, CAPTION_MIN) } : undefined}>
      <div className="scroll-strip max-w-full overflow-x-auto rounded-site-sm">
        {/* The open button is an overlay (not a wrapper) so it never nests with the image's own Retry button. */}
        <SmartImage
          src={src}
          alt={`${item.name}${item.concept ? `, concept ${item.concept}` : ''}`}
          width={item.width}
          height={item.height}
          style={box}
          // Thin banners (728x90 fitted to 375 px is 327x40) still give the open overlay a 44 px tall target; the image letterboxes.
          className="min-h-touch bg-surface-2"
          imgClassName={fit ? 'size-full object-contain' : 'size-full max-w-none'}
          overlay={
            <button
              type="button"
              onClick={onOpen}
              aria-label={`Open ${item.name} at full size`}
              className="group absolute inset-0 min-h-touch cursor-zoom-in rounded-site-sm focus-visible:-outline-offset-4"
            >
              {/* Decorative cue (the whole image is the target): 32 px at a 4 px inset so it fits the 44 px minimum box. */}
              <span className="absolute top-1 right-1 grid size-8 place-items-center rounded-full bg-void/70 text-text opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100" aria-hidden>
                <ArrowsOut className="size-5" />
              </span>
            </button>
          }
        />
      </div>
      <figcaption className="flex flex-col gap-2">
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-semibold text-text">{item.name}</span>
          <span className="font-num text-step-small text-text-3">{formatSize(item.width, item.height)}</span>
          {item.channel === 'other' && item.channelLabel && <span className="text-step-small text-text-3">{item.channelLabel}</span>}
        </p>
        {description && <p className="max-w-md text-step-small text-text-2">{description}</p>}
        <AdFileLinks item={item} />
      </figcaption>
    </motion.figure>
  )
}
