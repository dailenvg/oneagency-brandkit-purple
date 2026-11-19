import { motion } from 'motion/react'
import { AD_CONCEPTS } from '../../data/ad-copy'
import { pop, sequence, stagger, viewport } from '../../lib/motion'

const PROOF = AD_CONCEPTS.find((c) => c.id === 'proof')!

/**
 * The live stat band: Lato numbers in the gradient, white labels, gradient dividers (--stat-divider, or -h when
 * stacked), and the source line directly underneath. Stats pop in left to right.
 */
export function StatBar() {
  return (
    <figure className="rounded-site bg-void px-4 py-8 sm:px-8">
      <motion.ul className="grid grid-cols-2 gap-y-7 lg:grid-cols-4" variants={sequence(stagger.children)} initial="hidden" whileInView="show" viewport={viewport}>
        {PROOF.stats.map((s, i) => (
          <motion.li
            key={s.value}
            variants={pop}
            className={`relative flex flex-col items-center gap-1 px-3 text-center ${i % 2 ? 'stat-divided' : ''} ${i ? 'lg:stat-divided' : ''}`}
          >
            <span className="stat-num text-step-num">{s.value}</span>
            <span className="text-step--1 text-text text-balance">{s.label}</span>
          </motion.li>
        ))}
      </motion.ul>
      <figcaption className="mt-7 text-center text-step-small text-text-2">{PROOF.legal}</figcaption>
    </figure>
  )
}
