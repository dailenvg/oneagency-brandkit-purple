import { Image } from '@phosphor-icons/react'
import type { CSSProperties } from 'react'
import { GlassCard } from '../../../../kit/glass/GlassCard'

const BAR = 'block h-2 rounded-full bg-[color:var(--glass-divider)]'

/** A glass website window: browser dots, a hero with headline bars and an image, three cards and a rose button. */
export function SiteWindow({ width, className, style }: { width: number; className?: string; style?: CSSProperties }) {
  return (
    <div className={`absolute ${className ?? ''}`} style={{ width, ...style }}>
      <GlassCard depth={1} recede="right" className="flex flex-col gap-4 p-5">
        <div className="flex gap-1.5">
          {['bg-rose', 'bg-[color:var(--pos)]', 'bg-[color:var(--glass-divider)]'].map((c) => (
            <span key={c} className={`size-2.5 rounded-full ${c}`} />
          ))}
        </div>
        <div className="grid grid-cols-[1.2fr_1fr] items-center gap-4">
          <div className="flex flex-col gap-2.5">
            <span className={`${BAR} h-3 w-full bg-[color:var(--paper)]! opacity-80`} />
            <span className={`${BAR} w-4/5`} />
            <span className={`${BAR} w-3/5`} />
          </div>
          <GlassCard shape="tile" className="grid aspect-[4/3] place-items-center">
            <Image className="glass-icon size-9 opacity-80" weight="regular" />
          </GlassCard>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <GlassCard key={i} shape="tile" className="flex h-14 flex-col justify-center gap-1.5 px-3">
              <span className={`${BAR} w-4/5`} />
              <span className={`${BAR} w-1/2`} />
            </GlassCard>
          ))}
        </div>
        <span className="mx-auto h-6 w-2/5 rounded-full bg-rose shadow-[0_0_24px_-4px_var(--rose)]" />
      </GlassCard>
    </div>
  )
}
