import { useLayoutEffect, useRef, useState } from 'react'
import type { CreativeAdConcept, CreativeAdSize } from '../../../data/ad-creative'
import { CreativeAd } from './CreativeAd'

interface ScaledAdProps {
  concept: CreativeAdConcept
  size: CreativeAdSize
  className?: string
}

/**
 * A live creative ad scaled to the width of its frame (never wider than the column, so phones never scroll sideways).
 * Holds the ad's aspect ratio with a skeleton until the frame is measured; off-screen frames skip rendering.
 */
export function ScaledAd({ concept, size, className }: ScaledAdProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState<number | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => setScale(el.clientWidth ? el.clientWidth / size.width : null)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [size.width])
  return (
    <div ref={ref} className={`relative w-full overflow-hidden [content-visibility:auto] ${className ?? ''}`} style={{ aspectRatio: `${size.width} / ${size.height}` }}>
      {scale ? (
        <div className="absolute inset-0">
          <CreativeAd concept={concept} size={size} scale={scale} />
        </div>
      ) : (
        <div aria-hidden className="absolute inset-0 animate-pulse bg-surface-2 motion-reduce:animate-none" />
      )}
    </div>
  )
}
