/**
 * The nine reference ads the glass and texture style is codified from. scripts/copy-references.mjs copies the source
 * PNGs into public/kit/references/ and writes a WebP preview for each, so this file stays import-free.
 */

export interface GlassReference {
  /** File name in the source folder (/Users/.../One Agency/Ads). */
  source: string
  slug: string
  title: string
  alt: string
  /** What this ad shows of the style. */
  shows: string
}

export const REFERENCE_SIZE = 1254

export const GLASS_REFERENCES: GlassReference[] = [
  {
    source: 'AI search visibility audit.png',
    slug: 'ai-engines-browser-checklist',
    title: 'AI engines: browser and checklist',
    alt: 'Ad: "Does your business show up in the AI engines?" with a tilted glass browser window, a rose checklist and a rose pill CTA.',
    shows: 'Glass browser window at a slight perspective, halftone arc behind it, checklist in rose glass badges.',
  },
  {
    source: 'Complimentary AI visibility growth audit.png',
    slug: 'ai-engines-profile-stack',
    title: 'AI engines: profile stack',
    alt: 'Ad: "Does your business show up in the AI engines?" with three stacked glass profile cards, the front one carrying a rose check badge.',
    shows: 'Depth stack of three cards, back ones dimmer and blurred; check badge breaking the front card edge.',
  },
  {
    source: 'Complimentary growth audit CTA in 5 minutes-3.png',
    slug: 'ai-engines-icon-tiles-5-minutes',
    title: 'AI engines: icon tiles, in 5 minutes',
    alt: 'Ad: "Does your business show up in the AI engines?" with five glass icon tiles (AI search, SEO, reviews, CRO, tactical steps) and a CTA with an "In 5 minutes" tag.',
    shows: 'Glass icon tiles with a vertical divider and label, in a two-column grid with one full-width tile.',
  },
  {
    source: 'Customer activation glass card.png',
    slug: 'leads-to-customers-profile-stack',
    title: 'Leads into customers: profile stack',
    alt: 'Ad: "Convert leads into customers." with a stacked glass profile card and rose check, and a stat pair: $100M+ in media under management, 10M+ qualified leads generated.',
    shows: 'Left-aligned headline with a rose serif-italic accent word, stat pair with a thin vertical divider.',
  },
  {
    source: 'Five-Part AI Growth Audit Ad.png',
    slug: 'ai-engines-icon-tiles',
    title: 'AI engines: icon tiles',
    alt: 'Ad: "Does your business show up in the AI engines?" with five glass icon tiles and a rose pill CTA, "Get Your Complimentary Growth Audit".',
    shows: 'Centred layout; tiles share one radius and one rim light; halftone arc above the grid.',
  },
  {
    source: 'Glowing website window with profile links.png',
    slug: 'visitors-to-leads-particle-stream',
    title: 'Visitors into leads: particle stream',
    alt: 'Ad: "Convert visitors into leads." with a glowing glass website window, a white-to-rose particle stream flowing in from the left and profile cards flying out to the right.',
    shows: 'Particle stream of fine dots in a wave, white to rose, feeding the glass window.',
  },
  {
    source: 'Growth Audit in 5 Minutes-1.png',
    slug: 'ai-engines-profile-stack-5-minutes',
    title: 'AI engines: profile stack, in 5 minutes',
    alt: 'Ad: "Does your business show up in the AI engines?" with a glass profile stack, a rose checklist and a CTA with an "In 5 minutes" tag.',
    shows: 'Small depth stack tucked into the headline corner; the checklist carries the message.',
  },
  {
    source: 'Growth audit ad with five-minute CTA-2.png',
    slug: 'ai-engines-browser-5-minutes',
    title: 'AI engines: browser, in 5 minutes',
    alt: 'Ad: "Does your business show up in the AI engines?" with a glass browser window on a rose under-glow, a checklist and a CTA with an "In 5 minutes" tag.',
    shows: 'Rose under-glow on the ground beneath the glass object.',
  },
  {
    source: 'Precise One Agency Logo Correction.png',
    slug: 'leads-to-customers-glass-toggle',
    title: 'Leads into customers: glass toggle',
    alt: 'Ad on a violet-to-blue ground: "Convert leads into customers." with a glowing glass toggle switched on with a rose check, light lines flowing through it, and a stat pair.',
    shows: 'The violet-to-blue variant: glass pill toggle, glowing light lines, bokeh.',
  },
]

export const referenceFile = (slug: string) => `/kit/references/one-agency_reference-ad_${slug}_${REFERENCE_SIZE}x${REFERENCE_SIZE}.png`

/** Display preview (not part of the downloads). */
export const REFERENCE_PREVIEW_SIZE = 640

export const referencePreview = (slug: string) => `/previews/references/one-agency_reference-ad_${slug}_${REFERENCE_PREVIEW_SIZE}x${REFERENCE_PREVIEW_SIZE}.webp`
