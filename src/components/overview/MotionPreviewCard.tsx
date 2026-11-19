import { FilmSlate } from '@phosphor-icons/react'
import { useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { motionAdExport } from '../../data/motion-ads'
import { assetFor } from '../../lib/assets'
import { useOnScreen } from '../../lib/hooks'
import { DashboardCard } from './DashboardCard'

const SIZE = { width: 1080, height: 1080 }

/** One animated ad (the audit concept, square): plays once when it comes into view, then holds on the CTA. */
export function MotionPreviewCard({ className }: { className?: string }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLVideoElement>(null)
  const onScreen = useOnScreen(ref)
  const played = useRef(false)
  const video = assetFor(motionAdExport('audit', SIZE, 'mp4')) ?? assetFor(motionAdExport('audit', SIZE, 'webm'))
  const poster = motionAdExport('audit', SIZE, 'png')

  useEffect(() => {
    const el = ref.current
    if (!el || reduced || !onScreen || played.current) return
    played.current = true
    el.play().catch(() => {})
  }, [onScreen, reduced])

  return (
    <DashboardCard title="Motion ad" view="ads" linkLabel="More" className={className}>
      <div data-theme="dark" className="aspect-square overflow-hidden rounded-site-sm border border-edge bg-void">
        {video ? (
          <video ref={ref} src={video.url} poster={poster} controls muted playsInline preload="metadata" className="size-full" aria-label="Audit offer ad, 1080×1080, animated, no sound" />
        ) : (
          <p className="grid size-full place-items-center p-4 text-center text-step-small text-text-3">
            <span className="flex flex-col items-center gap-2">
              <FilmSlate className="size-6" aria-hidden />
              This animated ad is on the way.
            </span>
          </p>
        )}
      </div>
    </DashboardCard>
  )
}
