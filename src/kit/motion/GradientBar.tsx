import { motion, useReducedMotion, type Variants } from 'motion/react'
import { useMemo } from 'react'
import { duration, easeOutCubic, fade } from '../../lib/motion'
import { trigger, type MotionTriggerProps } from './trigger'

interface GradientBarProps extends MotionTriggerProps {
  /** Width and height (e.g. "h-2 w-40"). */
  className?: string
}

/** Gradient bar: the site's --bar rule grows in from the left, as under the logo in the film. Decorative; a block span so it can sit inside headings. */
export function GradientBar({ className, inView = true, delay = 0 }: GradientBarProps) {
  const reduced = useReducedMotion()
  const variants = useMemo<Variants>(
    () => ({
      hidden: { scaleX: 0 },
      show: { scaleX: 1, transition: { delay, duration: duration.bar, ease: easeOutCubic } },
    }),
    [delay],
  )

  return (
    <motion.span
      aria-hidden
      className={`block origin-left rounded-full ${className ?? ''}`}
      style={{ background: 'var(--bar)' }}
      variants={reduced ? fade : variants}
      {...trigger(inView)}
    />
  )
}
