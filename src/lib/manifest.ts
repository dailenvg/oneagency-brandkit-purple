/** Validators shared by the manifest loaders (ads.ts, glass.ts): every one returns null instead of throwing. */

export type Json = Record<string, unknown>

export const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)

export const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)

/** A positive pixel size, from a number or a numeric string. */
export const size = (v: unknown) => {
  const n = typeof v === 'string' ? Number.parseFloat(v) : v
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.round(n) : null
}

export const httpUrl = (v: unknown) => {
  const s = text(v)
  return s && /^https?:\/\//.test(s) ? s : null
}

/** Accepts "/kit/...", "kit/..." and "public/kit/..."; anything else is dropped. */
export function kitPath(v: unknown): string | null {
  const s = text(v)
  if (!s) return null
  const path = s.replace(/^\.?\/?(public\/)?/, '/')
  return path.startsWith('/kit/') ? path : null
}
