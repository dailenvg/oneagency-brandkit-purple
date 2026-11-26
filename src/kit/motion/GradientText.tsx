import type { ReactNode } from 'react'

interface GradientTextProps {
  children: ReactNode
  className?: string
}

/**
 * Accent word: Unbounded 600 in the solid theme accent (Mint on navy, Ultra Violet on light). The name is historical: text
 * never takes a gradient.
 * Static on purpose; animate it by placing it inside WordRise (`accent` prop) or Pop.
 */
export function GradientText({ children, className }: GradientTextProps) {
  return <span className={`accent-word ${className ?? ''}`}>{children}</span>
}
