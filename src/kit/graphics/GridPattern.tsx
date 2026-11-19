import { PatternField } from './PatternField'
import type { GraphicProps } from './types'

const MINOR = 36
const MAJOR = MINOR * 5

/** Pattern: graph paper, minor lines every 36px and a major line every fifth, fading toward the top right. */
export function GridPattern(props: GraphicProps) {
  const minors = Array.from({ length: MAJOR / MINOR - 1 }, (_, i) => (i + 1) * MINOR)
  return (
    <PatternField {...props} tile={{ width: MAJOR, height: MAJOR }} fade={{ kind: 'radial', cx: 0.3, cy: 0.72, r: 0.85, edge: 0.12 }}>
      {(ink, gain) => (
        <g stroke={ink}>
          <path d={minors.map((v) => `M${v} 0V${MAJOR}M0 ${v}H${MAJOR}`).join('')} strokeWidth="2" strokeOpacity={0.07 * gain} />
          <path d={`M1.25 0V${MAJOR}M0 1.25H${MAJOR}`} strokeWidth="2.5" strokeOpacity={0.14 * gain} />
        </g>
      )}
    </PatternField>
  )
}
