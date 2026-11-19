import { anim } from './anim'
import { Artboard } from './Artboard'
import { smoothPath, steps, type Point } from './geometry'
import { palette, STROKE } from './palette'
import type { GraphicProps } from './types'
import { useGraphicIds } from './use-graphic-ids'
import { SIGNAL_RIBBON_SIZE } from './sizes'

const { width: W, height: H } = SIGNAL_RIBBON_SIZE
const FIBRES = 20
/** Where the band turns edge-on: the knot of light. */
const TWIST = 0.56
const HALF_WIDTH = 78
/** Exponent that puts the half turn at TWIST: TWIST ** P = 0.5. */
const P = Math.log(0.5) / Math.log(TWIST)

const clamp01 = (u: number) => Math.min(1, Math.max(0, u))
const ease = (u: number) => u * u * (3 - 2 * u)

/** Centre line: low on the left, rising to the right (the brand's direction), with one soft swell. */
const centre = (u: number) => H * 0.74 - H * 0.42 * ease(clamp01(u)) + 16 * Math.sin(Math.PI * 2 * u)

/** The band's turn along its length: face-on at the left, edge-on at the twist, face-on (the other side) at the right. */
const turn = (u: number) => Math.PI * clamp01(u) ** P

/**
 * One fibre across the band, s from -1 (one edge) to 1 (the other). Each fibre turns a touch early or late, so they
 * cross over a short stretch like a real twisted strip instead of meeting at one point; the far end is smaller, as if
 * further away.
 */
function fibre(s: number) {
  const points: Point[] = steps(-0.04, 1.04, 44).map((u) => {
    const a = turn(u + 0.035 * s)
    const width = HALF_WIDTH * (1 - 0.3 * clamp01(u))
    return [u * W, centre(u) + s * width * Math.cos(a) + s * 16 * Math.sin(a)]
  })
  return smoothPath(points)
}

const PATHS = steps(-1, 1, FIBRES).map((s, i) => ({ d: fibre(s), s, i }))

/** Edge offsets at u: where they meet is the knot the eye reads (a little after TWIST, as the strip also tilts). */
function edges(u: number) {
  const width = HALF_WIDTH * (1 - 0.3 * clamp01(u))
  return [-1, 1].map((s) => {
    const a = turn(u + 0.035 * s)
    return centre(u) + s * width * Math.cos(a) + s * 16 * Math.sin(a)
  })
}

const KNOT: Point = (() => {
  const [u] = steps(TWIST, 0.8, 120).reduce(
    (best, v) => {
      const [a, b] = edges(v)
      return Math.abs(b - a) < best[1] ? [v, Math.abs(b - a)] : best
    },
    [TWIST, Infinity],
  )
  const [a, b] = edges(u)
  return [u * W, (a + b) / 2]
})()

/** Signature device 2: a twisting band of fine lines that echoes the loop, with one knot of light where it turns. */
export function SignalRibbon({ tone, idPrefix, label, className }: GraphicProps) {
  const c = palette(tone)
  const { id, url } = useGraphicIds(idPrefix)

  return (
    <Artboard {...SIGNAL_RIBBON_SIZE} label={label} className={className}>
      <defs>
        <linearGradient id={id('stroke')} x1="0" x2={W} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0.1" stopColor={c.from} />
          <stop offset="0.9" stopColor={c.to} />
        </linearGradient>
        <linearGradient id={id('fade')} x1="0" x2={W} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.16" stopColor="#fff" />
          <stop offset="0.88" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={id('mask')}>
          <rect width={W} height={H} fill={url('fade')} />
        </mask>
        <radialGradient id={id('glow')}>
          <stop offset="0" stopColor={c.focal} stopOpacity={c.alpha.glow * 0.7} />
          <stop offset="1" stopColor={c.focal} stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse {...anim('focal')} cx={KNOT[0]} cy={KNOT[1]} rx="110" ry="56" fill={url('glow')} />
      <g mask={url('mask')} stroke={url('stroke')} strokeLinecap="round">
        {PATHS.map(({ d, s, i }) => {
          const edge = i === 0 || i === FIBRES - 1
          const t = (s + 1) / 2
          return (
            <path
              key={i}
              {...anim('draw')}
              d={d}
              strokeWidth={edge ? STROKE.line : STROKE.hairline * 0.75}
              strokeOpacity={edge ? 1 : 0.2 + 0.6 * t ** 1.3}
            />
          )
        })}
      </g>
    </Artboard>
  )
}
