import { useId } from 'react'

/**
 * Unique ids for a graphic's gradients, masks and filters, so several on one page never share one. Exports pass a
 * readable `prefix`; the hub falls back to React's id, reduced to characters that are safe in url(#...) and XML.
 */
export function useGraphicIds(prefix?: string) {
  const auto = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const base = prefix ?? `g${auto}`
  const id = (name: string) => `${base}-${name}`
  return { id, url: (name: string) => `url(#${id(name)})` }
}
