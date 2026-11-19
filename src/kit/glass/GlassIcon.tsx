import type { Icon } from '@phosphor-icons/react'
import { GlassCard } from './GlassCard'

const SIZES = {
  md: { tile: 'min-h-16 gap-4 px-4 py-3', icon: 'size-8' },
  /** Ad tiles: the reference proportions at 1080 wide (label size comes from the parent). */
  lg: { tile: 'min-h-18 gap-4 px-5 py-3.5', icon: 'size-10' },
} as const

interface GlassIconProps {
  icon: Icon
  label: string
  className?: string
  size?: keyof typeof SIZES
}

/** Glass icon tile from the reference ads: silver icon, thin vertical divider, label. */
export function GlassIcon({ icon: IconComponent, label, className, size = 'md' }: GlassIconProps) {
  const s = SIZES[size]
  return (
    <GlassCard shape="tile" className={`flex items-center ${s.tile} ${className ?? ''}`}>
      <IconComponent className={`glass-icon shrink-0 ${s.icon}`} weight="regular" aria-hidden />
      <span aria-hidden className="glass-divider w-px self-stretch" />
      <span className="font-semibold leading-tight text-text">{label}</span>
    </GlassCard>
  )
}
