import { anim } from './anim'
import { Artboard } from './Artboard'
import { linePath } from './geometry'
import { palette, STROKE } from './palette'
import type { GraphicProps } from './types'
import { useGraphicIds } from './use-graphic-ids'
import { CONVERSION_STAGES_SIZE } from './sizes'

const STAGES = ['Visitors', 'Leads', 'Customers', 'Revenue'] as const
const Y = 100
const R = 24
const LAST_R = 28
const GAP = 10
const XS = STAGES.map((_, i) => 96 + i * 176)
const LAST = XS.length - 1

/** Signature device 3: the four stages, joined by a flow that brightens toward revenue, the one lit node. */
export function ConversionStages({ tone, idPrefix, label, className }: GraphicProps) {
  const c = palette(tone)
  const { id, url } = useGraphicIds(idPrefix)
  const radius = (i: number) => (i === LAST ? LAST_R : R)

  return (
    <Artboard {...CONVERSION_STAGES_SIZE} label={label} className={className}>
      <defs>
        <linearGradient id={id('flow')} x1={XS[0]} x2={XS[LAST]} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.from} stopOpacity="0.15" />
          <stop offset="0.55" stopColor={c.from} stopOpacity="0.7" />
          <stop offset="1" stopColor={c.to} />
        </linearGradient>
        <linearGradient id={id('fill')} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={c.from} />
          <stop offset="1" stopColor={c.to} />
        </linearGradient>
        <radialGradient id={id('glow')}>
          <stop offset="0" stopColor={c.focal} stopOpacity={c.alpha.glow} />
          <stop offset="1" stopColor={c.focal} stopOpacity="0" />
        </radialGradient>
      </defs>

      <g {...anim('draw')} stroke={url('flow')} strokeWidth={STROKE.line} strokeLinecap="round" strokeLinejoin="round">
        {XS.slice(0, -1).map((x, i) => {
          const a = x + radius(i) + GAP
          const b = XS[i + 1] - radius(i + 1) - GAP
          const mid = (a + b) / 2
          return (
            <g key={x}>
              <path d={linePath([[a, Y], [b, Y]])} />
              <path d={linePath([[mid - 3, Y - 5], [mid + 2, Y], [mid - 3, Y + 5]])} />
            </g>
          )
        })}
      </g>

      {STAGES.map((stage, i) => {
        const x = XS[i]
        const last = i === LAST
        return (
          <g key={stage} {...anim(last ? 'focal' : 'node')}>
            {last ? (
              <>
                <circle cx={x} cy={Y} r="64" fill={url('glow')} />
                <circle cx={x} cy={Y} r={LAST_R + 10} stroke={c.focal} strokeOpacity={c.alpha.structure} strokeWidth={STROKE.hairline} />
                <circle cx={x} cy={Y} r={LAST_R} fill={url('fill')} />
              </>
            ) : (
              <circle cx={x} cy={Y} r={R} fill={c.line} fillOpacity={c.alpha.hairline * 0.6} stroke={c.line} strokeOpacity={c.alpha.structure + 0.1 * i} strokeWidth={STROKE.line} />
            )}
            <text x={x} y={Y} textAnchor="middle" dominantBaseline="central" fontFamily="Lato" fontWeight="700" fontSize="16" letterSpacing="0.5" fill={last ? c.onFocal : c.line} fillOpacity={last ? 1 : 0.8}>
              {String(i + 1).padStart(2, '0')}
            </text>
            <text x={x} y={Y + 64} textAnchor="middle" fontFamily="Geist" fontWeight={last ? 600 : 500} fontSize="17" fill={last ? c.line : c.text}>
              {stage}
            </text>
          </g>
        )
      })}
    </Artboard>
  )
}
