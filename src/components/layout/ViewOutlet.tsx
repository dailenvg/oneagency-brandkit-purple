import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { fade, page } from '../../lib/motion'
import { routeKey, type Route } from '../../lib/router'
import { documentTitle, viewFor } from '../../lib/views'
import { NotFoundView } from './NotFoundView'
import { ViewErrorBoundary } from './ViewErrorBoundary'
import { scrollToSubsection, ViewFocusContext } from './view-focus'
import { VIEW_COMPONENTS } from './view-loaders'
import { ViewSkeleton } from './ViewSkeleton'

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'instant' })

/**
 * The routed view. The old view leaves, the page jumps to the top, then the new one comes in (mode="wait"); with
 * reduced motion both are plain fades. Views load lazily; a view reached by navigation focuses its h1.
 */
export function ViewOutlet({ route }: { route: Route }) {
  const reduced = useReducedMotion()
  const key = routeKey(route)
  const [firstKey] = useState(key)
  // Derived state: flips once, on the first navigation away from the view the page loaded on.
  const [navigated, setNavigated] = useState(false)
  if (!navigated && key !== firstKey) setNavigated(true)
  const title = route.view === 'not-found' ? 'Not found' : viewFor(route.view).title
  const View = route.view === 'not-found' ? null : VIEW_COMPONENTS[route.view]

  useEffect(() => {
    document.title = documentTitle(title)
  }, [title])

  // Subsections (#/logo/clear-space). The key stays per view, so moving between subsections of one view never remounts
  // it or replays the page transition: it scrolls smoothly and focuses the heading. Arriving from another view waits
  // for the new view to mount, then jumps. Leaving a subsection for the bare view (Back) returns to the top.
  const view = route.view === 'not-found' ? null : route.view
  const sub = route.view === 'not-found' ? undefined : route.sub
  const initial = useRef({ view, sub })
  const last = useRef({ key, sub })

  // First load on a deep link: jump there once the view is in, without stealing focus.
  useEffect(() => {
    const { view: v, sub: s } = initial.current
    if (v && s) return scrollToSubsection(v, s, { smooth: false, focus: false })
  }, [])

  useEffect(() => {
    const prev = last.current
    if (prev.key === key && prev.sub === sub) return
    last.current = { key, sub }
    if (!view) return
    if (prev.key !== key) return sub ? scrollToSubsection(view, sub, { smooth: false }) : undefined
    return scrollToSubsection(view, sub)
  }, [key, sub, view])

  return (
    <AnimatePresence mode="wait" onExitComplete={scrollToTop}>
      <motion.div key={key} variants={reduced ? fade : page} initial="hidden" animate="show" exit="exit">
        <ViewFocusContext.Provider value={navigated}>
          <ViewErrorBoundary>
            <Suspense fallback={<ViewSkeleton />}>{View ? <View /> : <NotFoundView path={route.view === 'not-found' ? route.path : ''} />}</Suspense>
          </ViewErrorBoundary>
        </ViewFocusContext.Provider>
      </motion.div>
    </AnimatePresence>
  )
}
