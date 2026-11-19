/**
 * Graphic elements and the ad icon subset. scripts/build-elements.mjs imports this file to write the downloads to
 * public/kit/elements/, so it stays import-free.
 *
 * File names follow the kit convention one-agency_element_[id](-[variant]).[ext]:
 *   one-agency_element_halo.svg                       one file per format
 *   one-agency_element_conversion-curve-on-dark.svg   one file per tone and format
 */

export const ELEMENTS_DIR = '/kit/elements'

export type ElementFormat = 'svg' | 'png'

export type ElementFamily = 'device' | 'pattern' | 'illustration' | 'classic'

export interface ElementVariant {
  /** File name suffix, e.g. "on-dark". */
  id: string
  label: string
}

export interface ElementFile {
  id: string
  /** File base name without variant, size or extension. */
  base: string
  title: string
  source: 'live' | 'film' | 'proposed'
  use: string
  /** Describes the artwork for screen readers (the card heading already gives the title). Falls back to the title. */
  alt?: string
  family: ElementFamily
  formats: readonly ElementFormat[]
  /** One file set per variant (tone). Empty: a single file set. */
  variants: readonly ElementVariant[]
}

/** On-dark and on-light versions of a vector graphic. */
export const TONES: readonly ElementVariant[] = [
  { id: 'on-dark', label: 'On dark' },
  { id: 'on-light', label: 'On light' },
]

type Extra = Partial<Pick<ElementFile, 'formats' | 'variants' | 'alt'>>

const el = (id: string, family: ElementFamily, title: string, source: ElementFile['source'], use: string, extra: Extra = {}): ElementFile => ({
  id,
  base: `one-agency_element_${id}`,
  title,
  source,
  use,
  family,
  formats: ['svg', 'png'],
  variants: [],
  ...extra,
})

const toned = (alt: string): Extra => ({ variants: TONES, alt })

export const ELEMENTS: ElementFile[] = [
  el('conversion-curve', 'device', 'Conversion curve', 'proposed', 'A growth curve that rises left to right and lands on one lit result. Pair it with one proof number.',
    toned('Growth curve rising left to right to one lit result marker'),
  ),
  el('signal-ribbon', 'device', 'Signal ribbon', 'proposed', 'A twisting band of fine lines that echoes the loop, lit where it turns. Run it off one edge of an ad, behind or beside the headline.',
    toned('Twisting band of fine lines, rising left to right, lit where it turns'),
  ),
  el('conversion-stages', 'device', 'Conversion stages', 'proposed', 'Visitors, leads, customers, revenue. Use it to explain the process. Revenue, the last stage, is always the lit one.',
    toned('Four stages from visitors to revenue, revenue highlighted'),
  ),
  el('orbit', 'device', 'Orbit', 'proposed', 'Signals circling a central query, one of them found and lit. For AI search and visibility stories. One highlight only.',
    toned('Signals orbiting a central query, one node on the outer ring lit'),
  ),
  el('editorial-frame', 'device', 'Editorial frame', 'proposed', 'Corner marks and a series index for 1:1 ads. Set copy inside the marks. The index reads 01 of 04; change it to match your series.',
    toned('Corner marks with a series index reading 01 of 04'),
  ),
  el('halo', 'classic', 'Halo', 'film', 'Soft lilac glow behind the logo or a hero number. One per frame.'),
  el('glow-field', 'classic', 'Glow field', 'live', "The site's hero ground: rose glow top left, blue glow bottom right, on night-navy."),
  el('pattern-dots', 'pattern', 'Dot grid', 'proposed', 'A fine dot grid, strongest in the middle and fading to the edges. Behind proof numbers and data.',
    toned('Dot grid fading out from the centre'),
  ),
  el('pattern-contours', 'pattern', 'Contour lines', 'proposed', 'Loop-shaped contour lines, quiet at the top left. Behind headlines about growth, places and travel.',
    toned('Contour lines fading toward the top left'),
  ),
  el('pattern-grid', 'pattern', 'Fine grid', 'proposed', 'Minor and major lines like graph paper, quiet at the top right. Behind charts, audits and reports.',
    toned('Graph-paper grid fading toward the top right'),
  ),
  el('pattern-flow', 'pattern', 'Flow lines', 'proposed', 'Soft diagonal waves, quiet at the top left. A calm ground for testimonials and offers.',
    toned('Diagonal wave lines fading toward the top left'),
  ),
  el('illustration-answering-leads', 'illustration', 'Answering leads', 'proposed', 'Phone, chat and the five-minute reply. For lead handling and call answering.',
    toned('Phone with chat bubbles and a five-minute reply timer'),
  ),
  el('illustration-free-audit', 'illustration', 'Free audit', 'proposed', 'A magnifier over a dashboard, with a checklist beside it. For the free audit offer.',
    toned('Magnifier over a dashboard, with an audit checklist beside it'),
  ),
  el('illustration-ai-search', 'illustration', 'AI search visibility', 'proposed', 'A search bar, an AI answer and three cited sources, the first one yours and lit. For AI search work.',
    toned('Search bar and AI answer citing three sources, yours first'),
  ),
  el('illustration-paid-media', 'illustration', 'Paid media', 'proposed', 'Two ad cards and a line that climbs from the click into a target. For search and social advertising.',
    toned('Two ad cards and a results line climbing into a target'),
  ),
  el('cta-primary', 'classic', 'CTA, primary', 'live', 'Rose pill, navy text. One per ad.'),
  el('cta-secondary', 'classic', 'CTA, secondary', 'live', 'White outline pill for a second, quieter action on dark.'),
  el('cta-on-light', 'classic', 'CTA, on light', 'proposed', 'Ink pill for paper grounds, where rose fails contrast.'),
  el('stat-bar', 'classic', 'Proof bar', 'live', 'Lato numbers in the gradient, white labels, gradient dividers, the source line underneath.'),
  el('award-badge', 'classic', 'Award badge', 'live', 'Always says it was awarded to ConversionIQ.ai.'),
  el('laurel', 'classic', 'Laurel', 'live', 'The award laurel from the live banner, white.'),
]

