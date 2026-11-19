import { MapPin, MapPinArea, Star } from '@phosphor-icons/react'
import { CheckBadge } from '../../../../kit/glass/CheckBadge'
import { GlassCard } from '../../../../kit/glass/GlassCard'
import { Stage } from './Stage'
import type { VisualProps } from './visual-props'

const BAR = 'block h-2 rounded-full bg-[color:var(--glass-divider)]'

/** Local SEO: a glass map pack, the first listing lit rose and checked, a rose map pin badge on the corner. */
export function MapPackVisual({ className, placement, bleed }: VisualProps) {
  return (
    <Stage width={320} height={270} bleed={bleed} arc={{ width: 540, top: -62 }} glow={{ width: 320, bottom: 4 }} placement={placement} className={className}>
      <div className="absolute inset-x-4 top-3" style={{ transform: 'perspective(900px) rotateY(-12deg) rotateX(4deg)' }}>
        <GlassCard depth={1} recede="left" className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3 px-1">
            <MapPinArea className="glass-icon size-7 shrink-0" weight="regular" />
            <span className={`${BAR} w-1/2`} />
          </div>
          <GlassCard shape="tile" className="flex items-center gap-3 px-3 py-3">
            <CheckBadge size="sm" />
            <span className="flex flex-1 flex-col gap-1.5">
              <span className="block h-2 w-4/5 rounded-full bg-rose" />
              <span className="flex gap-0.5 text-rose">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} weight="fill" className="size-3" />
                ))}
              </span>
            </span>
          </GlassCard>
          {[0.6, 0.45].map((w) => (
            <GlassCard key={w} shape="tile" className="flex items-center gap-3 px-3 py-3 opacity-75">
              <MapPin className="glass-icon size-6 shrink-0 opacity-70" weight="fill" />
              <span className={BAR} style={{ width: `${w * 100}%` }} />
            </GlassCard>
          ))}
        </GlassCard>
        <span className="absolute -top-8 -right-6 size-20">
          <CheckBadge size="lg" icon={MapPin} className="size-full! [&>svg]:size-1/2!" />
        </span>
      </div>
    </Stage>
  )
}
