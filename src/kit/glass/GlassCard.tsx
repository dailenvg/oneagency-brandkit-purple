import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { pressCard, reveal } from '../../lib/motion'

const TAGS = { div: motion.div, article: motion.article, section: motion.section, li: motion.li } as const

interface GlassCardProps {
  children?: ReactNode
  className?: string
  as?: keyof typeof TAGS
  /** Tile radius (icon tiles) or a pill, instead of the card radius. */
  shape?: 'card' | 'tile' | 'pill'
  /** Back layers in a depth stack: 0 (default), 1 or 2. Back layers are smaller, dimmer and blurred. */
  depth?: 0 | 1 | 2
  /** Which way the back layers sit, as the reference stacks recede up and to one side. */
  recede?: 'left' | 'right'
  /** Hover lift and press, for cards that are links or buttons. */
  interactive?: boolean
  style?: CSSProperties
  'aria-labelledby'?: string
}

const SHAPE = { card: '', tile: 'glass-tile', pill: 'glass-pill' } as const

/** Back layer n (1 nearest): offset, scale, opacity and blur from the depth rules. */
function layerStyle(n: 1 | 2, recede: 'left' | 'right'): CSSProperties {
  const dir = recede === 'left' ? -1 : 1
  return {
    transform: `translate(${dir * 18 * n}%, ${-14 * n}%) scale(var(--glass-depth-${n}))`,
    opacity: n === 1 ? 0.55 : 0.3,
    filter: `blur(${n * 1.5}px)`,
  }
}

/**
 * Glass card: translucent fill over a backdrop blur, rose rim light, specular highlight top left, inner glow and a
 * soft drop shadow (src/styles/glass.css). Uses the `reveal` variants, so a staggered parent brings it in.
 */
export function GlassCard({ children, className, as = 'div', shape = 'card', depth = 0, recede = 'left', interactive, style, ...aria }: GlassCardProps) {
  const Tag = TAGS[as]
  const card = (
    <Tag variants={reveal} {...(interactive ? pressCard : {})} className={`glass ${SHAPE[shape]} ${depth ? 'relative' : ''} ${className ?? ''}`} style={style} {...aria}>
      {children}
    </Tag>
  )
  if (!depth) return card
  return (
    <div className="relative isolate">
      {([2, 1] as const)
        .filter((n) => n <= depth)
        .map((n) => (
          <span key={n} aria-hidden className={`glass ${SHAPE[shape]} absolute inset-0 -z-10`} style={layerStyle(n, recede)} />
        ))}
      {card}
    </div>
  )
}
