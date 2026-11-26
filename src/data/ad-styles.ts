/**
 * Ad text styles. PROPOSED: scaled from the film's 1080-wide type (base.css: headline 104px, sub 62px, button 46px),
 * with display set in Unbounded at 0.8 of the film size for its width; not yet signed off. The animated ads
 * (scripts/build-motion-ads.mjs) and the Typography section both read this file. Import-free on purpose.
 */

export type AdFace = 'Geist' | 'Unbounded'

export interface AdTextStyle {
  id: 'eyebrow' | 'headline' | 'accent' | 'subhead' | 'body' | 'stat' | 'statLabel' | 'cta' | 'legal'
  label: string
  face: AdFace
  weight: number
  /** px at 1080 wide (1080x1080, 1080x1350, 1080x1920). */
  social: number
  /** px in a 300x250 banner. */
  banner: number
  lineHeight: number
  /** em. */
  tracking: number
  uppercase: boolean
  /** Token the text is set in. */
  colour: string
  note: string
}

export const AD_TEXT_STYLES: AdTextStyle[] = [
  {
    id: 'eyebrow',
    label: 'Eyebrow',
    face: 'Geist',
    weight: 600,
    social: 30,
    banner: 9,
    lineHeight: 1.2,
    tracking: 0.14,
    uppercase: true,
    colour: '--mint',
    note: 'Three words max. The eyebrow: Mint, tracked caps.',
  },
  {
    id: 'headline',
    label: 'Headline',
    face: 'Unbounded',
    weight: 600,
    social: 76,
    banner: 18,
    lineHeight: 1.08,
    tracking: -0.02,
    uppercase: false,
    colour: '--text',
    note: 'Two short lines. One accent word per headline.',
  },
  {
    id: 'accent',
    label: 'Accent word',
    face: 'Unbounded',
    weight: 600,
    social: 76,
    banner: 18,
    lineHeight: 1.08,
    tracking: -0.02,
    uppercase: false,
    colour: '--mint',
    note: 'The headline size and face, in solid Mint on navy (Ultra Violet on light grounds). Never a gradient.',
  },
  {
    id: 'subhead',
    label: 'Subhead',
    face: 'Geist',
    weight: 500,
    social: 52,
    banner: 13,
    lineHeight: 1.14,
    tracking: -0.015,
    uppercase: false,
    colour: '--text-2',
    note: "One line with the buyer's outcome.",
  },
  {
    id: 'body',
    label: 'Body',
    face: 'Geist',
    weight: 400,
    social: 38,
    banner: 11,
    lineHeight: 1.35,
    tracking: 0,
    uppercase: false,
    colour: '--text-2',
    note: 'Rare in ads. Keep it to one sentence.',
  },
  {
    id: 'stat',
    label: 'Stat number',
    face: 'Unbounded',
    weight: 600,
    social: 70,
    banner: 16,
    lineHeight: 1.1,
    tracking: -0.02,
    uppercase: false,
    colour: '--mint',
    note: 'Unbounded 600 in solid Mint on navy (Ultra Violet on light grounds). Always with a label and a source line.',
  },
  {
    id: 'statLabel',
    label: 'Stat label',
    face: 'Geist',
    weight: 500,
    social: 30,
    banner: 9,
    lineHeight: 1.25,
    tracking: 0,
    uppercase: false,
    colour: '--text',
    note: 'Directly under its number, in white.',
  },
  {
    id: 'cta',
    label: 'CTA',
    face: 'Geist',
    weight: 600,
    social: 44,
    banner: 12,
    lineHeight: 1.2,
    tracking: -0.01,
    uppercase: false,
    colour: '--on-accent',
    note: 'Inside the Mint pill. One CTA per ad.',
  },
  {
    id: 'legal',
    label: 'Legal line',
    face: 'Geist',
    weight: 400,
    social: 24,
    banner: 9,
    lineHeight: 1.4,
    tracking: 0,
    uppercase: false,
    colour: '--text-2',
    note: 'Bottom of the frame, under the proof it qualifies. Never below 9 px.',
  },
]
