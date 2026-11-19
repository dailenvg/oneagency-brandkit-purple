import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'
import { highlightWipe } from '../../lib/motion'
import { trigger, type MotionTriggerProps } from '../motion/trigger'

interface HighlightTextProps extends MotionTriggerProps {
  children: ReactNode
  className?: string
  /**
   * Set when a parent variants tree (WordRise) drives the wipe: no trigger of its own, and the words inside keep the
   * parent's word stagger (seconds between words).
   */
  orchestratedStep?: number
}

const band = (step = 0, delay = 0): Variants => ({
  hidden: { '--hl-reveal': '0%' },
  show: { '--hl-reveal': '100%', transition: { ...highlightWipe, delay, staggerChildren: step } },
})

/**
 * Highlight band: a solid --ui-highlight band behind the lower part of the words (the .highlight-band recipe), wiped in
 * left to right. It starts about 0.15em before the first highlighted word and runs about 0.15em past the last; a
 * fragment that starts a line begins flush with its first word. For some titles only: one phrase per title, at most
 * two lines, never body text. Reduced motion: the band is there from the first frame.
 */
export function HighlightText({ children, className, inView = true, delay = 0, orchestratedStep }: HighlightTextProps) {
  const reduced = useReducedMotion()
  const cls = `highlight-band ${className ?? ''}`
  if (reduced) return <span className={cls}>{children}</span>
  if (orchestratedStep !== undefined) {
    return (
      <motion.span className={cls} variants={band(orchestratedStep)}>
        {children}
      </motion.span>
    )
  }
  return (
    <motion.span className={cls} variants={band(0, delay)} {...trigger(inView)}>
      {children}
    </motion.span>
  )
}
