import { useEffect, useState } from 'react'
import { parseHash } from '../../lib/router'
import { subAnchorId, subsectionsFor, type ViewId } from '../../lib/views'

/** Headings whose tops are this close (px) sit on one row, side by side. */
const ROW_TOLERANCE = 4

/** A heading counts as current once its top passes this share of the window height. */
const READ_LINE = 0.3
/** Re-measure for a while after a view change: lazy views and reveals keep moving headings as they load, ms. */
const SETTLE = [150, 600, 1500]

/**
 * Scroll spy for the sidebar dropdowns: the subsection of `view` being read. The opening block (a `top` entry) is
 * current until the first heading passes the read line; at the very bottom of the page the last heading on the page
 * wins, since short closing sections never reach the line. Null when the view has no subsections.
 */
export function useActiveSubsection(view: ViewId | null) {
  const [state, setState] = useState<{ view: ViewId | null; sub: string | null }>({ view: null, sub: null })

  useEffect(() => {
    const subs = view ? subsectionsFor(view) : []
    if (!view || !subs.length) return
    let frame = 0
    const measure = () => {
      frame = 0
      const line = window.innerHeight * READ_LINE
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      // Headings past the line, with their tops. Two can share a row (Logo's Clear space and Minimum size): among
      // the lowest row passed, the one the address names wins, else the first of the row.
      const passed: { id: string; top: number }[] = []
      for (const s of subs) {
        if (s.top) continue
        const el = document.getElementById(subAnchorId(view, s.id))
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (atBottom || top <= line) passed.push({ id: s.id, top })
      }
      let current: string | null = subs[0].top ? subs[0].id : null
      if (passed.length) {
        const last = passed[passed.length - 1]
        const row = passed.filter((p) => Math.abs(p.top - last.top) <= ROW_TOLERANCE)
        const { route } = parseHash(window.location.hash)
        const named = route.view === view && route.sub ? row.find((p) => p.id === route.sub) : undefined
        current = (named ?? row[0]).id
      }
      setState((prev) => (prev.view === view && prev.sub === current ? prev : { view, sub: current }))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    schedule()
    const timers = SETTLE.map((ms) => window.setTimeout(schedule, ms))
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // A new address can name the other heading of a row without anything scrolling.
    window.addEventListener('hashchange', schedule)
    return () => {
      cancelAnimationFrame(frame)
      timers.forEach(clearTimeout)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('hashchange', schedule)
    }
  }, [view])

  // A stale answer from the previous view never leaks into the new one.
  return state.view === view ? state.sub : null
}
