import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { DEFAULT_VIEW, findSubsection, isViewId, viewHref, type ViewId } from './views'

/** `sub` is a subsection of the view (#/logo/clear-space): same view, scrolled to that heading. */
export type Route = { view: ViewId; sub?: string } | { view: 'not-found'; path: string }

interface Parsed {
  route: Route
  /** Hash to rewrite the address to (v1.0 anchors such as #logo), or null when it is already right. */
  canonical: string | null
}

/**
 * Hash routes: "#/logo", and "#/logo/clear-space" for a subsection (see SUBSECTIONS). The v1.0 one-page anchors ("#logo", "#assets", "#top") still work and are rewritten to their
 * view. An unknown or malformed "#/path" is a not-found view; any other plain anchor stays on Overview.
 */
export function parseHash(hash: string): Parsed {
  const encoded = hash.replace(/^#/, '')
  let raw: string
  try {
    raw = decodeURIComponent(encoded)
  } catch {
    // A broken escape such as "#/%E0%A4%A": nothing to match, so say so instead of crashing the app.
    return { route: { view: 'not-found', path: encoded.replace(/^\//, '') }, canonical: null }
  }
  if (!raw || raw === '/') return { route: { view: DEFAULT_VIEW }, canonical: null }
  if (raw.startsWith('/')) {
    const path = raw.slice(1).replace(/\/+$/, '')
    const [view, sub, ...rest] = path.split('/')
    if (!isViewId(view) || rest.length) return { route: { view: 'not-found', path }, canonical: null }
    if (!sub) return { route: { view }, canonical: null }
    // A known view with an unknown subsection lands at the top of that view, and the address says so.
    return findSubsection(view, sub) ? { route: { view, sub }, canonical: null } : { route: { view }, canonical: viewHref(view) }
  }
  if (isViewId(raw)) return { route: { view: raw }, canonical: viewHref(raw) }
  if (raw === 'top') return { route: { view: DEFAULT_VIEW }, canonical: viewHref(DEFAULT_VIEW) }
  return { route: { view: DEFAULT_VIEW }, canonical: null }
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** The current route, re-rendering on every hash change. Legacy anchors are rewritten in place (no history entry). */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const { route, canonical } = useMemo(() => parseHash(hash), [hash])
  useEffect(() => {
    if (canonical) history.replaceState(history.state, '', canonical)
  }, [canonical])
  return route
}

/** Stable key for transitions and focus: one per view (and one per unknown path). */
export const routeKey = (route: Route) => (route.view === 'not-found' ? `not-found:${route.path}` : route.view)
