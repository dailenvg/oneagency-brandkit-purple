import type { TokenGroup } from './tokens'

export const GROUP_LABELS: Record<TokenGroup, { label: string; note: string }> = {
  brand: { label: 'Brand', note: 'The five colours from the moodboard: Navy, Mint, Ultra Violet, Sky and Mist.' },
  accent: { label: 'Accent', note: 'Derived: text on the accents, pressed steps, and the light Violet for text on navy.' },
  surface: { label: 'Surface', note: 'White from the board, then the derived navy grounds (darkest first) and a light Mist step.' },
  neutral: { label: 'Neutral', note: 'Text, edges and ink, derived from Navy and white.' },
  gradient: { label: 'Gradient', note: 'The signature Mint-to-Violet gradient, the logo gradient, the hairline rule and the stat dividers.' },
}

export const GROUP_ORDER: TokenGroup[] = ['brand', 'accent', 'surface', 'neutral', 'gradient']

export interface AccentRule {
  rule: string
  detail: string
}

/** How the accents behave in ads. PROPOSED; contrast figures from the generated table. */
export const ACCENT_RULES: AccentRule[] = [
  { rule: 'Mint is for one CTA per ad.', detail: 'The Mint pill with --on-accent (Navy) text. One per frame, so it is always the obvious next step.' },
  { rule: 'The gradient marks one thing.', detail: 'Either one accent word (Unbounded, --gradient) or the gradient rule. Never both on the same line, never a whole headline.' },
  { rule: 'Never Mint text on light grounds.', detail: '--mint on --paper is 1.37:1. On white, Mist and Sky, accent text is --violet (8.6:1 on white).' },
  { rule: 'No Ultra Violet text on navy.', detail: '--violet on --navy is 2.13:1. On navy, use --violet-light (6.49:1) or Mint.' },
  { rule: '--text-4 never carries meaning.', detail: 'It is decorative. Labels and legal lines use --text-2 or --text-3.' },
  { rule: 'Stats wear the gradient, labels stay white.', detail: 'Unbounded 600 numbers in the gradient, --text labels, a --text-2 source line underneath.' },
]
