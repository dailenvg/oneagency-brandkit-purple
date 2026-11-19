import { anim } from './anim'
import { Artboard } from './Artboard'
import { arcPath, linePath, polar, steps } from './geometry'
import { palette, STROKE } from './palette'
import type { GraphicProps } from './types'
import { useGraphicIds } from './use-graphic-ids'
import { ORBIT_SIZE } from './sizes'

const C = 240
const RINGS = [64, 120, 176] as const
/** Quiet nodes: [ring index, angle in degrees clockwise from 3 o'clock]. */
const NODES = [
  [0, 200],
  [0, 35],
  [1, 145],
  [1, 255],
  [1, 340],
  [2, 105],
  [2, 190],
] as const
const HIGHLIGHT = -45
/** The signal's trail along the outer ring, ending on the highlighted node. */
const TRAIL_FROM = -150

/** Signature device 4: signals in orbit around a query, one of them found (AI search, visibility). */
export function OrbitRings({ tone, idPrefix, label, className }: GraphicProps) {
  const c = palette(tone)
  const { id, url } = useGraphicIds(idPrefix)
  const outer = RINGS[2]
  const [hx, hy] = polar(C, C, outer, HIGHLIGHT)
  const [tx, ty] = polar(C, C, outer, TRAIL_FROM)

  return (
    <Artboard {...ORBIT_SIZE} label={label} className={className}>
      <defs>
        <linearGradient id={id('trail')} x1={tx} y1={ty} x2={hx} y2={hy} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.from} stopOpacity="0" />
          <stop offset="0.5" stopColor={c.from} stopOpacity="0.8" />
          <stop offset="1" stopColor={c.to} />
        </linearGradient>
        <radialGradient id={id('glow')}>
          <stop offset="0" stopColor={c.focal} stopOpacity={c.alpha.glow} />
          <stop offset="1" stopColor={c.focal} stopOpacity="0" />
        </radialGradient>
      </defs>

      <g {...anim('structure')} stroke={c.line} strokeWidth={STROKE.hairline}>
        {RINGS.map((r, i) => (
          <circle key={r} cx={C} cy={C} r={r} strokeOpacity={c.alpha.structure - i * 0.04} strokeWidth={i === 2 ? STROKE.line : STROKE.hairline} />
        ))}
        {steps(0, 350, 36).map((deg) => (
          <path key={deg} d={linePath([polar(C, C, outer + 8, deg), polar(C, C, outer + (deg % 90 ? 12 : 18), deg)])} strokeOpacity={deg % 90 ? c.alpha.grid + 0.04 : c.alpha.structure + 0.1} />
        ))}
        <circle cx={C} cy={C} r="20" fill={c.line} fillOpacity={c.alpha.hairline} strokeOpacity={c.alpha.structure} />
      </g>

      <circle {...anim('node')} cx={C} cy={C} r="3.5" fill={c.line} fillOpacity="0.85" />
      <path {...anim('node')} d={linePath([polar(C, C, 26, HIGHLIGHT), polar(C, C, outer - 20, HIGHLIGHT)])} stroke={c.focal} strokeOpacity={c.alpha.secondary} strokeWidth={STROKE.hairline} strokeDasharray="2 5" strokeLinecap="round" />
      {NODES.map(([ring, deg]) => {
        const [x, y] = polar(C, C, RINGS[ring], deg)
        return <circle key={`${ring}-${deg}`} {...anim('node')} cx={x} cy={y} r="3.5" fill={c.line} fillOpacity={c.alpha.secondary + 0.1} />
      })}

      <path {...anim('draw')} d={arcPath(C, C, outer, TRAIL_FROM, HIGHLIGHT)} stroke={url('trail')} strokeWidth={STROKE.focal} strokeLinecap="round" />
      <g {...anim('focal')}>
        <circle cx={hx} cy={hy} r="52" fill={url('glow')} />
        <circle cx={hx} cy={hy} r="13" stroke={c.focal} strokeOpacity={c.alpha.secondary} strokeWidth={STROKE.line} />
        <circle cx={hx} cy={hy} r="6" fill={c.focal} />
      </g>
    </Artboard>
  )
}
