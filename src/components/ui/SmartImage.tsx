import { ArrowClockwise, ImageBroken } from '@phosphor-icons/react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { buttonClass } from './button-styles'

interface SmartImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  /** Classes for the wrapper (size, radius, background). */
  className?: string
  /** Classes for the <img> (object-fit, etc.). */
  imgClassName?: string
  style?: CSSProperties
  /** Load straight away (above the fold). Default lazy. */
  eager?: boolean
  /** Small thumbnails: the error state is just a retry icon button. */
  compact?: boolean
  /**
   * Interactive layer over the loaded image (e.g. an "open" button). Rendered only once the image is ready, so it never
   * nests with or covers the Retry button.
   */
  overlay?: ReactNode
}

type Status = 'loading' | 'ready' | 'error'

/** Image with a shimmer skeleton while loading and an inline retry when it fails. */
export function SmartImage({ src, alt, width, height, className, imgClassName, style, eager, compact, overlay }: SmartImageProps) {
  const [status, setStatus] = useState<Status>('loading')
  const [attempt, setAttempt] = useState(0)
  const retry = () => {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`} style={style}>
      {status === 'loading' && <div aria-hidden className="absolute inset-0 animate-pulse bg-surface-2 motion-reduce:animate-none" />}
      {status === 'error' ? (
        // No role="img" here: its children are presentational, which would hide the Retry button from screen readers.
        compact ? (
          <div className="absolute inset-0 grid place-items-center bg-surface">
            <button
              type="button"
              onClick={retry}
              aria-label={`Image failed to load${alt ? `: ${alt}` : ''}. Retry`}
              className="grid size-touch place-items-center rounded-full text-text-3 transition-colors hover:text-accent"
            >
              <ImageBroken className="size-6" aria-hidden />
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-surface p-3 text-center">
            <div className="flex flex-col items-center gap-2 text-step-small text-text-3">
              <ImageBroken className="size-6" aria-hidden />
              <span>
                Image failed to load{alt && <span className="sr-only">: {alt}</span>}
              </span>
              <button type="button" onClick={retry} className={buttonClass('link', 'sm')}>
                <ArrowClockwise aria-hidden /> Retry
              </button>
            </div>
          </div>
        )
      ) : (
        <img
          key={attempt}
          src={attempt ? `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}` : src}
          alt={alt}
          width={width}
          height={height}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
          className={`block transition-opacity duration-300 motion-reduce:transition-none ${status === 'ready' ? 'opacity-100' : 'opacity-0'} ${imgClassName ?? ''}`}
        />
      )}
      {status === 'ready' && overlay}
    </div>
  )
}
