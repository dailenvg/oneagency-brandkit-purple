import { anim } from './anim'
import { Artboard } from './Artboard'
import { linePath, polar, smoothPath, type Point } from './geometry'
import { GlassDefs } from './GlassDefs'
import { GlassPanel } from './GlassPanel'
import { palette, STROKE, type GraphicPalette } from './palette'
import { TextBar } from './TextBar'
import type { GraphicProps } from './types'
import { useGraphicIds } from './use-graphic-ids'
import { ILLUSTRATION_SIZE } from './sizes'

const BOARD = { x: 64, y: 72, width: 372, height: 256, r: 22 }
const LIST = { x: 372, y: 232, width: 204, height: 176, r: 18 }
const LENS = { cx: 284, cy: 194, r: 66 }
const BARS = [52, 78, 64, 102, 90, 124]
const TREND: Point[] = [
  [96, 286],
  [150, 270],
  [204, 276],
  [258, 240],
  [312, 226],
  [404, 176],
]

const ZOOM = 1.5

/** The dashboard's bars and trend line; drawn again, enlarged, inside the lens. */
function Chart({ c }: { c: GraphicPalette }) {
  return (
    <>
      {BARS.map((h, i) => (
        <rect key={h} x={BOARD.x + 32 + i * 50} y={BOARD.y + BOARD.height - 24 - h} width="28" height={h} rx="5" fill={c.line} fillOpacity={c.alpha.hairline + 0.02 * i} />
      ))}
      <path d={smoothPath(TREND)} stroke={c.line} strokeOpacity={c.alpha.secondary} strokeWidth={STROKE.line} strokeLinecap="round" />
    </>
  )
}

/** Spot illustration: a magnifier over a site dashboard, with the audit checklist beside it. */
export function FreeAudit({ tone, idPrefix, label, className }: GraphicProps) {
  const c = palette(tone)
  const { id, url } = useGraphicIds(idPrefix)
  const [hx, hy] = polar(LENS.cx, LENS.cy, LENS.r + 4, 45)
  const [ex, ey] = polar(LENS.cx, LENS.cy, LENS.r + 74, 45)

  return (
    <Artboard {...ILLUSTRATION_SIZE} label={label} className={className}>
      <defs>
        <GlassDefs c={c} id={id} />
        <clipPath id={id('lens')}>
          <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r - 4} />
        </clipPath>
        <linearGradient id={id('lens-rim')} x1={LENS.cx - LENS.r} y1={LENS.cy - LENS.r} x2={LENS.cx + LENS.r} y2={LENS.cy + LENS.r} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.from} />
          <stop offset="1" stopColor={c.to} />
        </linearGradient>
      </defs>

      <g {...anim('structure')}>
        <GlassPanel c={c} url={url} {...BOARD}>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={BOARD.x + 24 + i * 14} cy={BOARD.y + 24} r="4" fill={c.line} fillOpacity={c.alpha.structure} />
          ))}
          <TextBar c={c} x={BOARD.x + 24} y={BOARD.y + 56} width={96} strong />
          <TextBar c={c} x={BOARD.x + 24} y={BOARD.y + 74} width={60} />
          <Chart c={c} />
        </GlassPanel>
      </g>

      <g {...anim('node')}>
        <GlassPanel c={c} url={url} {...LIST}>
          {[0, 1, 2].map((i) => {
            const cy = LIST.y + 40 + i * 48
            const done = i < 2
            return (
              <g key={i}>
                <circle cx={LIST.x + 32} cy={cy} r="11" stroke={c.line} strokeOpacity={done ? 0.7 : c.alpha.structure} strokeWidth={STROKE.line} />
                {done && <path d={linePath([[LIST.x + 27, cy], [LIST.x + 31, cy + 4], [LIST.x + 38, cy - 4]])} stroke={c.line} strokeOpacity="0.85" strokeWidth={STROKE.line} strokeLinecap="round" strokeLinejoin="round" />}
                <TextBar c={c} x={LIST.x + 56} y={cy - 6} width={done ? 108 : 84} strong={done} />
                <TextBar c={c} x={LIST.x + 56} y={cy + 8} width={done ? 72 : 56} />
              </g>
            )
          })}
        </GlassPanel>
      </g>

      <g {...anim('focal')}>
        <ellipse cx={LENS.cx + 8} cy={LENS.cy + 12} rx="120" ry="100" fill={url('glow')} />
        <path d={linePath([[hx, hy], [ex, ey]])} stroke={c.shadow} strokeOpacity={c.shadowAlpha * 0.6} strokeWidth="18" strokeLinecap="round" filter={url('soft')} />
        <path d={linePath([[hx, hy], [ex, ey]])} stroke={c.line} strokeOpacity={c.alpha.structure} strokeWidth="16" strokeLinecap="round" />
        <path d={linePath([[hx, hy], [ex, ey]])} stroke={url('glass')} strokeWidth="14" strokeLinecap="round" />
        <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} fill={url('glass')} />
        <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} fill={c.tint} fillOpacity={c.tintAlpha} />
        <g clipPath={url('lens')}>
          <g transform={`translate(${LENS.cx} ${LENS.cy}) scale(${ZOOM}) translate(${-LENS.cx} ${-LENS.cy})`}>
            <Chart c={c} />
          </g>
        </g>
        <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} stroke={url('lens-rim')} strokeWidth={STROKE.focal * 2} />
        <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r - 7} stroke={c.paper} strokeOpacity={c.specular * 0.5} strokeWidth={STROKE.hairline} />
      </g>
    </Artboard>
  )
}
