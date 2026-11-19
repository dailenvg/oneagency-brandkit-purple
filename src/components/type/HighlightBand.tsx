import { CheckCircle } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { GlowGround } from '../../kit/glass/GlowGround'
import { LightStreaks } from '../../kit/glass/LightStreaks'
import { HighlightText } from '../../kit/type/HighlightText'
import { reveal } from '../../lib/motion'
import { CopyButton } from '../ui/CopyButton'
import { Reveal } from '../ui/Reveal'

const RULES = [
  'For some titles only: one highlighted phrase per title, two lines at most. Never on body text.',
  'The demos above recreate the reference ad, which bands two phrases. Your titles band one.',
  'The band sits behind the lower 40% of the words: from just under the baseline to about mid x-height.',
  'It starts about 0.15 em before the first highlighted word and runs about 0.15 em past the last.',
  'When a highlighted fragment starts a line, the band starts flush with its first word.',
  'On dark: the derived blue band with white text. On light: lilac at 40% into paper, with ink text.',
]

const TOKENS = [
  { name: '--kit-highlight', value: 'color-mix(in srgb, var(--lilac) 40%, var(--ground))', label: 'Dark' },
  { name: '--kit-highlight-light', value: 'color-mix(in srgb, var(--lilac) 40%, var(--paper))', label: 'Light' },
]

/** The reference line, rebuilt live: on dark, the violet ground with light streaks; on light, plain paper so the band reads. */
function Demo({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <figure data-theme={theme} className={`relative isolate flex min-h-64 items-center overflow-hidden rounded-site border border-edge px-5 py-12 sm:px-12 ${theme === 'dark' ? 'bg-ground' : 'bg-paper'}`}>
      {theme === 'dark' && (
        <>
          <GlowGround variant="violet" className="-z-10" />
          <LightStreaks className="-z-10" />
        </>
      )}
      <p className="max-w-[12em] text-step-3 leading-display font-bold tracking-tight text-text sm:text-step-4">
        Convert <HighlightText>AI searches</HighlightText> into <HighlightText delay={0.3}>recommendations</HighlightText>
      </p>
      <figcaption className="absolute right-4 bottom-3 text-step-small text-text-2">{theme === 'dark' ? 'Reference recreated, on dark' : 'Reference recreated, on light'}</figcaption>
    </figure>
  )
}

/** Highlight band: rules, the reference rebuilt on dark and light, and the two derived tokens. */
export function HighlightBand() {
  return (
    <div className="flex flex-col gap-8">
      <Reveal className="flex flex-col gap-4">
        <Demo theme="dark" />
        <Demo theme="light" />
      </Reveal>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Reveal as="ul" stagger className="flex flex-col gap-3">
          {RULES.map((r) => (
            <motion.li key={r} variants={reveal} className="flex gap-3 text-step-0 text-text-2">
              <CheckCircle className="mt-1 size-5 shrink-0 text-accent" aria-hidden />
              {r}
            </motion.li>
          ))}
        </Reveal>
        <div className="flex flex-col gap-3">
          {TOKENS.map((t) => (
            <div key={t.name} className="flex flex-col gap-1.5 rounded-site border border-edge bg-surface p-4">
              <p className="flex items-center gap-3 font-code text-step--1 font-semibold text-text">
                <span aria-hidden data-theme={t.label === 'Dark' ? 'dark' : 'light'} className="size-6 shrink-0 rounded-full border border-edge" style={{ background: `var(${t.name})` }} />
                {t.name}
              </p>
              <CopyButton value={`var(${t.name})`} description={`CSS variable ${t.name}`} />
              <CopyButton value={t.value} label={t.value} description={`CSS value of ${t.name}`} />
            </div>
          ))}
          <p className="text-step-small text-text-3">Derived, not on the live site. Sampled from the reference band (#172C78 to #11306A).</p>
        </div>
      </div>
    </div>
  )
}
