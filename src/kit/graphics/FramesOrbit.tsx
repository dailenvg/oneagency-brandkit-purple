import { anim } from './anim'
import { Artboard } from './Artboard'
import { palette } from './palette'
import { FRAMES_ORBIT_SIZE } from './sizes'
import type { GraphicProps } from './types'
import { useGraphicIds } from './use-graphic-ids'

/** Drawn in Nova's own 800x500 units, then scaled to the artboard. */
const W = 800
const H = 500
const SCALE = FRAMES_ORBIT_SIZE.width / W
/** Three tall capsule frames, the middle one raised, like portrait frames. */
const FRAMES = { w: 150, h: 330, gap: 34, lift: 36 }
/** Orbit lines: three parallel ellipses per ribbon, with a lit stretch (`comet`, a share of the way round) on each. */
const ORBIT = { rx: 372, ry: 104, spacing: 9, lines: 3, comet: 0.22 }
/** Ribbon tilts, degrees. */
const RIBBONS = [-14, 10] as const

/** An ellipse's perimeter (Ramanujan), so a lit stretch is a fixed share of the way round. */
const perimeter = (a: number, b: number) => Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)))

/** An ellipse as a path (two arcs from its left end), so the hub can draw it in with pathLength. */
const ellipsePath = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`

/**
 * Pattern: Frames in orbit, the graphic language of concept 01 "Nova". Three tall capsule frames (accent, signature
 * gradient, neutral) on the ground, circled by thin Mint-to-Violet orbit lines, each with one lit stretch. Frames are
 * made to hold a face; the file ships them empty. Nova loops the orbit lights; the kit plays the entrance once and holds.
 */
export function FramesOrbit({ tone, idPrefix, label, className }: GraphicProps) {
  const c = palette(tone)
  const { id, url } = useGraphicIds(idPrefix)
  const fills = [c.frames[0], url('frame'), c.frames[1]]
  const left = (W - FRAMES.w * 3 - FRAMES.gap * 2) / 2

  return (
    <Artboard {...FRAMES_ORBIT_SIZE} label={label} className={className}>
      <defs>
        <linearGradient id={id('frame')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.signature[0]} />
          <stop offset="1" stopColor={c.signature[1]} />
        </linearGradient>
        <linearGradient id={id('orbit')} x1="0" x2="1">
          <stop offset="0" stopColor={c.signature[0]} />
          <stop offset="1" stopColor={c.signature[1]} />
        </linearGradient>
      </defs>
      <rect width={FRAMES_ORBIT_SIZE.width} height={FRAMES_ORBIT_SIZE.height} fill={c.ground} />
      <g transform={`scale(${SCALE})`}>
        {fills.map((fill, i) => (
          <rect
            key={i}
            {...anim('node')}
            x={left + i * (FRAMES.w + FRAMES.gap)}
            y={(H - FRAMES.h) / 2 + (i === 1 ? -FRAMES.lift / 2 : FRAMES.lift / 2)}
            width={FRAMES.w}
            height={FRAMES.h}
            rx={FRAMES.w / 2}
            fill={fill}
          />
        ))}
        {RIBBONS.map((tilt, r) => (
          <g key={tilt} transform={`rotate(${tilt} ${W / 2} ${H / 2})`} fill="none" stroke={url('orbit')} strokeWidth={2}>
            {Array.from({ length: ORBIT.lines }, (_, k) => {
              const rx = ORBIT.rx + k * ORBIT.spacing - r * 40
              const ry = ORBIT.ry + k * ORBIT.spacing + r * 30
              const around = perimeter(rx, ry)
              const comet = around * ORBIT.comet
              const d = ellipsePath(W / 2, H / 2, rx, ry)
              return (
                <g key={k}>
                  <path {...anim('draw')} d={d} strokeOpacity={0.35} />
                  <path {...anim('area')} d={d} strokeDasharray={`${comet} ${around - comet}`} strokeDashoffset={r ? around * 0.45 : around * 0.1} strokeLinecap="round" />
                </g>
              )
            })}
          </g>
        ))}
      </g>
    </Artboard>
  )
}
