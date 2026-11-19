import { anim } from './anim'
import { Artboard } from './Artboard'
import { smoothPath, type Point } from './geometry'
import { GlassDefs } from './GlassDefs'
import { GlassPanel } from './GlassPanel'
import { palette, STROKE, type GraphicPalette } from './palette'
import { TextBar } from './TextBar'
import type { GraphicProps } from './types'
import { useGraphicIds } from './use-graphic-ids'
import { ILLUSTRATION_SIZE } from './sizes'

const CARD = { width: 188, height: 248, r: 20 }
const TARGET = { cx: 500, cy: 160 }
/** Starts on the front card's CTA (where the click happens) and climbs out of the card into the target. */
const CLICK: Point = [256, 320]
const LINE: Point[] = [CLICK, [336, 332], [404, 288], [454, 220], [TARGET.cx, TARGET.cy]]

/** An ad: image area with a horizon and sun, two lines of copy and a CTA pill. */
function AdCard({ c, url, x, y }: { c: GraphicPalette; url: (name: string) => string; x: number; y: number }) {
  const img = { x: x + 14, y: y + 14, width: CARD.width - 28, height: 112 }
  return (
    <GlassPanel c={c} url={url} x={x} y={y} {...CARD}>
      <rect {...img} rx="12" fill={c.line} fillOpacity={c.alpha.hairline} />
      <circle cx={img.x + img.width - 40} cy={img.y + 38} r="14" fill={c.line} fillOpacity={c.alpha.grid} />
      <path d={`M${img.x} ${img.y + 92}Q${img.x + 50} ${img.y + 58} ${img.x + 88} ${img.y + 84}T${img.x + img.width} ${img.y + 76}V${img.y + img.height}H${img.x}Z`} fill={c.line} fillOpacity={c.alpha.hairline} />
      <TextBar c={c} x={x + 16} y={y + 152} width={124} strong />
      <TextBar c={c} x={x + 16} y={y + 170} width={92} />
      <rect x={x + 16} y={y + 196} width="76" height="28" rx="14" stroke={c.line} strokeOpacity={c.alpha.structure} />
    </GlassPanel>
  )
}

/** Spot illustration: two ad cards, the results line climbing from the click into the target. */
export function PaidMedia({ tone, idPrefix, label, className }: GraphicProps) {
  const c = palette(tone)
  const { id, url } = useGraphicIds(idPrefix)
  const { cx, cy } = TARGET

  return (
    <Artboard {...ILLUSTRATION_SIZE} label={label} className={className}>
      <defs>
        <GlassDefs c={c} id={id} />
        <linearGradient id={id('line')} x1={CLICK[0]} y1="0" x2={cx} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.from} />
          <stop offset="1" stopColor={c.to} />
        </linearGradient>
      </defs>

      <g {...anim('structure')}>
        <g transform="rotate(-7 160 250)">
          <AdCard c={c} url={url} x={64} y={124} />
        </g>
        <g transform="rotate(4 300 240)">
          <AdCard c={c} url={url} x={204} y={112} />
        </g>
      </g>

      <g {...anim('node')} stroke={c.line} strokeWidth={STROKE.hairline}>
        <circle cx={cx} cy={cy} r="64" strokeOpacity={c.alpha.grid} />
        <circle cx={cx} cy={cy} r="42" strokeOpacity={c.alpha.structure} />
        <circle cx={cx} cy={cy} r="22" strokeOpacity={c.alpha.secondary} strokeWidth={STROKE.line} />
      </g>

      <g {...anim('node')}>
        <circle cx={CLICK[0]} cy={CLICK[1]} r="9" stroke={c.from} strokeOpacity={c.alpha.secondary} strokeWidth={STROKE.hairline} />
        <circle cx={CLICK[0]} cy={CLICK[1]} r="3.5" fill={c.from} />
      </g>
      <path {...anim('draw')} d={smoothPath(LINE)} stroke={url('line')} strokeWidth={STROKE.focal * 1.25} strokeLinecap="round" />
      <g {...anim('focal')}>
        <circle cx={cx} cy={cy} r="56" fill={url('glow')} />
        <circle cx={cx} cy={cy} r="7" fill={c.focal} />
      </g>
    </Artboard>
  )
}
