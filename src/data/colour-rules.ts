import type { TokenGroup } from './tokens'

export const GROUP_LABELS: Record<TokenGroup, { label: string; note: string }> = {
  brand: {
    label: 'Brand',
    note: 'Navy, Ultra Violet, Mint, Sky, Mist and White are from the moodboard. Plum Night and Lavender come from concept 01 “Nova”. Each card shows the photo the colour pairs with.',
  },
  accent: { label: 'Accent', note: 'Derived: text on the accents, pressed steps, and the light Violet for text on navy.' },
  surface: { label: 'Surface', note: 'Derived: the navy grounds (darkest first) and a light Mist step.' },
  neutral: { label: 'Neutral', note: 'Text, edges and ink, derived from Navy and white.' },
  gradient: { label: 'Gradient', note: 'The signature Mint-to-Violet gradient, the logo gradient, the hairline rule and the stat dividers.' },
}

export const GROUP_ORDER: TokenGroup[] = ['brand', 'accent', 'surface', 'neutral', 'gradient']

/** The brand cards in the Colour view, lightest to darkest by luminance: the seven brand colours plus White (a surface token). */
export const BRAND_ORDER = ['--paper', '--lavender', '--mist', '--sky', '--mint', '--violet', '--navy', '--plum'] as const

export interface AccentRule {
  rule: string
  detail: string
}

/** How the accents behave in ads. PROPOSED; contrast figures from the generated table. */
export const ACCENT_RULES: AccentRule[] = [
  { rule: 'Mint is for one CTA per ad.', detail: 'The Mint pill with --on-accent (Navy) text. One per frame, so it is always the obvious next step.' },
  { rule: 'Text is never a gradient.', detail: 'Accent words and stats are solid: --mint on navy, --violet on light. The gradient is for rules, bars and fills only.' },
  { rule: 'Never Mint text on light grounds.', detail: '--mint on --paper is 1.37:1. On white, Mist and Sky, accent text is --violet (8.6:1 on white).' },
  { rule: 'No Ultra Violet text on navy.', detail: '--violet on --navy is 2.13:1. On navy, use --violet-light (6.49:1) or Mint.' },
  { rule: '--text-4 never carries meaning.', detail: 'It is decorative. Labels and legal lines use --text-2 or --text-3.' },
  { rule: 'Stats wear Mint, labels stay white.', detail: 'Unbounded 600 numbers in --mint, --text labels, a --text-2 source line underneath.' },
]
