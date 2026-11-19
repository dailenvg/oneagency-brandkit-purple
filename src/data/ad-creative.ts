/**
 * Creative ads: ten concepts composed from the kit's glass components, each in four sizes. Every claim, figure and CTA
 * is verbatim from oneagency.com (content pull of 2026-11-17) or a trim of a verbatim line: words removed, none added,
 * recorded in `trimmedFrom`. The only lines not from the site are labelled additions: eyebrows naming the service, and
 * source or legal notes (e.g. the results ad's "Figures as published on oneagency.com, November 2026."). Client stats
 * keep their client, and their date where the site gives one. The hub (src/components/ads/creative/) renders them live
 * and scripts/export-creative-ads.mjs renders them to PNG and WebP. Import-free on purpose (the script imports it).
 */

export type CreativeConceptId =
  | 'ai-visibility'
  | 'growth-audit'
  | 'paid-search'
  | 'paid-social'
  | 'local-seo'
  | 'web-design'
  | 'technology'
  | 'results'
  | 'vacation-ownership'
  | 'testimonial'

/** The glass composition each concept is built around (src/components/ads/creative/visuals/). */
export type CreativeVisual = 'browser' | 'tiles' | 'search-card' | 'profile-stack' | 'map-pack' | 'site-stream' | 'lead-stream' | 'stat-board' | 'award' | 'quote'

/** Crops of the Möbius loop stills (src/data/mobius.ts): where the loop sits in the frame. */
export type MobiusCropId = 'sweep' | 'band-top' | 'band-bottom' | 'side' | 'frame'

/**
 * The Möbius loop (ConversionIQ's key visual) behind a concept, in place of the halftone arc: a transparent still from
 * public/kit/elements/mobius/, used as supplied. Placed full width; `shift` only moves it away from an edge the loop
 * never touches, so every cut stays at the frame edge.
 */
export interface CreativeMobius {
  look: 'energy' | 'strings'
  crop: Record<CreativeFormat, MobiusCropId>
  /** Nudge per format, as a share of the ad's height (+ down) or width (+ right). */
  shift?: Partial<Record<CreativeFormat, { x?: number; y?: number }>>
}

export type CreativeField = 'eyebrow' | 'headline' | 'sub' | 'small' | 'award'

export interface CreativeStat {
  value: string
  label: string
  /** Client attribution for this stat alone (when the stats in one ad come from different clients). */
  source?: string
  /** The verbatim line, when the label is a trim of it. */
  trimmedFrom?: string
}

export interface CreativeAdConcept {
  id: CreativeConceptId
  name: string
  /** The oneagency.com page the copy comes from. */
  sourceUrl: string
  eyebrow: string | null
  headline: string
  /** Word index in `headline` set as the accent word (Metal, signature gradient). */
  accent: number
  /** The headline is a client quote: set in quote marks, with `attribution` under it. */
  quote: boolean
  attribution: string | null
  sub: string | null
  /** Checklist items (rose glass check badges, or the labels of the icon tiles). */
  list: string[]
  stats: CreativeStat[]
  /** Client and date for the stats, as one source line. */
  source: string | null
  /** Award lines, top to bottom. */
  award: string[]
  cta: string
  /** Small line under the CTA (secondary, or a legal line). */
  small: string | null
  visual: CreativeVisual
  /** What lights the visual from behind: the rose halftone arc (default) or the Möbius loop. */
  backdrop?: 'halftone' | 'mobius'
  mobius?: CreativeMobius
  /** Verbatim lines this ad trims (words removed, none added), by field. */
  trimmedFrom: Partial<Record<CreativeField, string>>
}

