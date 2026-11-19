import type { CSSProperties } from 'react'

interface GlowGroundProps {
  /**
   * rose: the soft rose under-glow beneath a glass object (size and place it with className).
   * violet: a full-bleed ground, violet top left into near-black, with a lilac glow (the glass-toggle ad).
   */
  variant?: 'rose' | 'violet'
  className?: string
  /** Size and place it (ads set px); merged under the glow. */
  style?: CSSProperties
}

const GROUNDS: Record<NonNullable<GlowGroundProps['variant']>, CSSProperties> = {
  rose: { background: 'radial-gradient(closest-side, var(--glass-under-glow), transparent)' },
  violet: {
    background:
      'radial-gradient(60% 50% at 50% 70%, color-mix(in srgb, var(--glass-streak-b) 28%, transparent), transparent 70%), linear-gradient(120deg, var(--glass-ground-from) 0%, var(--glass-ground-to) 75%)',
  },
}

/** Glow under and around glass objects. Decorative. */
export function GlowGround({ variant = 'rose', className, style }: GlowGroundProps) {
  return <div aria-hidden className={`pointer-events-none absolute ${variant === 'violet' ? 'inset-0' : ''} ${className ?? ''}`} style={{ ...style, ...GROUNDS[variant] }} />
}
