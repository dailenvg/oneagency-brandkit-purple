import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { WordRise } from '../../kit/motion/WordRise'
import { reveal, viewport } from '../../lib/motion'
import { viewIndex, type ViewId } from '../../lib/views'
import { SectionViewContext, useFocusTitleOnNavigate } from './view-focus'

interface SectionProps {
  id: ViewId
  eyebrow: string
  title: string
  /** Word indices of the title set as accent words. */
  accent?: number[]
  /** First and last word index of the title's highlighted phrase (a few views only). */
  highlight?: readonly [number, number]
  lede?: ReactNode
  /** Right-hand header slot: downloads, toggles. */
  actions?: ReactNode
  children: ReactNode
}

/**
 * View shell: numbered eyebrow, word-rise h1, lede and actions, then content. After a navigation the h1 takes focus,
 * so screen readers start at the new view's title.
 */
export function Section({ id, eyebrow, title, accent, highlight, lede, actions, children }: SectionProps) {
  const headingId = `${id}-title`
  useFocusTitleOnNavigate(headingId)

  return (
    <section id={id} aria-labelledby={headingId} className="relative pt-12 pb-section lg:pt-16">
      <div className="container-site">
        <header className="mb-10 flex flex-col gap-6 lg:mb-14 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <motion.p className="eyebrow mb-4" variants={reveal} initial="hidden" animate="show">
              <span className="font-num text-text-3">{viewIndex(id)}</span> · {eyebrow}
            </motion.p>
            <WordRise
              as="h1"
              id={headingId}
              focusTarget
              inView={false}
              text={title}
              accent={accent}
              highlight={highlight}
              className="text-step-4 font-bold leading-display tracking-tight text-balance outline-none"
            />
            {lede && (
              <motion.div className="mt-5 max-w-2xl text-step-1 leading-relaxed text-text-2" variants={reveal} initial="hidden" animate="show">
                {lede}
              </motion.div>
            )}
          </div>
          {actions && (
            <motion.div className="flex shrink-0 flex-wrap gap-3" variants={reveal} initial="hidden" whileInView="show" viewport={viewport}>
              {actions}
            </motion.div>
          )}
        </header>
        <SectionViewContext.Provider value={id}>{children}</SectionViewContext.Provider>
      </div>
    </section>
  )
}