export const CREATIVE_CONCEPTS: CreativeAdConcept[] = [
  {
    id: 'ai-visibility',
    name: 'AI search visibility',
    sourceUrl: 'https://oneagency.com/ai-search-visibility/',
    eyebrow: 'AI search visibility',
    headline: 'Find out whether AI engines know you exist',
    accent: 3,
    quote: false,
    attribution: null,
    sub: null,
    list: [],
    stats: [{ value: '9% → 32%', label: 'on ChatGPT' }],
    source: 'Boccia, Sept 1–30 vs Jul 21–Aug 18 2026',
    award: [],
    cta: 'Check your AI visibility',
    small: null,
    visual: 'browser',
    trimmedFrom: {},
  },
  {
    id: 'growth-audit',
    name: 'Growth audit',
    sourceUrl: 'https://oneagency.com/growth-audit/',
    eyebrow: null,
    headline: "See exactly what's costing you customers.",
    accent: 5,
    quote: false,
    attribution: null,
    sub: null,
    list: ['AI search visibility scan', 'SEO audit', 'Online reviews audit', 'Website CRO audit', 'Tactical steps to scale up'],
    stats: [],
    source: null,
    award: [],
    cta: 'Start My 5-Minute Audit',
    small: 'Free. No obligation. Yours to keep, whatever you do next.',
    visual: 'tiles',
    trimmedFrom: {},
  },
  {
    id: 'paid-search',
    name: 'Paid search',
    sourceUrl: 'https://oneagency.com/orlando-ppc-agency/',
    eyebrow: 'Paid search',
    headline: 'Leads, not clicks',
    accent: 0,
    quote: false,
    attribution: null,
    sub: null,
    list: ['Wasted spend, quantified in dollars per month', 'Your cost per lead by campaign and by device', 'Which search terms are burning budget', 'The three changes worth making first'],
    stats: [],
    source: null,
    award: [],
    cta: 'Get your complimentary PPC audit',
    small: null,
    visual: 'search-card',
    trimmedFrom: { headline: 'The Orlando PPC agency that optimizes for leads, not clicks' },
  },
  {
    id: 'paid-social',
    name: 'Paid social',
    sourceUrl: 'https://oneagency.com/orlando-social-media-advertising/',
    eyebrow: null,
    headline: 'Search captures demand. Paid social creates it',
    accent: 5,
    quote: false,
    attribution: null,
    sub: null,
    list: [],
    stats: [
      { value: '522', label: 'cruise-sale leads in 23 days', source: 'Cruise Planners' },
      { value: '6%+', label: 'click-through rate on Meta', source: 'Millard Plastic Surgery' },
    ],
    source: null,
    award: [],
    cta: 'Get your complimentary paid social audit',
    small: null,
    visual: 'profile-stack',
    trimmedFrom: {},
  },
  {
    id: 'local-seo',
    name: 'Local SEO',
    sourceUrl: 'https://oneagency.com/orlando-seo-company/',
    eyebrow: 'Local SEO',
    headline: 'Revenue, not rankings',
    accent: 0,
    quote: false,
    attribution: null,
    sub: null,
    list: [],
    stats: [
      { value: '8 of 18', label: "tracked keywords in Google's map pack" },
      { value: '2.3x', label: 'homepage impressions' },
    ],
    source: 'Boccia, June 2026',
    award: [],
    cta: 'Get your complimentary SEO audit',
    small: null,
    visual: 'map-pack',
    trimmedFrom: { headline: 'The Orlando SEO company for brands that need revenue, not rankings' },
  },
  {
    id: 'web-design',
    name: 'Web design',
    sourceUrl: 'https://oneagency.com/orlando-web-design/',
    eyebrow: 'Web design',
    headline: 'Builds for conversion, not applause',
    accent: 2,
    quote: false,
    attribution: null,
    sub: 'A beautiful site that loads slowly and buries the phone number is an expensive brochure.',
    list: [],
    stats: [],
    source: null,
    award: [],
    cta: 'Get your complimentary site audit',
    small: null,
    visual: 'site-stream',
    trimmedFrom: { headline: 'An Orlando web design company that builds for conversion, not applause' },
  },
  {
    id: 'technology',
    name: 'Our technology',
    sourceUrl: 'https://oneagency.com/software-development-integration/',
    eyebrow: 'Our technology',
    headline: 'Most agencies buy you traffic. We built the system that converts it.',
    accent: 10,
    quote: false,
    attribution: null,
    sub: null,
    list: [],
    stats: [
      {
        value: '13,618',
        label: 'comments moderated in 30 days by ConversionIQ',
        trimmedFrom: '13,618 comments moderated in 30 days by ConversionIQ on one Facebook page, the work of 10 full-time roles (VacationVIP, May 2025)',
      },
    ],
    source: 'VacationVIP, May 2025',
    award: [],
    cta: 'Talk to us about a build',
    small: null,
    visual: 'lead-stream',
    backdrop: 'mobius',
    mobius: { look: 'energy', crop: { square: 'band-top', portrait: 'band-top', story: 'frame', landscape: 'side' }, shift: { square: { y: 0.38 }, portrait: { y: 0.33 }, story: { y: 0.15 } } },
    trimmedFrom: {
      eyebrow: 'Our technology: Most agencies buy you traffic. We built the system that converts it.',
      headline: 'Our technology: Most agencies buy you traffic. We built the system that converts it.',
    },
  },
  {
    id: 'results',
    name: 'Results',
    sourceUrl: 'https://oneagency.com/',
    eyebrow: null,
    headline: 'Results delivered. In any industry.',
    accent: 1,
    quote: false,
    attribution: null,
    sub: null,
    list: [],
    stats: [
      { value: '10M+', label: 'Qualified leads generated' },
      { value: '$100M+', label: 'Media under management' },
      { value: '7B+', label: 'Brand impressions delivered' },
      { value: '450K+', label: 'E-commerce transactions' },
    ],
    source: null,
    award: [],
    cta: 'Run My Free Audit',
    small: 'Figures as published on oneagency.com, November 2026.',
    visual: 'stat-board',
    backdrop: 'mobius',
    mobius: { look: 'energy', crop: { square: 'band-top', portrait: 'band-top', story: 'frame', landscape: 'side' }, shift: { square: { y: 0.35 }, portrait: { y: 0.33 }, story: { y: 0.12 } } },
    trimmedFrom: {},
  },
  {
    id: 'vacation-ownership',
    name: 'Vacation ownership',
    sourceUrl: 'https://oneagency.com/vacation-ownership/',
    eyebrow: null,
    headline: 'Tours, owners, reviews and revenue.',
    accent: 4,
    quote: false,
    attribution: null,
    sub: null,
    list: [],
    stats: [
      { value: 'Over 80k', label: 'Leads delivered' },
      { value: '22+%', label: 'Website to lead conversion' },
    ],
    source: 'Marriott Vacation Club Grande Vista, Meta, July 2023 to May 2025',
    award: ['Best AI Product', '2026 ARDY Awards', 'Awarded to ConversionIQ.ai'],
    cta: 'Book a strategy call',
    small: null,
    visual: 'award',
    backdrop: 'mobius',
    mobius: { look: 'energy', crop: { square: 'side', portrait: 'band-top', story: 'frame', landscape: 'side' }, shift: { square: { x: 0.12 }, portrait: { y: 0.33 }, story: { y: 0.23 }, landscape: { x: 0.06 } } },
    trimmedFrom: {
      headline: 'Tours, owners, reviews and revenue. One team, one AI, one number.',
      award: '2026 ARDY Awards, American Resort Development Association',
    },
  },
  {
    id: 'testimonial',
    name: 'Testimonial',
    sourceUrl: 'https://oneagency.com/',
    eyebrow: null,
    headline: 'This one page is better than every single one of our competitors.',
    accent: 4,
    quote: true,
    attribution: 'Leadership, Real estate brokerage',
    sub: null,
    list: [],
    stats: [],
    source: null,
    award: [],
    cta: 'Call (689) 205-9923',
    small: null,
    visual: 'quote',
    trimmedFrom: {},
  },
]

