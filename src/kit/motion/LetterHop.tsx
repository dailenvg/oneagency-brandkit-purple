import { motion, useReducedMotion } from 'motion/react'
import { Fragment } from 'react'
import { fade, letterHop, sequence, stagger } from '../../lib/motion'
import { textTags, trigger, type MotionTriggerProps, type TextTag } from './trigger'

interface LetterHopProps extends MotionTriggerProps {
  text: string
  as?: TextTag
  className?: string
  /** Seconds between letters. Default 0.035. */
  step?: number
}

/** Letter hop: letters land one by one from alternating lifts and tilts, with a back-out overshoot. */
export function LetterHop({ text, as = 'p', className, inView = true, delay = 0, step = stagger.letter }: LetterHopProps) {
  const reduced = useReducedMotion()
  const Tag = textTags[as]
  const words = text.trim().split(/\s+/)
  /** Index of each word's first letter in the whole line, so the alternation runs across words. */
  const offsets = words.map((_, i) => words.slice(0, i).join('').length)

  return (
    <Tag className={className} variants={reduced ? sequence(0) : sequence(step, delay)} {...trigger(inView, !!reduced)}>
      <span className="sr-only">{text}</span>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span aria-hidden className="inline-block whitespace-nowrap">
            {[...word].map((ch, ci) => (
              <motion.span key={ci} className="inline-block" custom={offsets[wi] + ci} variants={reduced ? fade : letterHop}>
                {ch}
              </motion.span>
            ))}
          </span>
          {wi < words.length - 1 && ' '}
        </Fragment>
      ))}
    </Tag>
  )
}
