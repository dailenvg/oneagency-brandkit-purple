import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import type { CreativeAdConcept, CreativeAdSize } from '../../../data/ad-creative'
import { pressCard, reveal } from '../../../lib/motion'
import { CreativeAdActions } from './CreativeAdActions'
import { MobiusCredit } from './MobiusCredit'
import { ScaledAd } from './ScaledAd'
import { TrueSizeButton } from './TrueSizeButton'

interface CreativeAdCardProps {
  concept: CreativeAdConcept
  size: CreativeAdSize
  onOpen: () => void
  style?: CSSProperties
  /**
   * "All sizes" rows: the concept's heading already carries its name, source page and downloads (one menu per concept,
   * not four identical ones), so the card shows only its size.
   */
  sizeOnly?: boolean
}

/** A creative ad, live and fitted, with its name, source page and the downloads for every size. Opens at true size. */
export function CreativeAdCard({ concept, size, onOpen, style, sizeOnly = false }: CreativeAdCardProps) {
  const dims = `${size.width}×${size.height}`
  return (
    <motion.li variants={reveal} className="flex max-w-full flex-col gap-3" style={style}>
      <motion.div {...pressCard} className="relative overflow-hidden rounded-site-sm border border-edge bg-surface-2 shadow-card">
        <ScaledAd concept={concept} size={size} />
        <TrueSizeButton concept={concept} size={size} onOpen={onOpen} />
      </motion.div>
      {sizeOnly ? (
        <p className="font-num text-step-small text-text-3">
          {size.label} {dims}
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="flex flex-wrap items-baseline gap-x-3">
            <span className="font-semibold text-text">{concept.name}</span>
            <span className="font-num text-step-small text-text-3">
              {size.label} {dims}
            </span>
          </p>
          <MobiusCredit concept={concept} />
          <CreativeAdActions concept={concept} />
        </div>
      )}
    </motion.li>
  )
}
