import { CursorClick, MagnifyingGlass } from '@phosphor-icons/react'
import { GlassCard } from '../../../../kit/glass/GlassCard'
import { Stage } from './Stage'
import { ProfileCard } from './ProfileCard'
import type { VisualProps } from './visual-props'

const BAR = 'block h-2 rounded-full bg-[color:var(--glass-divider)]'

/** Paid search: a glass search bar and a click turning into a lead (the profile card with its rose check). */
export function SearchCardVisual({ className, placement, bleed }: VisualProps) {
  return (
    <Stage width={320} height={270} bleed={bleed} arc={{ width: 520, top: -60, left: '58%' }} glow={{ width: 300, bottom: 4, left: '60%' }} placement={placement} className={className}>
      <ProfileCard size={170} className="right-6 bottom-5" style={{ transform: 'perspective(900px) rotateY(-14deg)' }} />
      <GlassCard shape="pill" className="absolute top-0 left-0 flex w-60 items-center gap-3 px-4 py-3">
        <MagnifyingGlass className="glass-icon size-6 shrink-0" weight="bold" />
        <span className={`${BAR} w-3/4`} />
      </GlassCard>
      <GlassCard shape="tile" className="absolute top-20 left-4 grid size-16 place-items-center">
        <CursorClick className="glass-icon size-8 opacity-80" weight="regular" />
      </GlassCard>
    </Stage>
  )
}
