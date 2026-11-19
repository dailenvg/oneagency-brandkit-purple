import { Stage } from './Stage'
import { ProfileCard } from './ProfileCard'
import type { VisualProps } from './visual-props'

/** Paid social: the profile card depth stack receding up and to the left, the front card checked. */
export function ProfileStackVisual({ className, placement, bleed }: VisualProps) {
  return (
    <Stage width={300} height={250} bleed={bleed} arc={{ width: 560, top: -64, left: '56%' }} glow={{ width: 320, bottom: 0, left: '62%' }} placement={placement} className={className}>
      <ProfileCard size={180} className="right-8 bottom-5" style={{ transform: 'perspective(900px) rotateY(-16deg) rotateX(3deg)' }} />
    </Stage>
  )
}
