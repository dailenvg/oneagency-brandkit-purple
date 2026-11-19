import type { CreativeAdConcept, CreativeFormat } from '../../../../data/ad-creative'

export type VisualPlacement = 'flow' | 'side'

/** Every visual gets the concept (some draw its list, stats, award or quote) and the format it recomposes for. */
export interface VisualProps {
  concept: CreativeAdConcept
  format: CreativeFormat
  className?: string
  /** `flow`: in the copy column, below the headline. `side`: beside the copy (square beside layouts, landscape). */
  placement: VisualPlacement
  /** Width the drawing may take beyond its slot (stories let objects run into the side margins). */
  bleed?: number
}
