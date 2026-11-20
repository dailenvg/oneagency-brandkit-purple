import { FONT_PAGES } from '../lib/kit'

export interface FontFile {
  label: string
  url: string
}

export interface Face {
  id: 'unbounded' | 'geist'
  family: string
  /** Utility classes that set the face for the specimen. */
  className: string
  role: string
  cssVar: string
  /** Weights shown in the specimen (the ones the brand uses). */
  weights: number[]
  specimen: string
  licence: string
  page: string
  files: FontFile[]
}

const font = (name: string) => `/kit/fonts/one-agency_font_${name}`

const filesFor = (family: string, weights: number[]) =>
  weights.flatMap((w) => [
    { label: `${w} WOFF2`, url: font(`${family}-${w}.woff2`) },
    { label: `${w} TTF`, url: font(`${family}-${w}.ttf`) },
  ])

export const FACES: Face[] = [
  {
    id: 'unbounded',
    family: 'Unbounded',
    className: 'display',
    role: 'Display (--font-display): headlines, stat numerals and the accent word. SemiBold 600, tracking -0.02em. Medium 500 and Bold 700 are in the download for print and slides.',
    cssVar: '--font-display',
    weights: [600],
    specimen: 'Find and close the holes in your business',
    licence: font('unbounded_ofl.txt'),
    page: FONT_PAGES.unbounded,
    files: filesFor('unbounded', [500, 600, 700]),
  },
  {
    id: 'geist',
    family: 'Geist',
    className: 'font-sans',
    role: 'Body (--font-sans): paragraphs, buttons, labels and captions. Everything that is not display.',
    cssVar: '--font-sans',
    weights: [400, 500, 600, 700],
    specimen: 'Find and close the holes in your business',
    licence: font('geist_ofl.txt'),
    page: FONT_PAGES.geist,
    files: filesFor('geist', [400, 500, 600, 700]),
  },
]

export interface TypeStep {
  token: string
  /** Tailwind utility that applies it. */
  className: string
  value: string
  use: string
}

/** The kit's --step-* scale (mirrors the @theme block in src/index.css). Display steps run at 0.8 for Unbounded's width. */
export const TYPE_SCALE: TypeStep[] = [
  { token: '--step-4', className: 'text-step-4 display', value: 'clamp(1.8rem, 1.28rem + 2.16vw, 3.04rem)', use: 'Page and section headlines (Unbounded)' },
  { token: '--step-3', className: 'text-step-3 display', value: 'clamp(1.7rem, 1.36rem + 1.4vw, 2.4rem)', use: 'Large subheads (Unbounded)' },
  { token: '--step-num', className: 'text-step-num', value: 'clamp(1.75rem, 1.656rem + 0.4vw, 2rem)', use: 'Stat numerals (Unbounded)' },
  { token: '--step-2', className: 'text-step-2 display', value: 'clamp(1.5rem, 1.3rem + 0.9vw, 1.875rem)', use: 'Subheads and card titles (Unbounded)' },
  { token: '--step-1', className: 'text-step-1', value: 'clamp(1.125rem, 1.07rem + 0.22vw, 1.25rem)', use: 'Ledes' },
  { token: '--step-0', className: 'text-step-0', value: 'clamp(1.0625rem, 1.03rem + 0.14vw, 1.125rem)', use: 'Body' },
  { token: '--step--1', className: 'text-step--1', value: 'clamp(0.875rem, 0.85rem + 0.12vw, 0.9375rem)', use: 'Buttons, secondary text' },
  { token: '--step-small', className: 'text-step-small', value: '0.8125rem', use: 'Eyebrows, captions, legal' },
]
