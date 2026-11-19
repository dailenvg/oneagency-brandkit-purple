import type { TokenGroup } from './tokens'

export const GROUP_LABELS: Record<TokenGroup, { label: string; note: string }> = {
  brand: { label: 'Brand', note: 'The three colours that make ONE recognisable: night-navy ground, rose, and the site blue (named lilac in the CSS).' },
  accent: { label: 'Accent', note: 'Steps of the brand accents for states, text on accents and pale panels.' },
  surface: { label: 'Surface', note: 'Grounds and raised layers, darkest first, then paper.' },
  neutral: { label: 'Neutral', note: 'Text, edges and ink.' },
  state: { label: 'State', note: 'Highlight and form-field states.' },
  gradient: { label: 'Gradient', note: 'The signature rose-to-blue fill, rules and dividers.' },
}

export const GROUP_ORDER: TokenGroup[] = ['brand', 'accent', 'surface', 'neutral', 'state', 'gradient']

export interface AccentRule {
  rule: string
  detail: string
}

/** How the accents behave in ads. PROPOSED; contrast figures from the generated table. */
export const ACCENT_RULES: AccentRule[] = [
  { rule: 'Rose is for one CTA per ad.', detail: 'The rose pill with --on-accent text. One per frame, so it is always the obvious next step.' },
  { rule: 'The gradient marks one thing.', detail: 'Either one accent word (Metal, --accent-fill) or the --bar rule. Never both on the same line, never a whole headline.' },
  {
    rule: 'No lilac body text on paper.',
    detail: '--lilac on --paper is 3.37:1, so large text only (18.66 px bold or 24 px regular and up). Body copy on paper is --ink or --ink-3.',
  },
  { rule: 'Text on rose is --on-accent.', detail: 'Never white on rose: it fails contrast.' },
  { rule: '--text-4 never carries meaning.', detail: 'It is decorative on the site. Labels and legal lines use --text-2 or --text-3.' },
  { rule: 'Stats wear the gradient, labels stay white.', detail: 'Lato 700 numbers in the gradient, --text labels, a --text-2 source line underneath.' },
]
