import { ChatCircleDots, User } from '@phosphor-icons/react'
import { CheckBadge } from '../../../../kit/glass/CheckBadge'
import { GlassCard } from '../../../../kit/glass/GlassCard'
import { ParticleStream } from '../../../../kit/glass/ParticleStream'
import { Stage } from './Stage'
import type { VisualProps } from './visual-props'

const BAR = 'block h-2 rounded-full bg-[color:var(--glass-divider)]'

/** Leads leaving the system, front to back: the first one checked. */
const LEADS = [
  { top: 14, right: 0, opacity: 0.7 },
  { top: 92, right: 22, opacity: 1 },
  { top: 170, right: 4, opacity: 0.7 },
]

/** Technology: traffic flowing in as a particle stream, through the AI system tile, out as glass lead cards. */
export function LeadStreamVisual({ className, placement, bleed }: VisualProps) {
  return (
    <Stage width={470} height={250} bleed={bleed} arc={{ width: 560, top: -64, left: '46%' }} glow={{ width: 420, bottom: 0, left: '55%' }} placement={placement} className={className}>
      <ParticleStream className="absolute top-[18%] -left-12 h-48 w-[62%]" />
      <GlassCard className="absolute top-1/2 left-[38%] grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center">
        <ChatCircleDots className="glass-icon size-14" weight="regular" />
      </GlassCard>
      {LEADS.map((lead, i) => (
        <div key={lead.top} className="absolute w-44" style={{ top: lead.top, right: lead.right, opacity: lead.opacity, transform: 'perspective(700px) rotateY(-16deg)' }}>
          <GlassCard shape="tile" className="flex items-center gap-3 px-3 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[color:var(--glass-divider)]">
              <User weight="fill" className="glass-icon size-5" />
            </span>
            <span className="flex flex-1 flex-col gap-1.5">
              <span className={`${BAR} w-4/5 ${i === 1 ? 'bg-rose!' : ''}`} />
              <span className={`${BAR} w-1/2`} />
            </span>
          </GlassCard>
          {i === 1 && (
            <span className="absolute -top-3 -right-3 size-9">
              <CheckBadge size="md" className="size-full! [&>svg]:size-1/2!" />
            </span>
          )}
        </div>
      ))}
    </Stage>
  )
}
