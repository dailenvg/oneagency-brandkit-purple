import { Quotes } from '@phosphor-icons/react'
import { CheckBadge } from '../../../../kit/glass/CheckBadge'
import { GlassCard } from '../../../../kit/glass/GlassCard'
import { AdHeadline } from '../AdHeadline'
import { adText } from '../ad-type'
import { FitScaleContext } from '../fit-scale'
import { Stage } from './Stage'
import { ProfileCard } from './ProfileCard'
import type { VisualProps } from './visual-props'

/**
 * Testimonial: the quote set large on a glass card with a rose check breaking its corner. In landscape the quote runs
 * as the headline beside it, so the visual is the profile stack alone.
 */
export function QuoteVisual({ concept, format, className, placement, bleed }: VisualProps) {
  if (format === 'landscape') {
    return (
      <Stage width={310} height={290} bleed={bleed} arc={{ width: 520, top: -80, left: '56%' }} glow={{ width: 300, bottom: 0, left: '60%' }} placement={placement} className={className}>
        <ProfileCard size={216} className="right-8 bottom-6" style={{ transform: 'perspective(900px) rotateY(-16deg)' }} />
      </Stage>
    )
  }
  const tall = format === 'story'
  return (
    <Stage width={460} height={tall ? 420 : 360} arc={{ width: 600, top: -50 }} glow={{ width: 460, bottom: -4 }} placement={placement} className={className}>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <GlassCard depth={1} recede="right" className="flex flex-col gap-6 px-8 py-9">
          <Quotes weight="fill" className="size-12 text-rose" />
          <AdHeadline concept={concept} format="square" scale={tall ? 0.84 : 0.7} />
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-rose" />
            <FitScaleContext.Consumer>{(fit) => <p style={{ ...adText('statLabel', format, 1, fit), color: 'var(--text-2)' }}>{concept.attribution}</p>}</FitScaleContext.Consumer>
          </div>
        </GlassCard>
        <span className="absolute -top-7 -right-7 size-20">
          <CheckBadge size="lg" className="size-full! [&>svg]:size-1/2!" />
        </span>
      </div>
    </Stage>
  )
}
