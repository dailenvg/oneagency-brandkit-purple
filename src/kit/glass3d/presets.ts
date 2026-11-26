/**
 * Brand presets for the glass studio. Every colour is a brand token from src/styles/tokens.css (hex copied here
 * because WebGL takes numbers, not CSS variables); derived steps are labelled as in tokens.css.
 */

export type RGB = [number, number, number]

export const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]

export const toHex = (c: RGB) => `#${c.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('')}`

/** Brand tokens used by the studio. */
export const BRAND = {
  navy: '#020257',
  mint: '#00fab3',
  violet: '#6203d0',
  sky: '#d0e6fd',
  mist: '#ebebed',
  paper: '#ffffff',
  /** derived */
  void: '#010138',
  /** derived */
  violetLight: '#a08cec',
  /** derived ramp */
  violet800: '#2e068c',
  /** derived ramp */
  mint300: '#affed9',
} as const

export type MaterialId = 'clear' | 'mint' | 'violet' | 'signature'

export interface Material {
  id: MaterialId
  label: string
  /** How strongly the glass takes the colour, 0 to 1. */
  tint: number
  /** Where along the icon's height the colour starts and is full (0 bottom, 1 top). */
  lo: number
  hi: number
  /** Top colour, middle colour. */
  top: string
  middle: string
}

export const MATERIALS: Material[] = [
  { id: 'clear', label: 'Clear', tint: 0, lo: 0.25, hi: 0.65, top: BRAND.paper, middle: BRAND.paper },
  { id: 'mint', label: 'Mint', tint: 0.95, lo: 0.12, hi: 0.85, top: BRAND.mint, middle: BRAND.mint300 },
  { id: 'violet', label: 'Violet', tint: 0.95, lo: 0.1, hi: 0.8, top: BRAND.violet, middle: BRAND.violetLight },
  /** The logo gradient, run vertically: Mint at the top into Ultra Violet. */
  { id: 'signature', label: 'Signature', tint: 1, lo: 0.08, hi: 0.75, top: BRAND.mint, middle: BRAND.violet },
]

export type GroundId = 'navy' | 'violet' | 'mist'

export interface Ground {
  id: GroundId
  label: string
  /** Flat fill, or a 120° gradient from `from` to `to` (the violet ground). */
  from: string
  to: string
  ink: string
  /** Rim light: Mint on navy and violet, Ultra Violet on light (the kit's glass rule). */
  rim: string
}

export const GROUNDS: Ground[] = [
  { id: 'navy', label: 'Navy', from: BRAND.navy, to: BRAND.navy, ink: BRAND.sky, rim: BRAND.mint },
  { id: 'violet', label: 'Violet', from: BRAND.violet800, to: BRAND.void, ink: BRAND.paper, rim: BRAND.mint },
  { id: 'mist', label: 'Mist', from: BRAND.mist, to: BRAND.mist, ink: BRAND.navy, rim: BRAND.violet },
]

export interface GlassSettings {
  ior: number
  disp: number
  frost: number
  depth: number
  bevel: number
  tint: number
  white: number
  rim: number
  lo: number
  hi: number
  top: RGB
  middle: RGB
}

/** Thickness, edge, refraction and spectrum are fixed at their minimums (no sliders): a thin, flat-edged slab. */
export const DEFAULT_SETTINGS: GlassSettings = {
  ior: 1,
  disp: 0,
  frost: 0.7,
  depth: 0.08,
  bevel: 0.01,
  tint: 0.95,
  white: 0.12,
  rim: 0.45,
  lo: 0.12,
  hi: 0.85,
  top: hex(BRAND.mint),
  middle: hex(BRAND.mint300),
}

export interface SliderSpec {
  key: 'tint' | 'white' | 'rim' | 'frost'
  label: string
  min: number
  max: number
  step: number
}

export const SLIDERS: SliderSpec[] = [
  { key: 'tint', label: 'Colour', min: 0, max: 1, step: 0.01 },
  { key: 'frost', label: 'Frost', min: 0, max: 1, step: 0.01 },
  { key: 'white', label: 'Milk', min: 0, max: 0.6, step: 0.01 },
  { key: 'rim', label: 'Rim light', min: 0, max: 1, step: 0.01 },
]

/** The ONE mark, from design/source/rebrand/mark_*.svg (viewBox 0 0 492 330). */
export const ONE_MARK_PATH =
  'M492 0V179.636C492 262.679 424.689 330 341.656 330H150.344C67.3114 330 9.8946e-05 262.679 0 179.636V150.364C9.89717e-05 67.3205 67.3114 4.94866e-05 150.344 0H492ZM160.356 75.8838C118.462 75.884 84.5003 109.851 84.5 151.751V178.249C84.5003 220.149 118.462 254.116 160.356 254.116H331.644C373.538 254.116 407.5 220.149 407.5 178.249V75.8838H160.356Z'
