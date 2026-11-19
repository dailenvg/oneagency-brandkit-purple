import { motion, useReducedMotion, type Variants } from 'motion/react'
import { useMemo, type ReactNode } from 'react'
import { backOut, distance, duration, easeOutCubic, fade, overshoot } from '../../lib/motion'
import { trigger, type MotionTriggerProps } from './trigger'

interface PopProps extends MotionTriggerProps {
  children: ReactNode
  /** Render as a span to sit inside headings and other phrasing content. Default div. */
  as?: 'div' | 'span'
  className?: string
  /** Starting scale. Default 0.6; the logo scale-in uses 0.8. */
  from?: number
  /** Starting blur in px. Default 0; the logo scale-in uses 10. */
  blur?: number
  /** Seconds. Default 0.5; the logo scale-in uses 1.1. */
  length?: number
  /** Back-out overshoot. Default 1.7. */
  bounce?: number
}

/** Pop: scales in with a back-out overshoot. With `from={0.8} blur={10}` it is the film's logo scale-in. */
export function Pop({
  children,
  as = 'div',
  className,
  inView = true,
  delay = 0,
  from = distance.popFrom,
  blur = 0,
  length = duration.move,
  bounce = overshoot.pop,
}: PopProps) {
  const reduced = useReducedMotion()
  const variants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, scale: from, ...(blur && { filter: `blur(${blur}px)` }) },
      show: {
        opacity: 1,
        scale: 1,
        ...(blur && { filter: 'blur(0px)' }),
        transition: {
          delay,
          duration: length,
          ease: backOut(bounce),
          opacity: { delay, duration: length / 3, ease: 'linear' },
          filter: { delay, duration: length, ease: easeOutCubic },
        },
      },
    }),
    [from, blur, length, bounce, delay],
  )

  const Tag = as === 'span' ? motion.span : motion.div

  return (
    <Tag className={className} variants={reduced ? fade : variants} {...trigger(inView)}>
      {children}
    </Tag>
  )
}
