/**
 * Voice: source-pack text only (Positioning v4 voice and pillars, Creative Direction v2.1, the live site). Writer pass
 * done 2026-11-17. The pillars and the Positioning v4 headline lines are Proposed in the source.
 */

export interface Pillar {
  title: string
  body: string
}

export const PILLARS: Pillar[] = [
  {
    title: 'Operators, not observers.',
    body: 'Our founders ran and sold companies in the industries we market for, and still run their own funnels with their own money. We argue about contribution margin, not reach.',
  },
  {
    title: 'Creative that sells.',
    body: 'The work clients call "better than every single one of our competitors," judged by what it does to cost per tour, per booking, per patient, per enrollment.',
  },
  {
    title: 'We answer the lead.',
    body: 'Every comment, chat, call and form answered in seconds, in 91 languages, through our own AI sales force, then handed to your team warm.',
  },
  {
    title: 'Numbers with a date on them.',
    body: 'Every result we publish names the client, the period and the method, and says whether we measured it or the client told us.',
  },
]

export const TRAITS = ['Straight', 'Specific', 'Operator-minded', 'Confident', 'Warm'] as const

export const RULES: string[] = [
  "Lead with the buyer's outcome.",
  'Say what we do after the lead and what stays theirs.',
  'Numbers carry a date and a method.',
  'Never describe ONE by what it is not.',
  'Write the way clients talk: plain words, like "you guys" and "the team".',
  'No em-dashes. Use a comma, a colon or a new sentence.',
]

export interface BannedWord {
  word: string
  note?: string
}

export const BANNED: BannedWord[] = [
  { word: 'full-service' },
  { word: 'data-driven' },
  { word: '360' },
  { word: 'synergy' },
  { word: 'cutting-edge' },
  { word: 'growth', note: 'as a headline word' },
  { word: 'AI', note: 'as the reason to hire us' },
  { word: 'fastest' },
  { word: 'guaranteed' },
  { word: 'fully autonomous' },
  { word: 'Chatty', note: 'spoken, not written; the written product name is ChattiBiz' },
]

export interface HeadlinePattern {
  pattern: string
  examples: string[]
  source: string
}

export const HEADLINE_PATTERNS: HeadlinePattern[] = [
  {
    pattern: 'Convert [what they have] into [what they want]',
    examples: ['Convert visitors into leads', 'Convert ad spend into revenue', 'Convert 5 minutes into your growth plan'],
    source: 'Live site hero',
  },
  {
    pattern: 'Measured in [their unit].',
    examples: ['Measured in bookings.', 'Every inquiry answered. Measured in enrollments.', 'Measured in tours, bookings, patients and enrollments. Not leads.'],
    source: 'Positioning v4, vertical units (proposed)',
  },
  {
    pattern: 'Claim. Then the proof, with one accent word.',
    examples: ['Results delivered. In any industry.', 'Find and close the holes in your business'],
    source: 'Live site, sample ads A and B',
  },
  {
    pattern: 'What we do after the lead',
    examples: ["We don't stop at the lead.", 'Qualified tours that show. Every lead answered before it cools.', 'Every call answered. Compliant by design.'],
    source: 'Positioning v4 (proposed, pending client test)',
  },
]
