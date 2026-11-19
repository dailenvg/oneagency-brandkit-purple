import type { ReactNode } from 'react'
import type { GraphicPalette } from './palette'

interface GlassPanelProps {
  c: GraphicPalette
  url: (name: string) => string
  x: number
  y: number
  width: number
  height: number
  r: number
  /** Override the rim (the focal panel takes the gradient). */
  rim?: string
  rimWidth?: number
  shadow?: boolean
  children?: ReactNode
}

/** A frosted panel: drop shadow, tinted translucent body, rim light, and a specular line round the top-left corner. */
export function GlassPanel({ c, url, x, y, width, height, r, rim, rimWidth = 1, shadow = true, children }: GlassPanelProps) {
  return (
    <g>
      {shadow && <rect x={x + 6} y={y + 18} width={width - 12} height={height - 6} rx={r} fill={c.shadow} fillOpacity={c.shadowAlpha} filter={url('soft')} />}
      <rect x={x} y={y} width={width} height={height} rx={r} fill={c.tint} fillOpacity={c.tintAlpha} />
      <rect x={x} y={y} width={width} height={height} rx={r} fill={url('glass')} />
      <rect x={x + 0.5} y={y + 0.5} width={width - 1} height={height - 1} rx={r - 0.5} stroke={rim ?? url('rim')} strokeWidth={rimWidth} />
      <path d={`M${x + 1.5} ${y + r}A${r - 1.5} ${r - 1.5} 0 0 1 ${x + r} ${y + 1.5}H${x + Math.max(r, width * 0.55)}`} stroke={url('spec')} strokeLinecap="round" />
      {children}
    </g>
  )
}
