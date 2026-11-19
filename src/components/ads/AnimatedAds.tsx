import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { AD_CONCEPTS } from '../../data/ad-copy'
import { MOTION_AD_DURATION, MOTION_AD_SIZES, type MotionAdConcept } from '../../data/motion-ads'
import { formatSeconds } from '../../lib/format'
import { swap } from '../../lib/motion'
import { FilterTabs } from '../ui/FilterTabs'
import { MotionAdCard } from './MotionAdCard'

/** The three HTML5 concepts in three sizes, exported to MP4, GIF and an end-frame PNG. */
export function AnimatedAds() {
  const [concept, setConcept] = useState<MotionAdConcept>('audit')
  const options = AD_CONCEPTS.map((c) => ({ id: c.id, label: `${c.letter}. ${c.name}` }))
  const current = AD_CONCEPTS.find((c) => c.id === concept)!

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterTabs label="Animated ad concept" layoutId="motion-ad-concept" options={options} value={concept} onChange={setConcept} controls="motion-ads" />
        <p className="text-step-small text-text-3">
          {formatSeconds(MOTION_AD_DURATION[concept])} · plays once, holds on the CTA · source: {current.source}
        </p>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={concept}
          id="motion-ads"
          role="tabpanel"
          aria-label={current.name}
          variants={swap}
          initial="hidden"
          animate="show"
          exit="exit"
          className="flex flex-wrap items-start gap-6"
        >
          {MOTION_AD_SIZES.map((size) => (
            <MotionAdCard key={`${size.width}x${size.height}`} concept={concept} size={size} name={`Concept ${current.letter}, ${current.name}`} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
