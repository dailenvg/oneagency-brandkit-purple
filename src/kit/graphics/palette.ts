import { RAMPS, STYLE_TOKENS, TOKENS } from '../../data/tokens'

/** Which ground a graphic is drawn for: Navy (dark) or Sky (light). */
export type Tone = 'dark' | 'light'

const RAMP_STEPS = RAMPS.flatMap((r) => r.steps)

/** A token's hex, from the brand tokens, the derived ramps or the derived style tokens. Never a literal. */
function hex(name: string) {
  const value =
    TOKENS.find((t) => t.name === name)?.hex ?? RAMP_STEPS.find((s) => s.name === name)?.hex ?? STYLE_TOKENS.find((s) => s.name === name)?.hex
  if (!value) throw new Error(`No hex for ${name}`)
  return value
}

export interface GraphicPalette {
  /** Full-bleed ground (patterns, flattened exports). */
  ground: string
  /** Neutral for structure: hairlines, grids, rims. Used at low opacity. */
  line: string
  /** Neutral for labels and secondary marks. */
  text: string
  /** Signature gradient, start and end. */
  from: string
  to: string
  /** The full signature gradient for fills (Mint to Ultra Violet in both tones): frames and other solid artwork. */
  signature: readonly [string, string]
  /** Solid frame fills beside the gradient one: the accent, then the neutral. */
  frames: readonly [string, string]
  /** The focal point's colour: dot, highlighted node. */
  focal: string
  /** Text and marks that sit on a gradient or focal fill. */
  onFocal: string
  /** Glass body: gradient stops [offset, colour, opacity], lit from the top left (the --glass-fill recipe). */
  glass: readonly (readonly [number, string, number])[]
  /** Glass rim: bright at the top left, fading round to the bottom right (--glass-rim, --glass-rim-fade). */
  rimStops: readonly (readonly [number, string, number])[]
  /** Top-edge highlight (--glass-specular): paper at this opacity. */
  specular: number
  paper: string
  /** Glass tint under the body (--glass-tint): what makes it read as frosted, not clear. */
  tint: string
  tintAlpha: number
  /** Opacity scale, so every graphic uses the same steps. */
  alpha: { hairline: number; grid: number; structure: number; secondary: number; area: number }
  /** Patterns: opacity multiplier, set so every pattern still reads on a phone (a 1080 frame shown about 360 px wide). */
  patternGain: number
}

/** On navy: Mint into the derived light violet (full Ultra Violet is 2.1:1 on navy), Mint focal point, navy marks on it. */
const DARK: GraphicPalette = {
  ground: hex('--navy'),
  line: hex('--paper'),
  text: hex('--text-2'),
  from: hex('--mint'),
  to: hex('--violet-light'),
  signature: [hex('--mint'), hex('--violet')],
  frames: [hex('--mint'), hex('--mist')],
  focal: hex('--mint'),
  onFocal: hex('--on-accent'),
  glass: [
    [0, hex('--paper'), 0.13],
    [0.55, hex('--paper'), 0.04],
    [1, hex('--mint'), 0.08],
  ],
  rimStops: [
    [0, hex('--mint'), 0.9],
    [0.45, hex('--mint'), 0.18],
    [1, hex('--paper'), 0.1],
  ],
  specular: 0.3,
  paper: hex('--paper'),
  tint: hex('--navy'),
  tintAlpha: 0.55,
  alpha: { hairline: 0.07, grid: 0.12, structure: 0.22, secondary: 0.5, area: 0.2 },
  patternGain: 2.5,
}

/**
 * On Sky: Mint would vanish, so the gradient runs from the derived deep Mint (--mint-800, 4:1 on Sky) into Ultra Violet,
 * and the focal point is Ultra Violet with white marks on it (8.6:1).
 */
const LIGHT: GraphicPalette = {
  ground: hex('--sky'),
  line: hex('--ink'),
  text: hex('--ink-3'),
  from: hex('--mint-800'),
  to: hex('--violet'),
  signature: [hex('--mint'), hex('--violet')],
  frames: [hex('--violet'), hex('--paper')],
  focal: hex('--violet'),
  onFocal: hex('--paper'),
  glass: [
    [0, hex('--paper'), 0.85],
    [0.55, hex('--paper'), 0.5],
    [1, hex('--violet'), 0.08],
  ],
  rimStops: [
    [0, hex('--violet'), 0.8],
    [0.45, hex('--violet'), 0.25],
    [1, hex('--ink'), 0.08],
  ],
  specular: 0.9,
  paper: hex('--paper'),
  tint: hex('--paper'),
  tintAlpha: 0.55,
  alpha: { hairline: 0.07, grid: 0.11, structure: 0.2, secondary: 0.5, area: 0.1 },
  patternGain: 1.8,
}

export const palette = (tone: Tone): GraphicPalette => (tone === 'dark' ? DARK : LIGHT)

/** Stroke weights, px at the artboard's 1x size. */
export const STROKE = { hairline: 1, line: 1.5, focal: 2 } as const
