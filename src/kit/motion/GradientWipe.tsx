import { motion, useReducedMotion, type Variants } from 'motion/react'
import { useMemo, type ReactNode } from 'react'
import { duration, easeInOutCubic, fade } from '../../lib/motion'
import { trigger, type MotionTriggerProps } from './trigger'

interface GradientWipeProps extends MotionTriggerProps {
  children: ReactNode
  className?: string
}

/** The site's --bar stops (#F59FAE to #6D92DE), turned vertical for the sweep, as in the film. */
const SWEEP = 'linear-gradient(180deg, #F59FAE 0%, #6D92DE 100%)'
const SWEEP_GLOW = '0 0 60px 14px color-mix(in srgb, var(--rose) 45%, transparent)'

/**
 * Gradient wipe: a glowing gradient bar sweeps left to right and reveals the content behind it. Use it to bring in the
 * next line. Reduced motion: the content fades in.
 */
export function GradientWipe({ children, className, inView = true, delay = 0 }: GradientWipeProps) {
  const reduced = useReducedMotion()
  const v = useMemo(() => variants(delay), [delay])

  if (reduced) {
    return (
      <motion.div className={className} variants={fade} {...trigger(inView)}>
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div className={`relative ${className ?? ''}`} {...trigger(inView)}>
      <motion.div variants={v.reveal}>{children}</motion.div>
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" variants={v.track}>
        <div className="absolute inset-y-0 right-0 w-3.5" style={{ background: SWEEP, boxShadow: SWEEP_GLOW }} />
      </motion.div>
    </motion.div>
  )
}

/** The content's clip edge and the bar travel together on the same ease, so the bar always sits on the edge. */
function variants(delay: number): Record<'reveal' | 'track', Variants> {
  const sweep = { delay, duration: duration.wipe, ease: easeInOutCubic }
  return {
    reveal: {
      hidden: { clipPath: 'inset(0 100% 0 0)' },
      show: { clipPath: 'inset(0 0% 0 0)', transition: sweep },
    },
    track: {
      hidden: { x: '-100%', opacity: 0 },
      show: { x: '0%', opacity: [0, 1, 1, 0], transition: { ...sweep, opacity: { delay, duration: duration.wipe, times: [0, 0.02, 0.97, 1] } } },
    },
  }
}
