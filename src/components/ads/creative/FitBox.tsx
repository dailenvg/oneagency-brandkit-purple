import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { FitScaleContext } from './fit-scale'

interface FitBoxProps {
  /** Natural size of the drawing, ad px. */
  width: number
  height: number
  /** Largest scale-up. */
  max?: number
  /** Room above the drawing for decoration that rises over it (the halftone arc), ad px; fitted with the drawing. */
  headroom?: number
  /** Width the drawing may use beyond its slot (1.15 lets it run 15% into the side margins). Default 1. */
  bleed?: number
  className?: string
  children: ReactNode
}

/**
 * Scales a fixed-size drawing to fit its slot (centred, never cropped), so one glass composition serves every format.
 * Measures layout size, so it is unaffected by the canvas's own scale.
 */
export function FitBox({ width, height, headroom = 0, max = 2, bleed = 1, className, children }: FitBoxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [k, setK] = useState(1)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => setK(Math.max(0.1, Math.min(max, (el.clientWidth * bleed) / width, el.clientHeight / (height + headroom))))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [width, height, headroom, max, bleed])
  return (
    <div ref={ref} className={`relative min-h-0 min-w-0 ${className ?? ''}`}>
      <div className="absolute top-1/2 left-1/2" style={{ width, height: height + headroom, transform: `translate(-50%, -50%) scale(${k})` }}>
        <div className="absolute left-0" style={{ top: headroom, width, height }}>
          <FitScaleContext.Provider value={k}>{children}</FitScaleContext.Provider>
        </div>
      </div>
    </div>
  )
}
