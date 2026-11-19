import { MagnifyingGlass } from '@phosphor-icons/react'
import { CheckBadge } from '../../kit/glass/CheckBadge'
import { GlassCard } from '../../kit/glass/GlassCard'

const BAR = 'h-2 rounded-full bg-[color:var(--glass-divider)]'

/** The glass browser window from the reference ads: dots, a search bar and result rows, the first one checked. Decorative. */
export function BrowserMock({ depth = 0, className }: { depth?: 0 | 1 | 2; className?: string }) {
  return (
    <div aria-hidden className={className}>
      <GlassCard depth={depth} className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-[color:var(--glass-icon-from)] opacity-70" />
          ))}
        </div>
        <GlassCard shape="pill" className="flex items-center gap-2 px-3 py-2">
          <MagnifyingGlass className="glass-icon size-4" />
          <span className={`${BAR} w-2/3`} />
        </GlassCard>
        <GlassCard shape="tile" className="flex items-center gap-3 px-3 py-2.5">
          <CheckBadge size="sm" />
          <span className="h-2 w-3/4 rounded-full bg-rose" />
        </GlassCard>
        {[0.6, 0.45].map((w) => (
          <GlassCard key={w} shape="tile" className="flex items-center gap-3 px-3 py-2.5 opacity-80">
            <span className="size-6 shrink-0 rounded-full bg-[color:var(--glass-divider)]" />
            <span className={BAR} style={{ width: `${w * 100}%` }} />
          </GlassCard>
        ))}
      </GlassCard>
    </div>
  )
}
