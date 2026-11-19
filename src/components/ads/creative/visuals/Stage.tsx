import type { ReactNode } from 'react'
import { FitBox } from '../FitBox'
import { Backlight, type BacklightArc, type BacklightGlow } from './Backlight'
import { useHalftone } from './halftone-context'
import type { VisualPlacement } from './visual-props'

interface StageProps {
  /** Natural size of the drawing, ad px. */
  width: number
  height: number
  arc?: BacklightArc
  glow?: BacklightGlow
  placement: VisualPlacement
  bleed?: number
  className?: string
  children: ReactNode
}

/** The topmost dots sit this far down the arc, as a share of its width (the arc's viewBox geometry). */
const ARC_DOT_TOP = 0.06
/** Beside the copy the arc sweeps from the object's middle out to the right, never back over the copy column. */
const SIDE_ARC = { left: '72%', maxWidth: 1.45 } as const

/**
 * A visual's stage: the drawing fitted to its slot, with its halftone arc and under-glow. Below a headline the arc's
 * rise is fitted as headroom, so the dots never reach the copy above; beside the copy the arc sweeps right only. With the
 * Möbius loop behind the ad there is no arc.
 */
export function Stage({ width, height, glow, placement, bleed, className, children, ...props }: StageProps) {
  const side = placement === 'side'
  const arc = useHalftone() ? props.arc : undefined
  const lit = arc && side ? { ...arc, left: SIDE_ARC.left, width: Math.min(arc.width, width * SIDE_ARC.maxWidth) } : arc
  const headroom = arc && !side ? Math.max(0, -(arc.top + ARC_DOT_TOP * arc.width)) : 0
  return (
    <FitBox width={width} height={height} headroom={headroom} bleed={bleed} className={className}>
      <Backlight arc={lit} glow={glow} />
      {children}
    </FitBox>
  )
}
