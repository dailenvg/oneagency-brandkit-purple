import { Check, type Icon } from '@phosphor-icons/react'

const SIZES = { sm: 'size-6 [&>svg]:size-3.5', md: 'size-10 [&>svg]:size-5', lg: 'size-20 [&>svg]:size-10' } as const

interface CheckBadgeProps {
  size?: keyof typeof SIZES
  className?: string
  /** Glyph in the sphere. Default the check; ads use the same sphere for a map pin or a trophy. */
  icon?: Icon
}

/** Mint glass check badge: a lit Mint sphere with a navy check and an edge ring (Navy on light). Decorative; pair it with text. */
export function CheckBadge({ size = 'md', className, icon: Glyph = Check }: CheckBadgeProps) {
  return (
    <span aria-hidden className={`check-badge shrink-0 ${SIZES[size]} ${className ?? ''}`}>
      <Glyph weight="bold" />
    </span>
  )
}
