import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { reveal, sequence, stagger, viewport } from '../../lib/motion'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Stagger direct motion children that use the `reveal` variants. */
  stagger?: boolean
  as?: 'div' | 'ul' | 'ol'
  id?: string
}

const TAGS = { div: motion.div, ul: motion.ul, ol: motion.ol } as const

/**
 * Scroll reveal: plays once when the block enters view. With `stagger`, it orchestrates children (motion elements with
 * `variants={reveal}`) one after another.
 */
export function Reveal({ children, className, stagger: staggered = false, as = 'div', id }: RevealProps) {
  const Tag = TAGS[as]
  return (
    <Tag id={id} className={className} variants={staggered ? sequence(stagger.children) : reveal} initial="hidden" whileInView="show" viewport={viewport}>
      {children}
    </Tag>
  )
}
