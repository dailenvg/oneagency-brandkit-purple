import { motion, useReducedMotion, type Variants } from 'motion/react'
import { useMemo } from 'react'
import { distance, duration, easeOutCubic } from '../../lib/motion'
import { trigger, type MotionTriggerProps } from './trigger'

interface HaloProps extends MotionTriggerProps {
  /** Size and position (e.g. "absolute inset-x-0 top-0 mx-auto size-[min(90vw,900px)]"). */
  className?: string
}

const GLOW = 'radial-gradient(closest-side, color-mix(in srgb, var(--lilac) 45%, transparent), color-mix(in srgb, var(--lilac) 16%, transparent) 55%, transparent)'

/** Halo: a soft lilac glow behind the logo that swells once and holds. Decorative. Reduced motion: shown at rest. */
export function Halo({ className, inView = true, delay = 0 }: HaloProps) {
  const reduced = useReducedMotion()
  const variants = useMemo<Variants>(() => {
    const [o0, o1] = distance.haloOpacity
    const [s0, s1] = distance.haloScale
    if (reduced) return { hidden: { opacity: o1, scale: 1 }, show: { opacity: o1, scale: 1 } }
    return {
      hidden: { opacity: 0, scale: s0 },
      show: {
        opacity: [0, o0, o1],
        scale: s1,
        transition: {
          scale: { delay, duration: duration.haloScale, ease: easeOutCubic },
          opacity: { delay, duration: duration.haloFade, ease: easeOutCubic, times: [0, 0.15, 1] },
        },
      },
    }
  }, [reduced, delay])

  return <motion.div aria-hidden className={`pointer-events-none rounded-full ${className ?? ''}`} style={{ background: GLOW }} variants={variants} {...trigger(inView)} />
}
