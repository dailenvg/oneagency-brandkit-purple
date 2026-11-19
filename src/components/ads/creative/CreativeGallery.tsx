import { AnimatePresence, motion } from 'motion/react'
import { useState, type CSSProperties } from 'react'
import { CREATIVE_AD_SIZES, CREATIVE_CONCEPTS, type CreativeAdConcept, type CreativeAdSize, type CreativeConceptId, type CreativeFormat } from '../../../data/ad-creative'
import { cappedStagger, sequence, swap, viewport } from '../../../lib/motion'
import { FilterTabs } from '../../ui/FilterTabs'
import { CreativeAdActions } from './CreativeAdActions'
import { CreativeAdCard } from './CreativeAdCard'
import { CreativeAdLightbox, type OpenCreativeAd } from './CreativeAdLightbox'
import { MobiusCredit } from './MobiusCredit'

type ConceptFilter = CreativeConceptId | 'all'
type SizeFilter = CreativeFormat | 'all'

/** Card columns per size: each card wide enough to read the ad, as many per row as fit. */
const MIN_CARD: Record<CreativeFormat, string> = { square: '15rem', portrait: '14rem', story: '11rem', landscape: '19rem' }
/** "All sizes": a concept's four sizes side by side at one height. */
const ROW_HEIGHT = 300

const CONCEPT_OPTIONS = [{ id: 'all' as ConceptFilter, label: 'All concepts' }, ...CREATIVE_CONCEPTS.map((c) => ({ id: c.id as ConceptFilter, label: c.name }))]
const SIZE_OPTIONS = [{ id: 'all' as SizeFilter, label: 'All sizes' }, ...CREATIVE_AD_SIZES.map((s) => ({ id: s.format as SizeFilter, label: `${s.label} ${s.width}×${s.height}` }))]

/** The ten creative concepts, filtered by concept and by size. Each card opens the ad at true size. */
export function CreativeGallery() {
  const [concept, setConcept] = useState<ConceptFilter>('all')
  const [format, setFormat] = useState<SizeFilter>('square')
  const [open, setOpen] = useState<OpenCreativeAd | null>(null)
  const concepts = concept === 'all' ? CREATIVE_CONCEPTS : CREATIVE_CONCEPTS.filter((c) => c.id === concept)
  const sizes = format === 'all' ? CREATIVE_AD_SIZES : CREATIVE_AD_SIZES.filter((s) => s.format === format)

  /** Names the panel after the current filters, e.g. "Creative ads: All concepts, Square 1080×1080". */
  const panelLabel = `Creative ads: ${CONCEPT_OPTIONS.find((o) => o.id === concept)?.label}, ${SIZE_OPTIONS.find((o) => o.id === format)?.label}`

  const card = (c: CreativeAdConcept, size: CreativeAdSize, style?: CSSProperties, sizeOnly = false) => (
    <CreativeAdCard key={`${c.id}-${size.format}`} concept={c} size={size} style={style} sizeOnly={sizeOnly} onOpen={() => setOpen({ concept: c, size })} />
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <FilterTabs label="Filter creative ads by concept" layoutId="creative-concept" options={CONCEPT_OPTIONS} value={concept} onChange={setConcept} controls="creative-gallery" />
        <FilterTabs label="Filter creative ads by size" layoutId="creative-size" options={SIZE_OPTIONS} value={format} onChange={setFormat} controls="creative-gallery" />
      </div>
      {/*
        Below the fold on load, so the first set reveals on scroll (stagger through the cards' `reveal` variants); after a
        filter change the panel is already in view and the new set staggers in at once. Exits on `swap`.
      */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${concept}-${format}`}
          id="creative-gallery"
          role="tabpanel"
          aria-label={panelLabel}
          variants={swap}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          exit="exit"
        >
          {format === 'all' ? (
            <div className="flex flex-col gap-12">
              {concepts.map((c) => (
                <section key={c.id} aria-labelledby={`creative-${c.id}`}>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <div className="flex min-w-0 flex-col gap-1">
                      <h3 id={`creative-${c.id}`} className="text-step-1 font-semibold text-text-2">
                        {c.name}
                      </h3>
                      <MobiusCredit concept={c} />
                    </div>
                    <CreativeAdActions concept={c} inline />
                  </div>
                  <motion.ul role="list" className="flex flex-wrap items-start gap-6" variants={sequence(cappedStagger(sizes.length))}>
                    {sizes.map((s) => card(c, s, { width: Math.round((ROW_HEIGHT * s.width) / s.height) }, true))}
                  </motion.ul>
                </section>
              ))}
            </div>
          ) : (
            <motion.ul
              role="list"
              className="grid gap-x-6 gap-y-10"
              style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${MIN_CARD[format]}), 1fr))` }}
              variants={sequence(cappedStagger(concepts.length * sizes.length))}
            >
              {concepts.flatMap((c) => sizes.map((s) => card(c, s)))}
            </motion.ul>
          )}
        </motion.div>
      </AnimatePresence>
      <CreativeAdLightbox open={open} onClose={() => setOpen(null)} />
    </div>
  )
}
