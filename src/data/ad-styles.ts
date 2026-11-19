/**
 * Ad text styles. PROPOSED: scaled from the film's 1080-wide type (base.css: headline 104px, sub 62px, button 46px)
 * and the live site's eyebrow, stat and legal treatments; not yet signed off. The animated ads
 * (scripts/build-motion-ads.mjs) and the Typography section both read this file. Import-free on purpose.
 */

export type AdFace = 'Geist' | 'Lato' | 'Metal'

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
    colour: '--rose',
    note: 'Three words max. The site eyebrow: rose, tracked caps.',
  },
  {
    id: 'headline',
    label: 'Headline',
    face: 'Geist',
    weight: 700,
    social: 96,
    banner: 22,
    lineHeight: 1.04,
    tracking: -0.03,
    uppercase: false,
    colour: '--text',
    note: 'Two short lines. One accent word per headline.',
  },
  {
    id: 'accent',
    label: 'Accent word',
    face: 'Metal',
    weight: 400,
    social: 122,
    banner: 28,
    lineHeight: 0.82,
    tracking: 0,
    uppercase: false,
    colour: '--accent-fill',
    note: '1.27x the headline (the site value), filled with the signature gradient.',
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
    face: 'Lato',
    weight: 700,
    social: 88,
    banner: 20,
    lineHeight: 1.1,
    tracking: 0,
    uppercase: false,
    colour: '--accent-fill',
    note: 'Lato 700, the site stat numeral, gradient filled. Always with a label and a source line.',
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
    note: 'Inside the rose pill. One CTA per ad.',
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
