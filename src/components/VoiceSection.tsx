import { Prohibit } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { BANNED, HEADLINE_PATTERNS, PILLARS, RULES, TRAITS } from '../data/voice'
import { reveal } from '../lib/motion'
import { Section } from './layout/Section'
import { SubHeading } from './layout/SubHeading'
import { Badge } from './ui/Badge'
import { Reveal } from './ui/Reveal'
import { SourceNote } from './ui/SourceNote'

/** Voice: pillars, traits, rules, banned words and headline patterns, from the source pack only. */
export function VoiceSection() {
  return (
    <Section
      id="voice"
      eyebrow="Voice"
      title="Straight, specific, operator-minded"
      accent={[1]}
      lede="Lead with the buyer's outcome. Say what we do after the lead, and put a date on every number."
    >
      <div className="flex flex-col gap-section">
        <div>
          <SubHeading title="Four pillars" badge={<Badge>Proposed</Badge>} />
          <Reveal as="ol" stagger className="grid gap-4 md:grid-cols-2">
            {PILLARS.map((p, i) => (
              <motion.li key={p.title} variants={reveal} className="flex flex-col gap-3 rounded-site border border-edge bg-surface p-6">
                <span className="stat-num text-step-num">0{i + 1}</span>
                <h3 className="text-step-2 font-bold tracking-tight">{p.title}</h3>
                <p className="text-step--1 text-text-2">{p.body}</p>
              </motion.li>
            ))}
          </Reveal>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SubHeading title="Voice traits" />
            <Reveal as="ul" stagger className="flex flex-wrap gap-2">
              {TRAITS.map((t) => (
                <motion.li key={t} variants={reveal} className="rounded-full border border-edge-strong/60 px-4 py-2 font-semibold text-text">
                  {t}
                </motion.li>
              ))}
            </Reveal>
            <Reveal as="ul" stagger className="mt-8 flex flex-col gap-3">
              {RULES.map((r) => (
                <motion.li key={r} variants={reveal} className="flex gap-3 text-step-0 text-text-2">
                  <span aria-hidden className="mt-2.5 h-0.5 w-4 shrink-0 rounded-full" style={{ background: 'var(--bar)' }} />
                  {r}
                </motion.li>
              ))}
            </Reveal>
          </div>
          <div>
            <SubHeading title="Words we never use" />
            <Reveal as="ul" stagger className="flex flex-wrap gap-2">
              {BANNED.map((b) => (
                <motion.li key={b.word} variants={reveal} className="inline-flex items-center gap-2 rounded-full border border-dont/40 bg-surface px-4 py-2">
                  <Prohibit className="size-4 shrink-0 text-dont" aria-hidden />
                  <span className="font-semibold text-text line-through decoration-dont/70">{b.word}</span>
                  {b.note && <span className="text-step-small text-text-3">{b.note}</span>}
                </motion.li>
              ))}
            </Reveal>
          </div>
        </div>

        <div>
          <SubHeading title="Headline patterns">Patterns that recur across the live site and the positioning work, with the real lines.</SubHeading>
          <Reveal stagger className="grid gap-4 md:grid-cols-2">
            {HEADLINE_PATTERNS.map((p) => (
              <motion.article key={p.pattern} variants={reveal} className="flex flex-col gap-4 rounded-site border border-edge bg-surface p-6">
                <header>
                  <h3 className="font-code text-step--1 font-semibold text-accent">{p.pattern}</h3>
                  <p className="mt-1 text-step-small text-text-3">{p.source}</p>
                </header>
                <ul className="flex flex-col gap-2">
                  {p.examples.map((e) => (
                    <li key={e} className="text-step-1 font-semibold text-text">
                      {e}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </Reveal>
        </div>

        <SourceNote>
          Every line here comes from the source pack: Positioning v4, Creative Direction v2.1 and the live site. The pillars and the Positioning v4 headlines are
          proposed and not yet signed off. Get sign-off before you use them in public.
        </SourceNote>
      </div>
    </Section>
  )
}
