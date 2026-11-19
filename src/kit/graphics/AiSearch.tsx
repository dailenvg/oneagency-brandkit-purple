import { anim } from './anim'
import { Artboard } from './Artboard'
import { linePath } from './geometry'
import { GlassDefs } from './GlassDefs'
import { GlassPanel } from './GlassPanel'
import { palette, STROKE } from './palette'
import { TextBar } from './TextBar'
import type { GraphicProps } from './types'
import { useGraphicIds } from './use-graphic-ids'
import { ILLUSTRATION_SIZE } from './sizes'

const BAR = { x: 88, y: 56, width: 464, height: 64, r: 32 }
const ANSWER = { x: 88, y: 144, width: 464, height: 284, r: 24 }
const CARD = { y: 262, width: 128, height: 132, r: 16, gap: 16 }
/** The cited source that is yours: lifted and lit. */
const YOURS = 0

/** A four-point spark, the usual shorthand for an AI answer. */
const spark = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r}Q${cx + r * 0.18} ${cy - r * 0.18} ${cx + r} ${cy}Q${cx + r * 0.18} ${cy + r * 0.18} ${cx} ${cy + r}Q${cx - r * 0.18} ${cy + r * 0.18} ${cx - r} ${cy}Q${cx - r * 0.18} ${cy - r * 0.18} ${cx} ${cy - r}Z`

/** Spot illustration: a search bar, an AI answer, and the three sources it cites, yours first. */
export function AiSearch({ tone, idPrefix, label, className }: GraphicProps) {
  const c = palette(tone)
  const { id, url } = useGraphicIds(idPrefix)
  const cardX = (i: number) => ANSWER.x + 32 + i * (CARD.width + CARD.gap)

  return (
    <Artboard {...ILLUSTRATION_SIZE} label={label} className={className}>
      <defs>
        <GlassDefs c={c} id={id} />
      </defs>

      <g {...anim('structure')}>
        <GlassPanel c={c} url={url} {...BAR}>
          <circle cx={BAR.x + 34} cy={BAR.y + 30} r="9" stroke={c.line} strokeOpacity="0.7" strokeWidth={STROKE.focal} />
          <path d={linePath([[BAR.x + 41, BAR.y + 37], [BAR.x + 47, BAR.y + 43]])} stroke={c.line} strokeOpacity="0.7" strokeWidth={STROKE.focal} strokeLinecap="round" />
          <TextBar c={c} x={BAR.x + 64} y={BAR.y + 32} width={196} strong />
          <path d={spark(BAR.x + BAR.width - 36, BAR.y + 32, 11)} fill={c.line} fillOpacity="0.7" />
        </GlassPanel>
        <GlassPanel c={c} url={url} {...ANSWER}>
          <path d={spark(ANSWER.x + 40, ANSWER.y + 38, 8)} fill={c.line} fillOpacity={c.alpha.secondary} />
          <TextBar c={c} x={ANSWER.x + 60} y={ANSWER.y + 38} width={220} strong />
          <TextBar c={c} x={ANSWER.x + 32} y={ANSWER.y + 66} width={380} />
          <TextBar c={c} x={ANSWER.x + 32} y={ANSWER.y + 84} width={340} />
          <TextBar c={c} x={ANSWER.x + 32} y={ANSWER.y + 102} width={260} />
        </GlassPanel>
      </g>

      {[0, 1, 2].map((i) => {
        const yours = i === YOURS
        const x = cardX(i)
        const y = CARD.y - (yours ? 14 : 0)
        return (
          <g key={i} {...anim(yours ? 'focal' : 'node')}>
            {yours && <ellipse cx={x + CARD.width / 2} cy={y + CARD.height / 2 + 12} rx="120" ry="100" fill={url('glow')} />}
            <GlassPanel c={c} url={url} x={x} y={y} width={CARD.width} height={CARD.height} r={CARD.r} rim={yours ? url('accent') : undefined} rimWidth={yours ? STROKE.line : 1} shadow={yours}>
              <circle cx={x + 26} cy={y + 28} r="12" fill={yours ? url('accent') : c.line} fillOpacity={yours ? 1 : c.alpha.hairline * 1.5} stroke={yours ? 'none' : c.line} strokeOpacity={c.alpha.structure} />
              <text x={x + 26} y={y + 28.5} textAnchor="middle" dominantBaseline="central" fontFamily="Lato" fontWeight="700" fontSize="12" fill={yours ? c.onFocal : c.line} fillOpacity={yours ? 1 : 0.7}>
                {i + 1}
              </text>
              <TextBar c={c} x={x + 16} y={y + 62} width={84} strong={yours} />
              <TextBar c={c} x={x + 16} y={y + 80} width={96} />
              <TextBar c={c} x={x + 16} y={y + 98} width={64} />
            </GlassPanel>
          </g>
        )
      })}
    </Artboard>
  )
}