export const elementById = (id: string) => {
  const found = ELEMENTS.find((e) => e.id === id)
  if (!found) throw new Error(`Unknown element ${id}`)
  return found
}

/** Path under ELEMENTS_DIR for one file of an element. */
export const elementPath = (e: ElementFile, ext: ElementFormat, variant?: string) => `${e.base}${variant ? `-${variant}` : ''}.${ext}`

export interface ElementDownload {
  url: string
  label: string
  group?: string
}

/** Every file an element ships, for the download menus: one row per tone with SVG and PNG, or one row per format. */
export function elementDownloads(e: ElementFile, variant?: string): ElementDownload[] {
  const url = (ext: ElementFormat, v?: string) => `${ELEMENTS_DIR}/${elementPath(e, ext, v)}`
  const variants = e.variants.filter((v) => !variant || v.id === variant)
  if (variants.length) return variants.flatMap((v) => e.formats.map((ext) => ({ url: url(ext, v.id), label: ext.toUpperCase(), group: v.label })))
  return e.formats.map((ext) => ({ url: url(ext), label: ext.toUpperCase() }))
}

export interface AdIcon {
  /** Phosphor component name (bold weight). */
  name: string
  file: string
  use: string
}

const icon = (name: string, file: string, use: string): AdIcon => ({ name, file, use })

/** The Phosphor bold subset used in ads. */
export const AD_ICONS: AdIcon[] = [
  icon('ArrowRight', 'arrow-right', 'Inside CTAs'),
  icon('ArrowUpRight', 'arrow-up-right', 'Outbound links'),
  icon('Phone', 'phone', 'Call lines'),
  icon('ChatCircleDots', 'chat-circle-dots', 'Answering the lead'),
  icon('MagnifyingGlass', 'magnifying-glass', 'Audits, search'),
  icon('ChartLineUp', 'chart-line-up', 'Results'),
  icon('Clock', 'clock', '5-minute audit'),
  icon('CheckCircle', 'check-circle', 'Audit checklist items'),
  icon('Trophy', 'trophy', 'Awards'),
  icon('Target', 'target', 'Qualified leads'),
  icon('Users', 'users', 'Customers, teams'),
  icon('CalendarCheck', 'calendar-check', 'Tours, bookings'),
  icon('Storefront', 'storefront', 'E-commerce, retail'),
  icon('Megaphone', 'megaphone', 'Paid media'),
  icon('EnvelopeSimple', 'envelope-simple', 'Email'),
  icon('Globe', 'globe', 'AI search, web'),
  icon('ShieldCheck', 'shield-check', 'Compliance (ConversionIQ.ai)'),
]

export const iconUrl = (file: string) => `${ELEMENTS_DIR}/icons/one-agency_icon_${file}.svg`
