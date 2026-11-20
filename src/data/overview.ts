import type { ViewId } from '../lib/views'

/** One line per view for the Overview shortcuts. */
export const VIEW_SUMMARIES: Record<Exclude<ViewId, 'overview'>, string> = {
  logo: 'The ONE mark in every lockup and colour, with clear space, sizes and misuse.',
  colour: 'The five moodboard colours, the derived tokens and ramps, the contrast matrix and accent rules.',
  type: 'Unbounded and Geist, the type scale, ad text styles and the highlight band.',
  elements: 'Signature devices, patterns, illustrations, CTAs, proof bar, award badge and icons.',
  glass: 'Frosted glass with a Mint rim light: components, rules and the reference ads.',
  motion: "The film's moves, live, with exact values and the HTML5 ad runtime.",
  imagery: 'Direction for real work and real customers, plus an AI-generated starter library.',
  voice: 'Pillars, traits, rules, banned words and headline patterns.',
  copy: 'Headlines, CTAs, proof points and legal lines, each one tap to copy.',
  ads: 'Magnific templates and samples in every size, plus the animated ads.',
  assets: 'Every file with its format and size, a ZIP per group and the full kit.',
}

/** The v2.0 changes (the rebrand), each pointing at the view it lives in. */
export const WHATS_NEW: { text: string; view: ViewId }[] = [
  { text: 'A new logo from the moodboard: the lockups, the ONE wordmark, the O mark and three app tiles.', view: 'logo' },
  { text: 'A new palette: Mist, Sky, Mint, Ultra Violet and Navy, with every derived token labelled.', view: 'colour' },
  { text: 'Unbounded for display and numerals, Geist for body. Lato and Metal are retired.', view: 'type' },
  { text: 'From concept 01 Nova: the Frames in orbit pattern and a set of five photos.', view: 'elements' },
  { text: 'The Möbius loop, recoloured to Mint, live on Overview and as stills.', view: 'elements' },
  { text: 'No glow, halo or backlight anywhere. The Halo and Glow field elements are retired.', view: 'glass' },
]