export type CreativeFormat = 'square' | 'portrait' | 'story' | 'landscape'

export interface CreativeAdSize {
  format: CreativeFormat
  label: string
  width: number
  height: number
}

export const CREATIVE_AD_SIZES: CreativeAdSize[] = [
  { format: 'square', label: 'Square', width: 1080, height: 1080 },
  { format: 'portrait', label: 'Portrait', width: 1080, height: 1350 },
  { format: 'story', label: 'Story', width: 1080, height: 1920 },
  { format: 'landscape', label: 'Landscape', width: 1200, height: 627 },
]

/** Story safe zone, px at 1080x1920: nothing but ground, glow and texture in the top 220 and bottom 340. */
export const STORY_SAFE = { top: 220, bottom: 340 } as const

/**
 * Ads are laid out in CSS px at half their pixel size (1080 wide is 540) and drawn at 2x, so the kit's glass
 * components keep their own proportions. Type sizes in src/data/ad-styles.ts are px at 1080 wide.
 */
export const CREATIVE_AD_UNIT = 2

export type CreativeAdExt = 'png' | 'webp'

export const creativeAdFile = (concept: CreativeConceptId, size: Pick<CreativeAdSize, 'width' | 'height'>, ext: CreativeAdExt) =>
  `/kit/ads/creative/${concept}/one-agency_ad-${concept}_${size.width}x${size.height}.${ext}`

export const creativeConcept = (id: string) => CREATIVE_CONCEPTS.find((c) => c.id === id) ?? null

export const creativeSize = (format: string) => CREATIVE_AD_SIZES.find((s) => s.format === format) ?? null

/**
 * The transparent Möbius still for a format (energy: clear-dark, strings: clear). Landscape uses the 1200x628 still as a
 * full-bleed cover; the extra pixel row is cropped by the frame.
 */
export const mobiusStill = (mobius: CreativeMobius, format: CreativeFormat) => {
  const { width, height } = CREATIVE_AD_SIZES.find((s) => s.format === format)!
  const size = format === 'landscape' ? '1200x628' : `${width}x${height}`
  const ground = mobius.look === 'energy' ? 'clear-dark' : 'clear'
  return `/kit/elements/mobius/one-agency_element_mobius-${mobius.look}-${mobius.crop[format]}-${ground}_${size}.png`
}
