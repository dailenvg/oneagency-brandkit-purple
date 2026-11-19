import { motion } from 'motion/react'
import { MIN_SIZES } from '../../data/logo-rules'
import { LOGOS } from '../../data/logos'
import { reveal } from '../../lib/motion'
import { Reveal } from '../ui/Reveal'

/** Each lockup drawn at its minimum width, at true pixel size. */
export function MinimumSizes() {
  return (
    <Reveal as="ul" stagger className="@container grid gap-4">
      {MIN_SIZES.map((size) => {
        const logo = LOGOS.find((l) => l.lockup === size.lockup && l.variant === 'on-dark')!
        return (
          <motion.li key={size.lockup} variants={reveal} className="flex min-w-0 flex-col gap-4 rounded-site border border-edge bg-surface p-5 @xl:flex-row @xl:items-center">
            <div data-theme="dark" className="scroll-strip flex min-h-28 shrink-0 items-center @xl:w-80 justify-center-safe overflow-x-auto rounded-site-sm bg-ground p-4">
              <img src={logo.svg.url} alt={`${size.label} at ${size.px} px wide`} width={size.px} style={{ width: size.px }} className="h-auto max-w-none" loading="lazy" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-text">{size.label}</span>
                <span className="font-num text-step-1 text-accent">{size.px} px</span>
              </p>
              <p className="mt-1 text-step-small text-text-3">{size.why}</p>
            </div>
          </motion.li>
        )
      })}
    </Reveal>
  )
}
