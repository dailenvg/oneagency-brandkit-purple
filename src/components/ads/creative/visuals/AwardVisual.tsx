import { Trophy } from '@phosphor-icons/react'
import { CheckBadge } from '../../../../kit/glass/CheckBadge'
import { GlassCard } from '../../../../kit/glass/GlassCard'
import { adMinPx, adText } from '../ad-type'
import { FitScaleContext } from '../fit-scale'
import { Stage } from './Stage'
import type { VisualProps } from './visual-props'

/** Vacation ownership: the ARDY award as a glass card under the kit laurel, a rose trophy badge at its heart. */
export function AwardVisual({ concept, format, className, placement, bleed }: VisualProps) {
  const [title, event, to] = concept.award
  return (
    <Stage width={320} height={282} bleed={bleed} arc={{ width: 540, top: -62 }} glow={{ width: 320, bottom: 0 }} placement={placement} className={className}>
      <div className="absolute top-0 left-1/2 grid size-36 -translate-x-1/2 place-items-center">
        <img src="/kit/elements/one-agency_element_laurel.svg" alt="" width={144} height={144} className="absolute inset-0 size-full opacity-90" />
        <CheckBadge size="lg" icon={Trophy} className="size-16! [&>svg]:size-8!" />
      </div>
      <FitScaleContext.Consumer>
        {(fit) => (
          <GlassCard className="absolute inset-x-2 bottom-4 flex flex-col items-center gap-2 px-5 py-5 text-center">
            <p style={{ ...adText('subhead', 'square', 0.72), fontWeight: 700, color: 'var(--text)' }}>{title}</p>
            <p style={{ ...adText('eyebrow', 'square', 0.8), fontSize: Math.max(12, adMinPx('legal', format, fit)), color: 'var(--text-2)' }}>{event}</p>
            <p style={{ ...adText('legal', format, 1.05, fit), color: 'var(--rose)' }}>{to}</p>
          </GlassCard>
        )}
      </FitScaleContext.Consumer>
    </Stage>
  )
}
