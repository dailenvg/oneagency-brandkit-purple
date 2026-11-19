import type { CreativeAdConcept } from '../../../data/ad-creative'

/** The kit-wide Möbius loop credit (as in the Overview hero and the footer), wherever the loop or its stills appear. */
export function MobiusCreditLine() {
  return <p className="text-step-small text-text-3">Möbius loop: ConversionIQ key visual, used as supplied.</p>
}

/** The credit under a creative ad, for concepts with the loop as backdrop. */
export function MobiusCredit({ concept }: { concept: CreativeAdConcept }) {
  if (concept.backdrop !== 'mobius') return null
  return <MobiusCreditLine />
}
