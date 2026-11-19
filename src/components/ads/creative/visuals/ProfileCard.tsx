import { User } from '@phosphor-icons/react'
import type { CSSProperties } from 'react'
import { CheckBadge } from '../../../../kit/glass/CheckBadge'
import { GlassCard } from '../../../../kit/glass/GlassCard'

interface ProfileCardProps {
  /** Card width, ad px. */
  size: number
  depth?: 0 | 1 | 2
  recede?: 'left' | 'right'
  /** The rose check badge breaking the front card's bottom-right edge. */
  badge?: boolean
  className?: string
  style?: CSSProperties
}

/** The reference ads' glass profile card: silver person on frosted glass, back layers receding, a rose check on the corner. */
export function ProfileCard({ size, depth = 2, recede = 'left', badge = true, className, style }: ProfileCardProps) {
  const icon = Math.round(size * 0.5)
  const check = Math.round(size * 0.4)
  return (
    <div className={`absolute ${className ?? ''}`} style={{ width: size, ...style }}>
      <GlassCard depth={depth} recede={recede} className="grid aspect-square place-items-center">
        <User weight="fill" className="glass-icon opacity-90" style={{ width: icon, height: icon }} />
      </GlassCard>
      {badge && (
        <span className="absolute" style={{ width: check, height: check, right: -check * 0.32, bottom: -check * 0.28 }}>
          <CheckBadge size="lg" className="size-full! [&>svg]:size-1/2!" />
        </span>
      )}
    </div>
  )
}
