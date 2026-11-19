import { RAMPS, STYLE_TOKENS, TOKENS } from '../../data/tokens'

/** Which ground a graphic is drawn for: night-navy (dark) or paper and lavender (light). */
export type Tone = 'dark' | 'light'

const RAMP_STEPS = RAMPS.flatMap((r) => r.steps)

/** A token's hex, from the live tokens, the derived ramps or the derived style tokens. Never a literal. */
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
  /** The focal point's colour: dot, glow, highlighted node. */
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
  /** Drop shadow under glass. */
  shadow: string
  shadowAlpha: number
  /** Opacity scale, so every graphic uses the same steps. */
  alpha: { hairline: number; grid: number; structure: number; secondary: number; glow: number }
  /** Patterns: opacity multiplier, set so every pattern still reads on a phone (a 1080 frame shown about 360 px wide). */
  patternGain: number
}

const DARK: GraphicPalette = {
  ground: hex('--ground'),
  line: hex('--paper'),
  text: hex('--text-2'),
  from: hex('--rose'),
  to: hex('--lilac'),
  focal: hex('--lilac'),
  onFocal: hex('--on-accent'),
  glass: [
    [0, hex('--paper'), 0.13],
    [0.55, hex('--paper'), 0.04],
    [1, hex('--rose'), 0.09],
  ],
  rimStops: [
    [0, hex('--rose'), 0.9],
    [0.45, hex('--rose'), 0.18],
    [1, hex('--paper'), 0.1],
  ],
  specular: 0.3,
  paper: hex('--paper'),
  tint: hex('--ground'),
  tintAlpha: 0.55,
  shadow: hex('--void'),
  shadowAlpha: 0.9,
  alpha: { hairline: 0.07, grid: 0.12, structure: 0.22, secondary: 0.5, glow: 0.55 },
  patternGain: 2.5,
}

/**
 * Rose and lilac are too pale on paper: the gradient and focal point use the hub's light accent pair (derived tokens,
 * 3.67:1 or better on paper, paper-2 and lavender). Marks on the focal fill are ink: 4.7 to 5.1:1 across the gradient,
 * where white is only about 4:1.
 */
const LIGHT: GraphicPalette = {
  ground: hex('--lavender'),
  line: hex('--ink'),
  text: hex('--ink-3'),
  from: hex('--kit-accent-light-from'),
  to: hex('--kit-accent-light-to'),
  focal: hex('--kit-accent-light-to'),
  onFocal: hex('--ink'),
  glass: [
    [0, hex('--paper'), 0.85],
    [0.55, hex('--paper'), 0.5],
    [1, hex('--rose'), 0.12],
  ],
  rimStops: [
    [0, hex('--kit-rose-600'), 0.8],
    [0.45, hex('--rose'), 0.3],
    [1, hex('--ink'), 0.08],
  ],
  specular: 0.9,
  paper: hex('--paper'),
  tint: hex('--paper'),
  tintAlpha: 0.55,
  shadow: hex('--ink'),
  shadowAlpha: 0.14,
  alpha: { hairline: 0.07, grid: 0.11, structure: 0.2, secondary: 0.5, glow: 0.24 },
  patternGain: 1.8,
}

export const palette = (tone: Tone): GraphicPalette => (tone === 'dark' ? DARK : LIGHT)

/** Stroke weights, px at the artboard's 1x size. */
export const STROKE = { hairline: 1, line: 1.5, focal: 2 } as const
