/**
 * Copy bank. Every line is lifted verbatim from the source pack (live site copy, Positioning v4, Creative Direction
 * v2.1, the film); nothing here is new copy. Writer owns this file. scripts/build-copy.mjs exports it to
 * public/kit/copy/one-agency_copy-bank.{md,json}, so keep it import-free.
 */

export type CopyGroup = 'headline' | 'tagline' | 'cta' | 'proof' | 'legal'

export interface CopyLine {
  id: string
  group: CopyGroup
  text: string
  /** Where the line comes from. */
  source: string
  /** When the source was published or snapshotted. */
  date: string
  /** Status or usage note shown under the line. */
  note?: string
}

export const COPY_GROUPS: { id: CopyGroup; label: string }[] = [
  { id: 'headline', label: 'Headlines' },
  { id: 'tagline', label: 'Taglines' },
  { id: 'cta', label: 'CTAs' },
  { id: 'proof', label: 'Proof points' },
  { id: 'legal', label: 'Legal and disclaimers' },
]

const LIVE = 'oneagency.com'
const LIVE_DATE = 'November 2026'
const PUBLISHED = 'As published on oneagency.com, November 2026.'
const SITE_FIGURE = `${PUBLISHED} No internal source on file, so always run it with this line.`
const PROPOSED = 'Proposed, pending client test.'
const POSITIONING = 'Positioning v4 (brand doc)'
const POSITIONING_DATE = 'October 2026'
const FILM = 'Film: The Free Business Audit'
/** The film carries no date of its own; this is when it entered the source pack. */
const FILM_DATE = 'Undated; source pack 2026-11-17'

