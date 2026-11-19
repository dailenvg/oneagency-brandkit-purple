import { CONTOUR_TILE, CONTOURS } from './contours'
import { PatternField } from './PatternField'
import type { GraphicProps } from './types'

/** Pattern: loop-shaped contour lines, index contours stronger, fading toward the top left. */
export function ContourPattern(props: GraphicProps) {
  return (
    <PatternField {...props} tile={{ width: CONTOUR_TILE, height: CONTOUR_TILE }} fade={{ kind: 'radial', cx: 0.78, cy: 0.82, r: 0.95, edge: 0.1 }}>
      {(ink, gain) => (
        <g stroke={ink} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
          {CONTOURS.map(({ d, index }, i) => (
            <path key={i} d={d} strokeWidth={index ? 2.5 : 2} strokeOpacity={(index ? 0.2 : 0.1) * gain} />
          ))}
        </g>
      )}
    </PatternField>
  )
}
