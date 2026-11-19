import { anim } from './anim'
import { Artboard } from './Artboard'
import { linePath, smoothPath, steps, type Point } from './geometry'
import { palette, STROKE } from './palette'
import type { GraphicProps } from './types'
import { useGraphicIds } from './use-graphic-ids'
import { CONVERSION_CURVE_SIZE } from './sizes'

const LEFT = 56
const RIGHT = 584
const TOP = 64
const BASE = 344
const ROWS = steps(TOP, BASE, 5)
const COLS = steps(LEFT, RIGHT, 7)
const END: Point = [COLS[5], 96]
const START: Point = [LEFT, 318]

/** Mostly exponential with a short plateau a third of the way in, so it reads as real growth rather than a formula. */
function growth(t: number) {
  const expo = (Math.exp(2.6 * t) - 1) / (Math.exp(2.6) - 1)
  return 0.84 * expo + 0.16 * t - 0.035 * Math.sin(Math.PI * 2 * t) * (1 - t)
}

const POINTS: Point[] = steps(0, 1, 9).map((t) => [START[0] + (END[0] - START[0]) * t, START[1] - (START[1] - END[1]) * growth(t)])
const CURVE = smoothPath(POINTS)
const AREA = `${CURVE}L${END[0]} ${BASE}L${START[0]} ${BASE}Z`

/** Signature device 1: a growth curve on a faint grid that lands on one result marker. */
export function ConversionCurve({ tone, idPrefix, label, className }: GraphicProps) {
  const c = palette(tone)
  const { id, url } = useGraphicIds(idPrefix)
  const [ex, ey] = END

  return (
    <Artboard {...CONVERSION_CURVE_SIZE} label={label} className={className}>
      <defs>
        <linearGradient id={id('stroke')} x1={START[0]} x2={ex} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.from} stopOpacity="0.2" />
          <stop offset="0.3" stopColor={c.from} />
          <stop offset="1" stopColor={c.to} />
        </linearGradient>
        <linearGradient id={id('area')} x1="0" x2="0" y1={ey} y2={BASE} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.focal} stopOpacity={c.alpha.glow * 0.4} />
          <stop offset="1" stopColor={c.focal} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('area-fade')} x1={START[0]} x2={ex} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id={id('area-mask')}>
          <rect x={START[0]} y={TOP} width={ex - START[0]} height={BASE - TOP} fill={url('area-fade')} />
        </mask>
        <linearGradient id={id('grid-fade')} x1="0" x2="0" y1={TOP} y2={BASE} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.6" stopColor="#fff" />
        </linearGradient>
        <mask id={id('grid-mask')}>
          <rect x="0" y={TOP} width={CONVERSION_CURVE_SIZE.width} height={BASE - TOP + 8} fill={url('grid-fade')} />
        </mask>
        <radialGradient id={id('glow')}>
          <stop offset="0" stopColor={c.focal} stopOpacity={c.alpha.glow} />
          <stop offset="1" stopColor={c.focal} stopOpacity="0" />
        </radialGradient>
      </defs>

      <g {...anim('structure')} stroke={c.line} strokeWidth={STROKE.hairline} mask={url('grid-mask')}>
        {ROWS.slice(1, -1).map((y) => (
          <path key={y} d={`M${LEFT} ${y}H${RIGHT}`} strokeOpacity={c.alpha.hairline} />
        ))}
        {COLS.map((x) => (
          <path key={x} d={`M${x} ${TOP}V${BASE + 6}`} strokeOpacity={c.alpha.hairline} />
        ))}
      </g>
      <path {...anim('structure')} d={`M${LEFT} ${BASE}H${RIGHT}`} stroke={c.line} strokeOpacity={c.alpha.structure} strokeWidth={STROKE.hairline} />

      <path {...anim('area')} d={AREA} fill={url('area')} mask={url('area-mask')} />
      <path {...anim('draw')} d={CURVE} stroke={url('stroke')} strokeWidth={STROKE.focal} strokeLinecap="round" strokeLinejoin="round" />

      <path {...anim('node')} d={linePath([[ex, ey + 18], [ex, BASE]])} stroke={c.focal} strokeOpacity={c.alpha.secondary} strokeWidth={STROKE.hairline} strokeDasharray="2 5" strokeLinecap="round" />

      <g {...anim('focal')}>
        <circle cx={ex} cy={ey} r="48" fill={url('glow')} />
        <circle cx={ex} cy={ey} r="20" stroke={c.focal} strokeOpacity={c.alpha.structure} strokeWidth={STROKE.hairline} />
        <circle cx={ex} cy={ey} r="11" stroke={c.focal} strokeOpacity={c.alpha.secondary} strokeWidth={STROKE.line} />
        <circle cx={ex} cy={ey} r="5" fill={c.focal} />
      </g>
    </Artboard>
  )
}
