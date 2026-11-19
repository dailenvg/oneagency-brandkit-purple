import { smoothPath, steps, type Point } from './geometry'
import { PatternField } from './PatternField'
import type { GraphicProps } from './types'

const WAVE = 540
const LINES = 16
const GAP = 26
const AMP = 30
const TILE_H = LINES * GAP

/**
 * One wave across the tile (a step past each side so tile joins stay smooth). Each line runs a sixteenth of a turn
 * behind the last: neighbours never cross, and after sixteen lines the phase is back where it began, so the tile
 * repeats.
 */
function wave(i: number, shift: number) {
  const phase = (Math.PI * 2 * i) / LINES
  const y0 = GAP / 2 + i * GAP + shift
  const points: Point[] = steps(-WAVE / 8, WAVE + WAVE / 8, 21).map((x) => [x, y0 + AMP * Math.sin((Math.PI * 2 * x) / WAVE + phase)])
  return smoothPath(points)
}

/** Lines near the tile's top and bottom swing past its edge, so each is drawn again one tile up and down. */
const D = [-TILE_H, 0, TILE_H].flatMap((shift) => Array.from({ length: LINES }, (_, i) => wave(i, shift))).join('')

/** Pattern: soft diagonal waves that ripple across the frame. */
export function FlowPattern(props: GraphicProps) {
  return (
    <PatternField
      {...props}
      tile={{ width: WAVE, height: TILE_H, transform: 'rotate(-16)' }}
      fade={{ kind: 'linear', x1: 1, y1: 1, x2: 0, y2: 0, edge: 0.08 }}
    >
      {(ink, gain) => <path d={D} stroke={ink} strokeOpacity={0.15 * gain} strokeWidth="2" />}
    </PatternField>
  )
}
