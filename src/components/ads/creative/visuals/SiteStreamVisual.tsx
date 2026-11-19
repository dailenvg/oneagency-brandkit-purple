import { ParticleStream } from '../../../../kit/glass/ParticleStream'
import { Stage } from './Stage'
import { SiteWindow } from './SiteWindow'
import type { VisualProps } from './visual-props'

/** Web design: the particle stream, white to rose, feeding a glowing glass website window. */
export function SiteStreamVisual({ format, className, placement, bleed }: VisualProps) {
  const narrow = format === 'story'
  return (
    <Stage width={narrow ? 380 : 440} height={narrow ? 300 : 282} bleed={bleed} arc={{ width: 480, top: -50, left: narrow ? '58%' : '64%' }} glow={{ width: 380, bottom: 0, left: '62%' }} placement={placement} className={className}>
      <ParticleStream className="absolute top-[22%] -left-10 h-48 w-[78%]" />
      <SiteWindow width={narrow ? 270 : 290} className="right-0 top-0" style={{ transform: 'perspective(900px) rotateY(-18deg) rotateX(4deg)' }} />
    </Stage>
  )
}
