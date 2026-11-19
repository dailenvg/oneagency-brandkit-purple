import { motion, type Variants } from 'motion/react'
import { useMemo, type CSSProperties } from 'react'
import { duration, ease } from '../../lib/motion'
import { trigger, type MotionTriggerProps } from '../motion/trigger'

interface HalftoneArcProps extends MotionTriggerProps {
  className?: string
  /** Size and place it (ads set px); merged under the dot fill. */
  style?: CSSProperties
  /** Rows of dots across the band. */
  rows?: number
  /** Arc sweep in degrees, centred on the top. */
  sweep?: number
  /** Finer dots: closer together and smaller along the arc (2 halves both). Default 1. */
  density?: number
}

const W = 400
const H = 220
const CX = W / 2
const CY = 230
const R_IN = 120
const R_OUT = 205
const MAX_DOT = 3.4
const SPACING = 9

/** Dots on concentric arcs; each shrinks toward the ends of the arc and the edges of the band. */
function dots(rows: number, sweep: number, density: number) {
  const out: { x: number; y: number; r: number }[] = []
  const start = (-90 - sweep / 2) * (Math.PI / 180)
  const span = sweep * (Math.PI / 180)
  for (let row = 0; row < rows; row++) {
    const across = rows > 1 ? row / (rows - 1) : 0.5
    const radius = R_IN + (R_OUT - R_IN) * across
    const band = Math.sin(Math.PI * (0.15 + 0.7 * across))
    const count = Math.max(2, Math.round((radius * span * density) / SPACING))
    for (let i = 0; i <= count; i++) {
      const along = i / count
      const r = (MAX_DOT / density) * band * Math.sin(Math.PI * along) ** 0.8
      if (r < 0.35 / density) continue
      const a = start + span * along
      out.push({ x: CX + radius * Math.cos(a), y: CY + radius * Math.sin(a), r })
    }
  }
  return out
}

const appear = (delay: number): Variants => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.page, ease: ease.outCubic, delay } },
})

/** Halftone arc: rose dots sweeping behind glass objects, as in the reference ads. Decorative; fades in once. */
export function HalftoneArc({ className, style, rows = 9, sweep = 150, density = 1, inView = true, delay = 0 }: HalftoneArcProps) {
  const points = useMemo(() => dots(rows, sweep, density), [rows, sweep, density])
  return (
    <motion.svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      className={`pointer-events-none ${className ?? ''}`}
      style={{ ...style, fill: 'var(--glass-dots)' }}
      variants={appear(delay)}
      {...trigger(inView)}
    >
      {points.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={p.r.toFixed(2)} />
      ))}
    </motion.svg>
  )
}
