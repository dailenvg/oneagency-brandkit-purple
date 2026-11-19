import { CHANNELS, PLANNED_SIZES } from '../../lib/ads'

/** Largest side of a placeholder frame, px. Placeholders are scaled; real templates show at true size. */
const MAX_SIDE = 160
/** Floor so the thin banners (728x90, 320x50) stay visible. */
const MIN_W = 48
const MIN_H = 24

/** Ghost frames for every ticket size, so the gallery shows what is coming while Magnific works. */
export function PlannedSizes() {
  return (
    <div className="flex flex-col gap-6">
      {CHANNELS.filter((c) => c.id !== 'other').map((c) => (
        <div key={c.id}>
          <h3 className="mb-3 text-step-small font-semibold text-text-2">{c.label}</h3>
          <ul className="flex flex-wrap items-end gap-4">
            {PLANNED_SIZES[c.id as keyof typeof PLANNED_SIZES].map(([w, h]) => {
              const k = MAX_SIDE / Math.max(w, h)
              return (
                <li key={`${w}x${h}`} className="flex flex-col gap-2">
                  <div className="grid place-items-center rounded-site-sm border border-dashed border-edge-strong/60 bg-surface/50" style={{ width: Math.max(w * k, MIN_W), height: Math.max(h * k, MIN_H) }}>
                    <span className="sr-only">Placeholder</span>
                  </div>
                  <span className="font-num text-step-small text-text-3">
                    {w}×{h}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
