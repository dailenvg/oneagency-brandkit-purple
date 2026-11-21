import { Stage } from './Stage'
import { SiteWindow } from './SiteWindow'
import type { VisualProps } from './visual-props'

/** Web design: a glass website window, turned toward the copy. */
export function SiteStreamVisual({ format, className, placement, bleed }: VisualProps) {
  const narrow = format === 'story'
  return (
    <Stage width={narrow ? 380 : 440} height={narrow ? 300 : 282} bleed={bleed} arc={{ width: 480, top: -50, left: narrow ? '58%' : '64%' }} placement={placement} className={className}>
      <SiteWindow width={narrow ? 270 : 290} className="right-0 top-0" style={{ transform: 'perspective(900px) rotateY(-18deg) rotateX(4deg)' }} />
    </Stage>
  )
}
