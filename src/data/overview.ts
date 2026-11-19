import type { ViewId } from '../lib/views'

/** One line per view for the Overview shortcuts. */
export const VIEW_SUMMARIES: Record<Exclude<ViewId, 'overview'>, string> = {
  logo: 'The chrome ONE mark in every lockup and colour, with clear space, sizes and misuse.',
  colour: 'Every live-site token, derived ramps, the contrast matrix and accent rules.',
  type: 'Geist, Lato and Metal, the type scale, ad text styles and the highlight band.',
  elements: 'Signature devices, patterns, illustrations, CTAs, proof bar, award badge and icons.',
  glass: 'Frosted glass with a rose rim light: components, rules and the reference ads.',
  motion: "The film's moves, live, with exact values and the HTML5 ad runtime.",
  imagery: 'Direction for real work and real customers, plus an AI-generated starter library.',
  voice: 'Pillars, traits, rules, banned words and headline patterns.',
  copy: 'Headlines, CTAs, proof points and legal lines, each one tap to copy.',
  ads: 'Magnific templates and samples in every size, plus the animated ads.',
  assets: 'Every file with its format and size, a ZIP per group and the full kit.',
}

/** The v1.1 changes, each pointing at the view it lives in. */
export const WHATS_NEW: { text: string; view: ViewId }[] = [
  { text: 'A dashboard: one view per topic, a sidebar on desktop and a menu on phones.', view: 'overview' },
  { text: 'Light and dark mode. Light is derived: the live site is dark-only.', view: 'colour' },
  { text: 'Glass and texture: the reference style as components, rules and Magnific illustrations.', view: 'glass' },
  { text: 'The highlight band for titles, with its rules and a live demo.', view: 'type' },
]
