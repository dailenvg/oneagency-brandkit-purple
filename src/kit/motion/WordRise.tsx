import { motion, useReducedMotion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import { fade, sequence, stagger, wordRise } from '../../lib/motion'
import { HighlightText } from '../type/HighlightText'
import { textTags, trigger, type MotionTriggerProps, type TextTag } from './trigger'

interface WordRiseProps extends MotionTriggerProps {
  text: string
  /** Word indices set as accent words (Metal, signature gradient). */
  accent?: number[]
  /** First and last word index (inclusive) set on the highlight band. One phrase per title. */
  highlight?: readonly [number, number]
  as?: TextTag
  className?: string
  /** Seconds between words. Default 0.07. */
  step?: number
  id?: string
  /** Focusable from script only (a view's h1 takes focus after navigation). */
  focusTarget?: boolean
}

/** Word rise: each word blurs and rises into place, left to right. Reduced motion: the line is there from the first frame. */
export function WordRise({ text, accent = [], highlight, as = 'p', className, inView = true, delay = 0, step = stagger.word, id, focusTarget }: WordRiseProps) {
  const reduced = useReducedMotion()
  const Tag = textTags[as]
  const words = text.trim().split(/\s+/)

  const word = (w: string, i: number) => (
    <motion.span key={i} aria-hidden className="inline-block" variants={reduced ? fade : wordRise}>
      {accent.includes(i) ? <span className="accent-word">{w}</span> : w}
    </motion.span>
  )
  /** Words with the spaces between them; the space after the last word of a run is left to the caller. */
  const run = (from: number, to: number): ReactNode[] =>
    words.slice(from, to + 1).map((w, k) => (
      <Fragment key={from + k}>
        {word(w, from + k)}
        {from + k < to && ' '}
      </Fragment>
    ))

  const [hlFrom, hlTo] = highlight ?? [-1, -1]
  const hasHighlight = highlight && hlFrom >= 0 && hlTo >= hlFrom && hlTo < words.length

  return (
    <Tag id={id} tabIndex={focusTarget ? -1 : undefined} className={className} variants={reduced ? sequence(0) : sequence(step, delay)} {...trigger(inView, !!reduced)}>
      <span className="sr-only">{text}</span>
      {hasHighlight ? (
        <>
          {hlFrom > 0 && <>{run(0, hlFrom - 1)} </>}
          <HighlightText orchestratedStep={step}>{run(hlFrom, hlTo)}</HighlightText>
          {hlTo < words.length - 1 && <> {run(hlTo + 1, words.length - 1)}</>}
        </>
      ) : (
        run(0, words.length - 1)
      )}
    </Tag>
  )
}
