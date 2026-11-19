import { motion } from 'motion/react'
import { useRef, useState, type CSSProperties } from 'react'
import { creativeConcept, creativeSize, type CreativeConceptId, type CreativeFormat } from '../../../data/ad-creative'
import { edgeFade, useScrollEdges } from '../../../lib/hooks'
import { pressCard, reveal, sequence, stagger } from '../../../lib/motion'
import { CreativeAdLightbox, type OpenCreativeAd } from './CreativeAdLightbox'
import { TrueSizeButton } from './TrueSizeButton'
import { ScaledAd } from './ScaledAd'

/** Three featured ads in three ratios, set as a collage: the story tall on the left, the others stepped beside it. */
const FEATURED: { concept: CreativeConceptId; format: CreativeFormat; place: string }[] = [
  { concept: 'growth-audit', format: 'story', place: 'sm:row-span-2 md:row-span-1' },
  { concept: 'paid-social', format: 'square', place: 'md:mt-24' },
  { concept: 'ai-visibility', format: 'portrait', place: 'md:mt-10' },
]

/**
 * The lead of the Ads view: live creative ads on a soft brand glow, each opening at true size. Phones get a swipe strip
 * at one readable height (20rem, the next ad peeking in); from 640 px up the ads sit as a stepped collage.
 */
export function CreativeHero() {
  const [open, setOpen] = useState<OpenCreativeAd | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const edges = useScrollEdges(listRef)
  return (
    <>
      {/* The lightbox stays outside the isolated glow wrapper: inside it, the fixed sidebar would paint over the dialog. */}
      <div className="relative isolate">
        {/* Never wider than the page gutter (24 px minimum), so the glow never makes the page scroll sideways. */}
        <div aria-hidden className="ui-glow-field absolute -inset-x-4 -inset-y-6 -z-10 rounded-site opacity-70 blur-2xl sm:-inset-x-6" />
        <motion.ul
          ref={listRef}
          role="list"
          aria-label="Featured creative ads"
          className="scroll-strip -mx-1 flex snap-x snap-mandatory scroll-px-1 items-start gap-4 overflow-x-auto px-1 pt-1 pb-4 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:p-0 md:grid-cols-[1fr_1.15fr_1fr] md:gap-8"
          style={edgeFade(edges)}
          variants={sequence(stagger.children)}
          initial="hidden"
          animate="show"
        >
          {FEATURED.map(({ concept: id, format, place }) => {
            const concept = creativeConcept(id)!
            const size = creativeSize(format)!
            return (
              <motion.li
                key={id}
                variants={reveal}
                className={`max-sm:w-[calc(20rem*var(--ar))] max-sm:max-w-full max-sm:shrink-0 max-sm:snap-start ${place}`}
                style={{ '--ar': size.width / size.height } as CSSProperties}
              >
                <motion.figure {...pressCard} className="flex flex-col gap-2">
                  <div className="relative overflow-hidden rounded-site border border-edge shadow-card">
                    <ScaledAd concept={concept} size={size} />
                    <TrueSizeButton concept={concept} size={size} rounded="rounded-site" onOpen={() => setOpen({ concept, size })} />
                  </div>
                  {/* text-2, not text-3: the caption can sit on the brightest part of the lilac glow (text-3 there is about 4.4:1). */}
                  <figcaption className="text-step-small text-text-2">
                    <span className="font-semibold text-text">{concept.name}</span> · <span className="font-num">{size.label} {size.width}×{size.height}</span>
                  </figcaption>
                </motion.figure>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
      <CreativeAdLightbox open={open} onClose={() => setOpen(null)} />
    </>
  )
}
