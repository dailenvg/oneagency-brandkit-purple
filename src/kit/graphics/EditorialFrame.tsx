import { anim } from './anim'
import { Artboard } from './Artboard'
import { linePath, steps, type Point } from './geometry'
import { palette, STROKE } from './palette'
import { EDITORIAL_FRAME_SIZE } from './sizes'
import type { GraphicProps } from './types'
import { useGraphicIds } from './use-graphic-ids'

const S = EDITORIAL_FRAME_SIZE.width
/** Corner marks sit on the outer margin; the index and baseline on the inner one (the copy area). */
const OUTER = 28
const INNER = 56
const ARM = 22
const RULE_Y = INNER
const BASE_Y = S - INNER
const INDEX = 1
const OF = 4

const corners: Point[][] = [
  [[OUTER, OUTER + ARM], [OUTER, OUTER], [OUTER + ARM, OUTER]],
  [[S - OUTER - ARM, OUTER], [S - OUTER, OUTER], [S - OUTER, OUTER + ARM]],
  [[S - OUTER, S - OUTER - ARM], [S - OUTER, S - OUTER], [S - OUTER - ARM, S - OUTER]],
  [[OUTER + ARM, S - OUTER], [OUTER, S - OUTER], [OUTER, S - OUTER - ARM]],
]

const num = (v: number) => String(v).padStart(2, '0')

/**
 * Signature device 5: corner marks, an index rule that shows where this ad sits in its series (01 of 04, lit up to
 * here), and a baseline ticked once per ad. Weights are set for a 1080 px ad seen on a phone: the 2x export is the ad.
 */
export function EditorialFrame({ tone, idPrefix, label, className }: GraphicProps) {
  const c = palette(tone)
  const { id, url } = useGraphicIds(idPrefix)
  const ruleFrom = INNER + 40
  const ruleTo = S - INNER - 40
  const progress = ruleFrom + ((ruleTo - ruleFrom) * INDEX) / OF

  return (
    <Artboard {...EDITORIAL_FRAME_SIZE} label={label} className={className}>
      <defs>
        <linearGradient id={id('progress')} x1={ruleFrom} x2={progress} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.from} />
          <stop offset="1" stopColor={c.to} />
        </linearGradient>
      </defs>

      <g {...anim('structure')} stroke={c.line} strokeWidth={STROKE.focal} strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8">
        {corners.map((points, i) => (
          <path key={i} d={linePath(points)} />
        ))}
      </g>

      <g {...anim('structure')} stroke={c.line} strokeWidth={STROKE.line}>
        <path d={linePath([[ruleFrom, RULE_Y], [ruleTo, RULE_Y]])} strokeOpacity={c.alpha.structure} />
        <path d={linePath([[INNER, BASE_Y], [S - INNER, BASE_Y]])} strokeOpacity={c.alpha.grid} />
        {steps(INNER, S - INNER, OF + 1).map((x) => (
          <path key={x} d={linePath([[x, BASE_Y], [x, BASE_Y + 8]])} strokeOpacity={c.alpha.secondary} />
        ))}
      </g>

      <g {...anim('node')} fontFamily="Lato" fontWeight="700" fontSize="17" letterSpacing="1.5">
        <text x={INNER} y={RULE_Y} dominantBaseline="central" fill={c.line}>
          {num(INDEX)}
        </text>
        <text x={S - INNER} y={RULE_Y} dominantBaseline="central" textAnchor="end" fill={c.line} fillOpacity={c.alpha.secondary}>
          {num(OF)}
        </text>
      </g>
      <path {...anim('focal')} d={linePath([[ruleFrom, RULE_Y], [progress, RULE_Y]])} stroke={url('progress')} strokeWidth={STROKE.focal * 1.5} strokeLinecap="round" />
    </Artboard>
  )
}
