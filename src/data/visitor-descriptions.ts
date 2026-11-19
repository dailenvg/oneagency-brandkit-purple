import type { AdItem } from '../lib/ads'
import type { GlassItem } from '../lib/glass'

/**
 * What visitors read under Magnific files: what each one shows and where to use it. The manifests' own `notes` are
 * production notes (takes, build steps, plan terms) and are not shown. A subject missing here shows no description.
 */

/** Glass illustrations and textures, by manifest `subject`. */
const GLASS: Record<string, string> = {
  magnifier: 'A glass tile with a silver magnifying glass. Use it for AI search visibility offers.',
  'seo-document': 'A glass page of text lines under a silver magnifier. Use it for SEO audits and content offers.',
  'review-star': 'A smoked glass star with a rose rim light. Use it for reviews and reputation offers.',
  'cro-window': 'A glass browser window with a rose button and a cursor. Use it for website and conversion offers.',
  'growth-stairs': 'A glass staircase with a rose arrow climbing it. Use it for plans and next steps.',
  'profile-stack': 'Three glass profile cards stacked in depth, with a rose check badge. Use it for leads and customers.',
  'toggle-check': 'A glass toggle switched on, with a rose check, in violet-to-blue light. Use it on its own to show a result.',
  'lead-flow': 'A particle stream flowing into a glass browser window, with lead cards flying out. Use it for turning visitors into leads.',
  'halftone-arc': 'An arc of rose halftone dots that shrink toward its edges. Place it behind a glass object, clear of text.',
  'particle-stream': 'A wave of fine dots and lines, white to rose. Use it on dark grounds to lead the eye to the object.',
  grain: 'A fine grain tile. Repeat it over a whole layout at low opacity, and lower still on light grounds.',
  'rose-underglow': 'A soft pool of rose light. Place it on the ground under a glass object.',
  'violet-streaks': 'A violet-to-blue ground with rose and blue light streaks and bokeh. Use it for the violet variant.',
  'ground-rose-glow': 'A near-black ground with a low rose glow. Use it as the base of an ad.',
}

/** Starter-library images, by the subject in their id (image-[subject]-[size]). */
const IMAGERY: Record<string, string> = {
  'resort-guests': 'A couple with a suitcase arriving at a resort pool at sunset. For vacation ownership and travel.',
  'cruise-booking': 'A couple at their kitchen table planning a cruise with a tablet and a brochure. For hotels and cruises.',
  'sales-agent': 'A smiling sales agent on a headset, answering a lead. For call centres and sales teams.',
  'franchise-owner': 'A gym owner standing in the doorway of her studio at dawn. For franchise development.',
  'healthcare-front-desk': 'A receptionist at a front desk greeting a patient. For healthcare practices.',
  admissions: 'An admissions adviser talking with a student and her father on a campus bench. For higher education.',
  'orlando-night': 'A city skyline at night in navy, rose and blue light, reflected in a lake. For backgrounds and headers.',
  'small-business-owner': 'A barbecue shop owner taking an order by phone. For small businesses.',
}

/** Sample ads, by concept. */
const SAMPLES: Record<string, string> = {
  'growth-audit': 'Concept A: the Free AI Growth Audit offer, with copy from the live site.',
  proof: 'Concept B: the proof ad. Figures as published on oneagency.com, November 2026, with the legal line on every size.',
  award: 'Concept C: the award ad. The award belongs to ConversionIQ.ai, and every size says so.',
}

const TEMPLATE = 'Placeholder copy. Open it in Magnific to write your own.'
const CAROUSEL = 'One of five carousel cards; the gradient line runs across all five. Placeholder copy: open it in Magnific to write your own.'

export const glassDescription = (item: GlassItem) => (item.subject ? GLASS[item.subject] : undefined) ?? null

export function adDescription(item: AdItem): string | null {
  if (item.group === 'sample') return (item.concept ? SAMPLES[item.concept] : undefined) ?? null
  if (item.group === 'template') return item.channel === 'carousel' ? CAROUSEL : TEMPLATE
  const subject = item.id.replace(/^image-/, '').replace(/-(master|\d+x\d+)$/, '')
  return IMAGERY[subject] ?? null
}