export const COPY: CopyLine[] = [
  { id: 'h-lead', group: 'headline', text: "We don't stop at the lead.", source: POSITIONING, date: POSITIONING_DATE, note: `${PROPOSED} Homepage headline.` },
  {
    id: 'h-units',
    group: 'headline',
    text: 'Measured in tours, bookings, patients and enrollments. Not leads.',
    source: POSITIONING,
    date: POSITIONING_DATE,
    note: `${PROPOSED} Alternate homepage headline, from buyer language. On vertical pages, use one unit per page.`,
  },
  {
    id: 'h-ai-sales-force',
    group: 'headline',
    text: 'The acquisition agency with its own AI sales force.',
    source: POSITIONING,
    date: POSITIONING_DATE,
    note: 'Proposed. Use in decks and paid media.',
  },
  { id: 'h-holes', group: 'headline', text: 'Find and close the holes in your business', source: LIVE, date: LIVE_DATE, note: 'Sample ad A. Accent word: holes.' },
  { id: 'h-results', group: 'headline', text: 'Results delivered. In any industry.', source: LIVE, date: LIVE_DATE, note: 'Sample ad B. Accent word: any.' },
  {
    id: 'h-award',
    group: 'headline',
    text: 'Best AI Product',
    source: LIVE,
    date: LIVE_DATE,
    note: 'Sample ad C. The award belongs to ConversionIQ.ai: always run it with "Awarded to ConversionIQ.ai".',
  },
  { id: 'h-eight', group: 'headline', text: 'Eight services, one accountable team', source: LIVE, date: LIVE_DATE },
  { id: 'h-converts', group: 'headline', text: 'Most agencies buy you traffic. We built the system that converts it.', source: LIVE, date: LIVE_DATE },
  { id: 'h-leaking', group: 'headline', text: 'Not sure which channel is leaking budget?', source: LIVE, date: LIVE_DATE },
  {
    id: 'h-convert',
    group: 'headline',
    text: 'Convert visitors into leads, leads into customers, ad spend into revenue, AI searches into recommendations, and 5 minutes into your growth plan',
    source: LIVE,
    date: LIVE_DATE,
    note: 'Hero sequence. Each "Convert X into Y" pair also works alone; in headlines, prefer the pairs without "growth".',
  },

  { id: 't-cracks', group: 'tagline', text: 'Nothing falls between the cracks.', source: POSITIONING, date: POSITIONING_DATE, note: `${PROPOSED} Brand-line candidate 1 of 3.` },
  { id: 't-inquiry', group: 'tagline', text: 'No inquiry goes unanswered.', source: POSITIONING, date: POSITIONING_DATE, note: `${PROPOSED} Brand-line candidate 2 of 3.` },
  {
    id: 't-click',
    group: 'tagline',
    text: 'From first click to closed sale. No leaks, no handoffs.',
    source: POSITIONING,
    date: POSITIONING_DATE,
    note: `${PROPOSED} Brand-line candidate 3 of 3.`,
  },
  { id: 't-yours', group: 'tagline', text: 'Results in 5 minutes. Yours to keep.', source: LIVE, date: LIVE_DATE },
  { id: 't-ready', group: 'tagline', text: 'Free AI Growth Audit · Ready for you in 5 minutes', source: LIVE, date: LIVE_DATE },
  { id: 't-pays', group: 'tagline', text: 'Marketing that pays for itself.', source: FILM, date: FILM_DATE },
  { id: 't-free', group: 'tagline', text: 'Free. Customized. Yours to keep.', source: FILM, date: FILM_DATE },

  { id: 'c-audit', group: 'cta', text: 'Start My 5-Minute Audit', source: LIVE, date: LIVE_DATE },
  { id: 'c-free', group: 'cta', text: 'Run My Free Audit', source: LIVE, date: LIVE_DATE },
  { id: 'c-talk', group: 'cta', text: 'Talk to ONE Agency', source: 'Sample ad C, approved 2026-11-17', date: '2026-11-17' },
  { id: 'c-growth', group: 'cta', text: 'Run the growth audit', source: LIVE, date: LIVE_DATE },
  { id: 'c-chattibiz', group: 'cta', text: 'Run my ChattiBiz Growth Audit', source: LIVE, date: LIVE_DATE },
  { id: 'c-contact', group: 'cta', text: 'Contact ONE Agency', source: LIVE, date: LIVE_DATE },
  { id: 'c-call', group: 'cta', text: 'Call (689) 205-9923', source: LIVE, date: LIVE_DATE },

  { id: 'p-leads', group: 'proof', text: '10M+ Qualified leads generated', source: LIVE, date: LIVE_DATE, note: SITE_FIGURE },
  { id: 'p-media', group: 'proof', text: '$100M+ Media under management', source: LIVE, date: LIVE_DATE, note: SITE_FIGURE },
  { id: 'p-impressions', group: 'proof', text: '7B+ Brand impressions delivered', source: LIVE, date: LIVE_DATE, note: SITE_FIGURE },
  { id: 'p-ecom', group: 'proof', text: '450K+ E-commerce transactions', source: LIVE, date: LIVE_DATE, note: SITE_FIGURE },
  { id: 'p-marriott', group: 'proof', text: 'Over 80k leads delivered · Marriott Vacation Club Grande Vista', source: LIVE, date: LIVE_DATE, note: PUBLISHED },
  { id: 'p-cruise', group: 'proof', text: '522 cruise-sale leads in 23 days · Cruise Planners', source: LIVE, date: LIVE_DATE, note: PUBLISHED },
  { id: 'p-gymguyz', group: 'proof', text: '335 franchise-development leads · GYMGUYZ', source: LIVE, date: LIVE_DATE, note: PUBLISHED },
  { id: 'p-millard', group: 'proof', text: '6%+ click-through rate on Meta · Millard Plastic Surgery', source: LIVE, date: LIVE_DATE, note: PUBLISHED },
  { id: 'p-smokehouse', group: 'proof', text: '$9,000+ in one day from one email · Country Smokehouse', source: LIVE, date: LIVE_DATE, note: PUBLISHED },
  {
    id: 'p-gurus',
    group: 'proof',
    text: 'Vacation Gurus: net cost per acquisition $125 to $104, April to May 2026.',
    source: 'Proof set, Positioning v4',
    date: 'April 2026 vs May 1 to 19, 2026',
    note: 'Measured. Lead with net CPA, not the +61% revenue line.',
  },
  {
    id: 'p-sharelife',
    group: 'proof',
    text: 'Sharelife: 2,342 leads at $2.16 blended cost per lead in 58 days.',
    source: 'Proof set, Positioning v4',
    date: 'January to March 2026',
    note: 'Measured. Label as leads.',
  },
  {
    id: 'p-boccia',
    group: 'proof',
    text: 'Boccia: AI answers recommending Boccia rose from 24% to 30%; in Queens from 4% to 17%.',
    source: 'Proof set, Positioning v4',
    date: 'September 2026 vs July baseline',
    note: 'Measured. Reconcile with the site set before publishing; use one window, dated.',
  },
  {
    id: 'p-cookshack',
    group: 'proof',
    text: "Cookshack: 22 of 62 event attendees from ONE's enriched list, in the client's words.",
    source: 'Proof set, Positioning v4',
    date: 'Anaheim event, May 2026',
    note: 'Client-reported, an estimate ("I think 22"). Attendance, not sales. Label it client-reported.',
  },

  { id: 'l-figures', group: 'legal', text: 'Figures as published on oneagency.com, November 2026.', source: 'Sample ad B, approved 2026-11-17', date: '2026-11-17' },
  { id: 'l-award', group: 'legal', text: 'Awarded to ConversionIQ.ai', source: LIVE, date: LIVE_DATE, note: 'Required wherever the award appears.' },
  {
    id: 'l-ardy',
    group: 'legal',
    text: 'Best AI Product · 2026 ARDY Awards, American Resort Development Association · Awarded to ConversionIQ.ai',
    source: LIVE,
    date: LIVE_DATE,
  },
  { id: 'l-powered', group: 'legal', text: 'Powered by ChattiBiz AI.', source: LIVE, date: LIVE_DATE },
  { id: 'l-sister', group: 'legal', text: 'ConversionIQ.ai is our sister company: same founders, separate company.', source: LIVE, date: LIVE_DATE },
  {
    id: 'l-soc2',
    group: 'legal',
    text: 'ConversionIQ.ai, the AI platform we deploy, is SOC 2 Type II certified and GDPR compliant.',
    source: LIVE,
    date: LIVE_DATE,
    note: 'The certification belongs to the platform, not to ONE Agency as an agency.',
  },
  { id: 'l-copyright', group: 'legal', text: '© 2026 ONE Agency, LLC. All rights reserved.', source: LIVE, date: LIVE_DATE },
  { id: 'l-contact', group: 'legal', text: '(689) 205-9923 · oneagency.com', source: 'Sample ad C, approved 2026-11-17', date: '2026-11-17' },
]
