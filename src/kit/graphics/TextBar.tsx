import type { GraphicPalette } from './palette'

interface TextBarProps {
  c: GraphicPalette
  x: number
  y: number
  width: number
  /** Stronger for a heading line. */
  strong?: boolean
}

/** A line of placeholder copy: illustrations carry no real text. */
export function TextBar({ c, x, y, width, strong }: TextBarProps) {
  return <rect x={x} y={y - 3} width={width} height="6" rx="3" fill={c.line} fillOpacity={strong ? 0.42 : 0.18} />
}
