/**
 * Sample-ad copy, Creative Director approved (source pack, 2026-11-17). Verbatim: the static ads, the animated ads
 * (scripts/build-motion-ads.mjs imports this file) and the site all read it from here. Import-free on purpose.
 */

export interface AdStat {
  value: string
  label: string
}

export interface AdConcept {
  id: 'audit' | 'proof' | 'award'
  letter: 'A' | 'B' | 'C'
  name: string
  source: string
  eyebrow: string | null
  headline: string
  /** Word index in `headline` set as the accent word (Metal, signature gradient). */
  accent: number
  sub: string | null
  attribution: string | null
  stats: AdStat[]
  cta: string
  small: string | null
  legal: string | null
}

export const AD_CONCEPTS: AdConcept[] = [
  {
    id: 'audit',
    letter: 'A',
    name: 'Growth Audit offer',
    source: 'Live site (oneagency.com)',
    eyebrow: 'Free AI Growth Audit',
    headline: 'Find and close the holes in your business',
    accent: 4,
    sub: 'Results in 5 minutes. Yours to keep.',
    attribution: null,
    stats: [],
    cta: 'Start My 5-Minute Audit',
    small: 'Powered by ChattiBiz AI.',
    legal: null,
  },
  {
    id: 'proof',
    letter: 'B',
    name: 'Proof ad',
    source: 'Live site stat bar',
    eyebrow: null,
    headline: 'Results delivered. In any industry.',
    accent: 3,
    sub: null,
    attribution: null,
    stats: [
      { value: '10M+', label: 'Qualified leads generated' },
      { value: '$100M+', label: 'Media under management' },
      { value: '7B+', label: 'Brand impressions delivered' },
      { value: '450K+', label: 'E-commerce transactions' },
    ],
    cta: 'Run My Free Audit',
    small: null,
    legal: 'Figures as published on oneagency.com, November 2026.',
  },
  {
    id: 'award',
    letter: 'C',
    name: 'Award ad',
    source: 'Live site award banner and guardrail',
    eyebrow: 'Winner',
    headline: 'Best AI Product',
    accent: 1,
    sub: '2026 ARDY Awards, American Resort Development Association',
    attribution: 'Awarded to ConversionIQ.ai',
    stats: [],
    cta: 'Talk to ONE Agency',
    small: '(689) 205-9923 · oneagency.com',
    legal: null,
  },
]

/** Placeholder copy for empty templates. */
export const TEMPLATE_PLACEHOLDER = {
  eyebrow: 'Eyebrow, 3 words max',
  headline: 'Headline in two short lines',
  sub: "One supporting line with the buyer's outcome.",
  cta: 'Call to action',
  legal: 'Legal or source line, with a date.',
} as const
