import { motion, useReducedMotion, type Variants } from 'motion/react'
import { useId, useMemo } from 'react'
import { duration, ease, viewport } from '../../lib/motion'

interface ParticleStreamProps {
  className?: string
  /** Number of strands. */
  strands?: number
}

const W = 600
const H = 200
/** One wave length, px in the viewBox. The strands repeat every WAVE, so drifting by WAVE loops seamlessly. */
const WAVE = 300

/** One wave length of drift, left to right, decelerating into the hold. */
const DRIFT: Variants = {
  rest: { x: 0 },
  drift: { x: WAVE, transition: { duration: duration.drift, ease: ease.outCubic } },
}

/** A sine strand from x = -WAVE to W + WAVE (one wave of margin each side for the drift). */
function strandPath(i: number, count: number) {
  const t = count > 1 ? i / (count - 1) : 0.5
  const amp = 18 + 34 * Math.sin(Math.PI * t)
  const mid = H / 2 + (t - 0.5) * 70
  const phase = t * Math.PI * 0.9
  const step = 12
  const points: string[] = []
  for (let x = -WAVE; x <= W + WAVE; x += step) {
    const y = mid + amp * Math.sin((2 * Math.PI * x) / WAVE + phase)
    points.push(`${x},${y.toFixed(1)}`)
  }
  return `M${points.join('L')}`
}

/**
 * Particle stream: fine dots and lines flowing in a wave, white to rose (lilac to rose on light). Drifts one wave left
 * to right the first time it comes into view, then holds (the strands repeat every wave, so the end frame matches the
 * start). Reduced motion: still from the start. Decorative.
 */
export function ParticleStream({ className, strands = 9 }: ParticleStreamProps) {
  const gradientId = useId()
  const maskId = useId()
  const reduced = useReducedMotion()
  const paths = useMemo(() => Array.from({ length: strands }, (_, i) => strandPath(i, strands)), [strands])
  const play = reduced ? {} : { initial: 'rest', whileInView: 'drift', viewport }

  return (
    <motion.svg aria-hidden viewBox={`0 0 ${W} ${H}`} className={`pointer-events-none ${className ?? ''}`} preserveAspectRatio="xMidYMid slice" {...play}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2={W} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--glass-stream-from)" />
          <stop offset="1" stopColor="var(--glass-stream-to)" />
        </linearGradient>
        <linearGradient id={`${maskId}-fade`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.25" stopColor="#fff" />
          <stop offset="0.8" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={maskId}>
          <rect width={W} height={H} fill={`url(#${maskId}-fade)`} />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`} stroke={`url(#${gradientId})`} fill="none" strokeLinecap="round">
        <motion.g variants={reduced ? undefined : DRIFT}>
          {paths.map((d, i) => {
            const line = i % 4 === 3
            return (
              <path
                key={i}
                d={d}
                strokeWidth={line ? 0.6 : 1.4 + (i % 3) * 0.6}
                strokeDasharray={line ? undefined : `0 ${7 + (i % 3) * 3}`}
                opacity={0.35 + 0.55 * Math.sin((Math.PI * (i + 1)) / (strands + 1))}
              />
            )
          })}
        </motion.g>
      </g>
    </motion.svg>
  )
}
