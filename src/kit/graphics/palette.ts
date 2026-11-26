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
  /** Glass body, top to bottom: gradient stops [offset, colour, opacity]. Colour at the top edge running down to a milky clear (--glass-fill over --glass-milk). */
  glass: readonly (readonly [number, string, number])[]
  /** Glass rim, top to bottom: bright along the top edge, fading down the sides (--glass-rim, --glass-rim-fade). */
  rimStops: readonly (readonly [number, string, number])[]
  /** Top-edge highlight (--glass-specular): paper at this opacity. */
  specular: number
  /** Diagonal strip-light sheen across the face (--glass-sheen): paper at this opacity. */
  sheen: number
  /** Thin slab edge along the bottom (--glass-wall). */
  wall: string
  wallAlpha: number
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
    [0, hex('--mint'), 0.22],
    [0.38, hex('--mint'), 0.1],
    [0.78, hex('--paper'), 0.07],
    [1, hex('--paper'), 0.07],
  ],
  rimStops: [
    [0, hex('--mint'), 0.9],
    [0.3, hex('--mint'), 0.22],
    [0.62, hex('--mint'), 0],
    [1, hex('--mint'), 0.22],
  ],
  specular: 0.38,
  sheen: 0.09,
  wall: hex('--void'),
  wallAlpha: 0.55,
  paper: hex('--paper'),
  tint: hex('--navy'),
  tintAlpha: 0.42,
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
    [0, hex('--violet'), 0.12],
    [0.38, hex('--paper'), 0.55],
    [0.78, hex('--paper'), 0.52],
    [1, hex('--paper'), 0.52],
  ],
  rimStops: [
    [0, hex('--violet'), 0.8],
    [0.3, hex('--violet'), 0.24],
    [0.62, hex('--violet'), 0],
    [1, hex('--violet'), 0.24],
  ],
  specular: 0.9,
  sheen: 0.6,
  wall: hex('--violet'),
  wallAlpha: 0.16,
  paper: hex('--paper'),
  tint: hex('--paper'),
  tintAlpha: 0.4,
  alpha: { hairline: 0.07, grid: 0.11, structure: 0.2, secondary: 0.5, area: 0.1 },
  patternGain: 1.8,
}

export const palette = (tone: Tone): GraphicPalette => (tone === 'dark' ? DARK : LIGHT)

/** Stroke weights, px at the artboard's 1x size. */
export const STROKE = { hairline: 1, line: 1.5, focal: 2 } as const
