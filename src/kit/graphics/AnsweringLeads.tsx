import { anim } from './anim'
import { Artboard } from './Artboard'
import { arcPath, linePath } from './geometry'
import { GlassDefs } from './GlassDefs'
import { GlassPanel } from './GlassPanel'
import { palette, STROKE } from './palette'
import { TextBar } from './TextBar'
import type { GraphicProps } from './types'
import { useGraphicIds } from './use-graphic-ids'
import { ILLUSTRATION_SIZE } from './sizes'

const PHONE = { x: 176, y: 52, width: 200, height: 376, r: 34 }
const TIMER = { cx: 392, cy: 330, r: 64 }
/** Five minutes of a sixty-minute dial would be a sliver; the ring shows the reply landing well inside the window. */
const RING_FROM = -90
const RING_TO = 195

/** Spot illustration: a phone mid-conversation and the five-minute reply. */
export function AnsweringLeads({ tone, idPrefix, label, className }: GraphicProps) {
  const c = palette(tone)
  const { id, url } = useGraphicIds(idPrefix)
  const { x, y, width } = PHONE
  const inner = x + 20

  return (
    <Artboard {...ILLUSTRATION_SIZE} label={label} className={className}>
      <defs>
        <GlassDefs c={c} id={id} />
        <linearGradient id={id('ring')} x1={TIMER.cx - TIMER.r} y1={TIMER.cy - TIMER.r} x2={TIMER.cx + TIMER.r} y2={TIMER.cy + TIMER.r} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.from} />
          <stop offset="1" stopColor={c.to} />
        </linearGradient>
      </defs>

      <g {...anim('structure')}>
        <GlassPanel c={c} url={url} {...PHONE}>
          <rect x={x + width / 2 - 26} y={y + 16} width="52" height="6" rx="3" fill={c.line} fillOpacity={c.alpha.structure} />
          <rect x={inner} y={y + PHONE.height - 52} width={width - 40} height="32" rx="16" stroke={c.line} strokeOpacity={c.alpha.grid} />
        </GlassPanel>
      </g>

      <g {...anim('node')}>
        <GlassPanel c={c} url={url} x={inner} y={y + 52} width={132} height={52} r={16} shadow={false}>
          <TextBar c={c} x={inner + 16} y={y + 70} width={92} />
          <TextBar c={c} x={inner + 16} y={y + 86} width={60} />
        </GlassPanel>
      </g>
      <g {...anim('node')}>
        <rect x={x + width - 20 - 120} y={y + 120} width="120" height="52" rx="16" fill={c.line} fillOpacity={c.alpha.grid} />
        <TextBar c={c} x={x + width - 124} y={y + 138} width={80} strong />
        <TextBar c={c} x={x + width - 124} y={y + 154} width={52} strong />
      </g>
      <g {...anim('node')}>
        <GlassPanel c={c} url={url} x={inner} y={y + 190} width={76} height={36} r={18} shadow={false}>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={inner + 22 + i * 16} cy={y + 208} r="3.5" fill={c.line} fillOpacity={0.55 - i * 0.15} />
          ))}
        </GlassPanel>
      </g>

      <g {...anim('focal')}>
        <ellipse cx={TIMER.cx} cy={TIMER.cy + 8} rx="120" ry="92" fill={url('glow')} />
        <GlassPanel c={c} url={url} x={TIMER.cx - TIMER.r} y={TIMER.cy - TIMER.r} width={TIMER.r * 2} height={TIMER.r * 2} r={TIMER.r} />
        <circle cx={TIMER.cx} cy={TIMER.cy} r="46" stroke={c.line} strokeOpacity={c.alpha.grid} strokeWidth={STROKE.focal} />
        <path d={arcPath(TIMER.cx, TIMER.cy, 46, RING_FROM, RING_TO)} stroke={url('ring')} strokeWidth={STROKE.focal * 1.5} strokeLinecap="round" />
        <text x={TIMER.cx} y={TIMER.cy + 1} textAnchor="middle" dominantBaseline="central" fontFamily="Lato" fontWeight="700" fontSize="26" letterSpacing="0.5" fill={c.line}>
          5:00
        </text>
      </g>

      <g {...anim('node')}>
        <GlassPanel c={c} url={url} x={432} y={112} width={56} height={56} r={28} />
        <path d={linePath([[448, 141], [457, 150], [473, 132]])} stroke={c.line} strokeOpacity="0.8" strokeWidth={STROKE.focal} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </Artboard>
  )
}
