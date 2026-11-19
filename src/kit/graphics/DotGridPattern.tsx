import { PatternField } from './PatternField'
import type { GraphicProps } from './types'

const STEP = 36

/** Pattern: a fine dot grid that fades out from a soft centre. */
export function DotGridPattern(props: GraphicProps) {
  return (
    <PatternField {...props} tile={{ width: STEP, height: STEP }} fade={{ kind: 'radial', cx: 0.5, cy: 0.5, r: 0.66, edge: 0 }}>
      {(ink, gain) => <circle cx={STEP / 2} cy={STEP / 2} r="2.75" fill={ink} fillOpacity={0.36 * gain} />}
    </PatternField>
  )
}
