/** "12 KB", "3.4 MB". */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export const formatSize = (width: number | null, height: number | null) => (width && height ? `${width}×${height}` : null)

/** "8 s" or "8.5 s". */
export const formatSeconds = (s: number) => `${Number.isInteger(s) ? s : s.toFixed(1)} s`

/** File name from a URL path. */
export const fileName = (url: string) => url.slice(url.lastIndexOf('/') + 1)

/** Upper-case extension from a URL path. */
export const fileFormat = (url: string) => url.slice(url.lastIndexOf('.') + 1).toUpperCase()

/** Evaluates a CSS clamp(min, preferred, max) in rem/vw units to px at a viewport width. */
export function clampPx(value: string, viewport: number, rootPx = 16) {
  const toPx = (expr: string) =>
    [...expr.matchAll(/([+-]?\s*[\d.]+)(rem|vw|px)/g)].reduce((sum, [, n, unit]) => {
      const v = Number.parseFloat(n.replace(/\s/g, ''))
      return sum + (unit === 'rem' ? v * rootPx : unit === 'vw' ? (v * viewport) / 100 : v)
    }, 0)
  const m = value.match(/^clamp\((.+?),(.+),(.+)\)$/)
  if (!m) return toPx(value)
  const [min, pref, max] = m.slice(1).map(toPx)
  return Math.min(max, Math.max(min, pref))
}
