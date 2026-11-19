import { ArrowRight, Pause, Play } from '@phosphor-icons/react'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { GradientBar } from '../../kit/motion/GradientBar'
import { Pop } from '../../kit/motion/Pop'
import { WordRise } from '../../kit/motion/WordRise'
import { KIT } from '../../lib/kit'
import { brandIntro, distance, duration, overshoot, press, reveal, sequence, stagger } from '../../lib/motion'
import { viewHref, viewIndex } from '../../lib/views'
import { BrandLogo } from '../layout/BrandLogo'
import { useFocusTitleOnNavigate } from '../layout/view-focus'
import { ButtonLink } from '../ui/ButtonLink'
import { FullKitButton } from '../ui/FullKitButton'
import { MobiusLoop } from './MobiusLoop'

const TITLE_ID = 'overview-title'
const HEADLINE = 'The ONE Agency brand kit'
/** Cue for the copy under the headline: once the headline words have landed. */
const AFTER_HEADLINE = brandIntro.line + HEADLINE.split(' ').length * stagger.word + duration.move / 2

/**
 * Overview hero: the film's brand intro on the left (logo scale-in, bar, word rise), the Möbius loop behind on the
 * right, with a scrim between them so the text keeps its contrast.
 */
export function OverviewHero() {
  const reduced = useReducedMotion()
  const [loop, setLoop] = useState<'loading' | 'ready' | 'error'>('loading')
  const [paused, setPaused] = useState(false)
  useFocusTitleOnNavigate(TITLE_ID)

  return (
    <section aria-labelledby={TITLE_ID} className="relative isolate overflow-hidden border-b border-edge-soft">
      <div aria-hidden className="ui-glow-field absolute inset-0 -z-30" />
      <MobiusLoop className="absolute inset-0 -z-20" onStatus={setLoop} paused={paused} />
      <div aria-hidden className="hero-scrim absolute inset-0 -z-10" />
      <div className="container-site flex min-h-[clamp(520px,74svh,760px)] flex-col items-start justify-center gap-6 py-16">
        <Pop inView={false} delay={brandIntro.logo} from={distance.logoFrom} blur={distance.logoBlur} length={duration.logo} bounce={overshoot.logo}>
          <BrandLogo lockup="stacked" eager className="block h-auto w-[clamp(180px,26vw,320px)]" />
        </Pop>
        <GradientBar inView={false} delay={brandIntro.bar} className="h-1.5 w-[clamp(96px,10vw,160px)]" />
        <div>
          <p className="eyebrow mb-3">
            <span className="font-num text-text-3">{viewIndex('overview')}</span> · Overview
          </p>
          <WordRise
            as="h1"
            id={TITLE_ID}
            focusTarget
            inView={false}
            delay={brandIntro.line}
            text={HEADLINE}
            accent={[3]}
            className="max-w-3xl text-step-4 font-bold leading-display tracking-tight text-balance outline-none"
          />
        </div>
        <motion.div className="flex max-w-xl flex-col items-start gap-5" variants={reduced ? sequence(0) : sequence(stagger.children, AFTER_HEADLINE)} initial="hidden" animate="show">
          <motion.p variants={reveal} className="font-num text-step--1 tracking-wide text-text-2">
            Brand kit v{KIT.previousVersion} → v{KIT.version} · Updated {KIT.updated}
          </motion.p>
          <motion.p variants={reveal} className="text-step-1 leading-relaxed text-text-2 text-pretty">
            Pick a view from the menu, read its rules, then download single files or the whole kit. Everything here is digital: RGB, px and web fonts.
          </motion.p>
          <motion.div variants={reveal} className="flex flex-col gap-3 self-stretch sm:flex-row sm:flex-wrap sm:self-start">
            <FullKitButton />
            <ButtonLink href={viewHref('logo')} variant="secondary">
              Start with the logo
              <ArrowRight aria-hidden />
            </ButtonLink>
          </motion.div>
          {loop !== 'error' && (
            <motion.p variants={reveal} className="text-step-small text-text-3">
              Möbius loop: ConversionIQ key visual, used as supplied.
            </motion.p>
          )}
        </motion.div>
      </div>
      {/*
       * The loop never ends, so it gets a pause (WCAG 2.2.2), after the hero content in tab order, bottom right over the
       * loop (inside the hero's 64px bottom padding). Under reduced motion the loop already holds still: no control.
       */}
      {loop === 'ready' && !reduced && (
        <motion.button
          type="button"
          aria-pressed={paused}
          aria-label="Pause the Möbius loop"
          title={paused ? 'Play the Möbius loop' : 'Pause the Möbius loop'}
          onClick={() => setPaused((p) => !p)}
          className="absolute right-[var(--spacing-gutter)] bottom-4 grid size-touch place-items-center rounded-full border border-edge-strong bg-surface/70 text-text-2 backdrop-blur-sm transition-colors hover:text-text active:bg-surface-2"
          {...press}
        >
          {paused ? <Play className="size-5" aria-hidden /> : <Pause className="size-5" aria-hidden />}
        </motion.button>
      )}
    </section>
  )
}
