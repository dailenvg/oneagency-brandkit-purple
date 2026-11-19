import { motion } from 'motion/react'
import { viewport } from '../../lib/motion'

/** Props every kit motion component shares. */
export interface MotionTriggerProps {
  /** Play when scrolled into view (once). Set false to play on mount, e.g. above the fold. Default true. */
  inView?: boolean
  /** Seconds before the move starts. */
  delay?: number
}

/**
 * Start/target props for a variants tree with `hidden` and `show` states. With `still` (reduced motion) the tree
 * renders in its `show` state from the first frame: no fade, no wait for the viewport.
 */
export function trigger(inView = true, still = false) {
  if (still) return { initial: false, animate: 'show' } as const
  return inView
    ? ({ initial: 'hidden', whileInView: 'show', viewport } as const)
    : ({ initial: 'hidden', animate: 'show' } as const)
}

/** Text elements the type moves can render as. */
export const textTags = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
} as const

export type TextTag = keyof typeof textTags
