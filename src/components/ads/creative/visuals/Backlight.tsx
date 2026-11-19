import { GlowGround } from '../../../../kit/glass/GlowGround'
import { HalftoneArc } from '../../../../kit/glass/HalftoneArc'

/** Arc width, ad px, and its top edge relative to the drawing (negative runs above it); `left` is its centre. */
export interface BacklightArc {
  width: number
  top: number
  left?: string
}

/** Rose under-glow: width, ad px, and its centre line from the bottom of the drawing. */
export interface BacklightGlow {
  width: number
  bottom: number
  left?: string
}

interface BacklightProps {
  arc?: BacklightArc
  glow?: BacklightGlow
}

/** The light behind a glass object: the rose halftone arc sweeping over it and the rose under-glow on the ground. */
export function Backlight({ arc, glow }: BacklightProps) {
  return (
    <>
      {arc && <HalftoneArc rows={15} density={1.7} className="absolute -translate-x-1/2" style={{ width: arc.width, top: arc.top, left: arc.left ?? '50%' }} />}
      {glow && (
        <GlowGround
          className="-translate-x-1/2 translate-y-1/2"
          style={{ width: glow.width, height: glow.width * 0.32, bottom: glow.bottom, left: glow.left ?? '50%' }}
        />
      )}
    </>
  )
}
