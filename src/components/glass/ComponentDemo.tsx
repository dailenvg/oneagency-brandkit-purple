import { MagnifyingGlass, User } from '@phosphor-icons/react'
import type { GlassComponentName } from '../../data/glass-rules'
import { CheckBadge } from '../../kit/glass/CheckBadge'
import { GlassCard } from '../../kit/glass/GlassCard'
import { GlassIcon } from '../../kit/glass/GlassIcon'
import { Grain } from '../../kit/glass/Grain'
import { HalftoneArc } from '../../kit/glass/HalftoneArc'
import { ParticleStream } from '../../kit/glass/ParticleStream'

/** Live render of one glass component for the gallery stage. Decorative: the card text describes it. */
export function ComponentDemo({ name }: { name: GlassComponentName }) {
  switch (name) {
    case 'GlassCard':
      return (
        <div className="w-40">
          <GlassCard depth={2} className="grid aspect-[4/3] place-items-center">
            <User className="glass-icon size-12" weight="fill" />
          </GlassCard>
        </div>
      )
    case 'GlassIcon':
      return <GlassIcon icon={MagnifyingGlass} label="AI search visibility scan" className="w-full max-w-64" />
    case 'CheckBadge':
      return (
        <div className="flex items-end gap-4">
          <CheckBadge size="sm" />
          <CheckBadge />
          <CheckBadge size="lg" />
        </div>
      )
    case 'HalftoneArc':
      return <HalftoneArc className="w-full max-w-72" />
    case 'ParticleStream':
      return <ParticleStream className="absolute inset-0 size-full" />
    case 'Grain':
      return (
        <>
          <div className="violet-ground absolute inset-0" />
          <Grain className="opacity-60!" />
        </>
      )
  }
}
