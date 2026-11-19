import { FONT_PAGES } from '../lib/kit'

export interface FontFile {
  label: string
  url: string
}

export interface Face {
  id: 'geist' | 'lato' | 'metal'
  family: string
  /** Tailwind font utility for the specimen. */
  className: string
  role: string
  cssVar: string
  weights: number[]
  specimen: string
  licence: string
  page: string
  files: FontFile[]
}

const font = (name: string) => `/kit/fonts/one-agency_font_${name}`

export const FACES: Face[] = [
  {
    id: 'geist',
    family: 'Geist',
    className: 'font-sans',
    role: 'Headlines, body, buttons and labels. Everything except numbers and accent words.',
    cssVar: '--font-sans',
    weights: [400, 500, 600, 700],
    specimen: 'Find and close the holes in your business',
    licence: font('geist_ofl.txt'),
    page: FONT_PAGES.geist,
    files: [400, 500, 600, 700].flatMap((w) => [
      { label: `${w} WOFF2`, url: font(`geist-${w}.woff2`) },
      { label: `${w} TTF`, url: font(`geist-${w}.ttf`) },
    ]),
  },
  {
    id: 'lato',
    family: 'Lato',
    className: 'font-num',
    role: 'Stat numerals only (--font-num), weight 700.',
    cssVar: '--font-num',
    weights: [700],
    specimen: '10M+ $100M+ 7B+ 450K+',
    licence: font('lato_ofl.txt'),
    page: FONT_PAGES.lato,
    files: [
      { label: '700 WOFF2', url: font('lato-700.woff2') },
      { label: '700 TTF', url: font('lato-700.ttf') },
    ],
  },
  {
    id: 'metal',
    family: 'Metal',
    className: 'font-accent',
    role: 'One accent word per headline (--font-accent), filled with the signature gradient, at 1.27x the headline size.',
    cssVar: '--font-accent',
    weights: [400],
    specimen: 'holes · any · AI',
    licence: font('metal_ofl.txt'),
    page: FONT_PAGES.metal,
    files: [
      { label: '400 WOFF2', url: font('metal-400.woff2') },
      { label: '400 TTF', url: font('metal-400.ttf') },
    ],
  },
]

export interface TypeStep {
  token: string
  /** Tailwind utility that applies it. */
  className: string
  value: string
  use: string
}

/** The live site's --step-* scale (mirrors the @theme block in src/index.css). */
export const TYPE_SCALE: TypeStep[] = [
  { token: '--step-4', className: 'text-step-4', value: 'clamp(2.25rem, 1.6rem + 2.7vw, 3.8rem)', use: 'Page and section headlines' },
  { token: '--step-3', className: 'text-step-3', value: 'clamp(2.125rem, 1.7rem + 1.75vw, 3rem)', use: 'Large subheads' },
  { token: '--step-num', className: 'text-step-num', value: 'clamp(2.1875rem, 2.07rem + 0.5vw, 2.5rem)', use: 'Stat numerals (Lato)' },
  { token: '--step-2', className: 'text-step-2', value: 'clamp(1.5rem, 1.3rem + 0.9vw, 1.875rem)', use: 'Card titles' },
  { token: '--step-1', className: 'text-step-1', value: 'clamp(1.125rem, 1.07rem + 0.22vw, 1.25rem)', use: 'Ledes' },
  { token: '--step-0', className: 'text-step-0', value: 'clamp(1.0625rem, 1.03rem + 0.14vw, 1.125rem)', use: 'Body' },
  { token: '--step--1', className: 'text-step--1', value: 'clamp(0.875rem, 0.85rem + 0.12vw, 0.9375rem)', use: 'Buttons, secondary text' },
  { token: '--step-small', className: 'text-step-small', value: '0.8125rem', use: 'Eyebrows, captions, legal' },
]
