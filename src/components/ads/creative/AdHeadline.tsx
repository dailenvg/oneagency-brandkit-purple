import { Fragment } from 'react'
import type { CreativeAdConcept, CreativeFormat } from '../../../data/ad-creative'
import { GradientText } from '../../../kit/motion/GradientText'
import { adText } from './ad-type'

interface AdHeadlineProps {
  concept: Pick<CreativeAdConcept, 'headline' | 'accent'>
  format: CreativeFormat
  /** Multiplier on the format's headline size (long headlines run smaller). */
  scale?: number
  className?: string
}

/**
 * Headline in Unbounded 600 with its one accent word in Unbounded and the signature gradient. A quote is set without quote marks:
 * the Mint quote glyph beside it carries that.
 */
export function AdHeadline({ concept, format, scale = 1, className }: AdHeadlineProps) {
  const words = concept.headline.split(' ')
  const last = words.length - 1
  return (
    <p className={`text-balance ${className ?? ''}`} style={{ ...adText('headline', format, scale), paddingTop: '0.12em' }}>
      {words.map((word, i) => {
        return (
          <Fragment key={i}>
            {i === concept.accent ? <GradientText>{word}</GradientText> : word}
            {i < last && ' '}
          </Fragment>
        )
      })}
    </p>
  )
}
