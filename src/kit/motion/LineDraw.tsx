import { motion, useReducedMotion, type Variants } from 'motion/react'
import { useId, useMemo } from 'react'
import { backOut, distance, duration, easeOutCubic, fade, overshoot } from '../../lib/motion'
import { trigger, type MotionTriggerProps } from './trigger'

type Point = readonly [number, number]

interface LineDrawProps extends MotionTriggerProps {
  /** Polyline in viewBox units, left to right. The last point is the result the line ends on. */
  points: readonly Point[]
  width: number
  height: number
  strokeWidth?: number
  /** End-dot radius in viewBox units. */
  dotRadius?: number
  className?: string
  /** Accessible description of what the line shows. Omit for a decorative line. */
  label?: string
}

/** Line draw: a rose-to-lilac stroke draws across, lands on a dot, and the dot's ring pulses out once. */
export function LineDraw({ points, width, height, strokeWidth = 6, dotRadius = 10, className, label, inView = true, delay = 0 }: LineDrawProps) {
  const reduced = useReducedMotion()
  const id = useId()
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')
  const [ex, ey] = points[points.length - 1]
  const xs = points.map(([x]) => x)
  const v = useMemo(() => variants(delay), [delay])
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }
  const origin = { transformBox: 'fill-box', transformOrigin: 'center' } as const

  return (
    <motion.svg viewBox={`0 0 ${width} ${height}`} className={className} overflow="visible" {...a11y} {...trigger(inView)} variants={reduced ? fade : undefined}>
      <defs>
        <linearGradient id={`${id}-stroke`} gradientUnits="userSpaceOnUse" x1={Math.min(...xs)} x2={Math.max(...xs)} y1={0} y2={0}>
          <stop style={{ stopColor: 'var(--rose)' }} />
          <stop offset={1} style={{ stopColor: 'var(--lilac)' }} />
        </linearGradient>
      </defs>
      <motion.path
        d={d}
        fill="none"
        stroke={`url(#${id}-stroke)`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={reduced ? undefined : v.path}
      />
      <motion.circle cx={ex} cy={ey} r={dotRadius} style={{ ...origin, fill: 'var(--lilac)' }} variants={reduced ? undefined : v.dot} />
      {!reduced && (
        <motion.circle cx={ex} cy={ey} r={dotRadius} fill="none" strokeWidth={strokeWidth / 2} style={{ ...origin, stroke: 'var(--lilac)' }} variants={v.ring} />
      )}
    </motion.svg>
  )
}

/** The film's brand-scene timing, relative to the draw start: dot lands as the line arrives, then the ring pulses. */
function variants(delay: number): Record<'path' | 'dot' | 'ring', Variants> {
  const dotAt = delay + duration.draw - 0.15
  return {
    path: {
      hidden: { pathLength: 0, opacity: 0 },
      show: { pathLength: 1, opacity: 1, transition: { delay, duration: duration.draw, ease: easeOutCubic, opacity: { delay, duration: 0.01 } } },
    },
    dot: {
      hidden: { scale: 0, opacity: 0 },
      show: { scale: 1, opacity: 1, transition: { delay: dotAt, duration: duration.dot, ease: backOut(overshoot.dot), opacity: { delay: dotAt, duration: 0.01 } } },
    },
    ring: {
      hidden: { scale: 1, opacity: 0 },
      show: {
        scale: distance.ringScale,
        opacity: [0, 1, 0],
        transition: {
          delay: dotAt + 0.2,
          duration: duration.ring,
          ease: easeOutCubic,
          opacity: { delay: dotAt + 0.2, duration: duration.ring, ease: 'linear', times: [0, 0.01, 1] },
        },
      },
    },
  }
}
