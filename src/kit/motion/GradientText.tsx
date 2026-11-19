import type { ReactNode } from 'react'

interface GradientTextProps {
  children: ReactNode
  className?: string
}

/**
 * Accent word: Metal, filled with the signature --accent-fill gradient (rose to lilac), with the site's soft glow.
 * Static on purpose; animate it by placing it inside WordRise (`accent` prop) or Pop.
 */
export function GradientText({ children, className }: GradientTextProps) {
  return <span className={`accent-word ${className ?? ''}`}>{children}</span>
}
