import { BrowserMock } from '../../../glass/BrowserMock'
import { CheckBadge } from '../../../../kit/glass/CheckBadge'
import { Stage } from './Stage'
import type { VisualProps } from './visual-props'

/** AI search: the glass browser window from the references, tilted, with a rose check breaking its corner. */
export function BrowserVisual({ className, placement, bleed }: VisualProps) {
  return (
    <Stage width={340} height={262} bleed={bleed} arc={{ width: 560, top: -66 }} glow={{ width: 380, bottom: 6 }} placement={placement} className={className}>
      <div className="absolute top-2 right-0 left-10" style={{ transform: 'perspective(900px) rotateY(16deg) rotateX(5deg) rotate(-2deg)' }}>
        <BrowserMock depth={1} />
        <span className="absolute -top-6 -right-6 size-20">
          <CheckBadge size="lg" className="size-full! [&>svg]:size-1/2!" />
        </span>
      </div>
    </Stage>
  )
}
