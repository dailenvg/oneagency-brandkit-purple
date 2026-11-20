import type { ReactNode } from 'react'

interface GradientTextProps {
  children: ReactNode
  className?: string
}

/**
 * Accent word: Unbounded 600, filled with the theme's accent gradient (Mint to Violet on navy, Violet to Navy on light). No glow.
 * Static on purpose; animate it by placing it inside WordRise (`accent` prop) or Pop.
 */
export function GradientText({ children, className }: GradientTextProps) {
  return <span className={`accent-word ${className ?? ''}`}>{children}</span>
}
