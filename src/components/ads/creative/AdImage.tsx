import { ImageBroken } from '@phosphor-icons/react'
import { useState } from 'react'
import type { CreativeAdConcept, CreativeAdSize } from '../../../data/ad-creative'
import { adAlt, creativeAdFiles } from '../../../lib/creative-ads'

interface AdImageProps {
  concept: CreativeAdConcept
  size: CreativeAdSize
  /** The lead ads load first; the gallery loads as it scrolls in. */
  priority?: boolean
  className?: string
}

/**
 * A creative ad as its exported image (designed in Magnific, imported by scripts/import-magnific-ads.py): WebP with
 * the PNG as fallback, held at the ad's aspect ratio with a skeleton until it loads. A missing or broken file shows a
 * quiet placeholder instead of a broken image.
 */
export function AdImage({ concept, size, priority = false, className }: AdImageProps) {
  const files = creativeAdFiles(concept.id, size.format)
  const src = files.png?.url ?? files.webp?.url
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(src ? 'loading' : 'error')

  return (
    <div className={`relative w-full overflow-hidden bg-surface-2 ${className ?? ''}`} style={{ aspectRatio: `${size.width} / ${size.height}` }}>
      {state === 'loading' && <div aria-hidden className="absolute inset-0 animate-pulse bg-surface-2 motion-reduce:animate-none" />}
      {state === 'error' ? (
        <div className="absolute inset-0 grid place-items-center p-4 text-center text-step-small text-text-3">
          <span className="flex flex-col items-center gap-2">
            <ImageBroken className="size-6" aria-hidden />
            This size isn&apos;t exported yet.
          </span>
        </div>
      ) : (
        <picture>
          {files.webp && <source srcSet={files.webp.url} type="image/webp" />}
          <img
            src={src}
            alt={adAlt(concept, size)}
            width={size.width}
            height={size.height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setState('ready')}
            onError={() => setState('error')}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-300 motion-reduce:transition-none ${state === 'ready' ? 'opacity-100' : 'opacity-0'}`}
          />
        </picture>
      )}
    </div>
  )
}
