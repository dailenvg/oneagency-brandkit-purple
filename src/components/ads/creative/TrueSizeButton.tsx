import { ArrowsOut } from '@phosphor-icons/react'
import type { CreativeAdConcept, CreativeAdSize } from '../../../data/ad-creative'

interface TrueSizeButtonProps {
  concept: CreativeAdConcept
  size: CreativeAdSize
  onOpen: () => void
  /** The frame's radius class, so the inset focus ring follows its corners. */
  rounded?: 'rounded-site' | 'rounded-site-sm'
}

/**
 * The "open at true size" overlay on a live ad (hero and gallery cards): the whole frame is the target, the cue in the
 * corner is decorative and shows on hover, focus and press, and always on touch screens.
 */
export function TrueSizeButton({ concept, size, onOpen, rounded = 'rounded-site-sm' }: TrueSizeButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`Open ${concept.name}, ${size.width}×${size.height}, at true size`}
      className={`group absolute inset-0 cursor-zoom-in ${rounded} focus-visible:-outline-offset-4`}
    >
      <span
        aria-hidden
        className="absolute top-2 right-2 grid size-touch place-items-center rounded-full bg-void/70 text-text opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100 [@media(hover:none)]:opacity-100"
      >
        <ArrowsOut className="size-5" />
      </span>
    </button>
  )
}
