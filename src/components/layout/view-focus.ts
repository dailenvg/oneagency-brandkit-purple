import { createContext, useContext, useEffect } from 'react'
import { parseHash } from '../../lib/router'
import { findSubsection, subAnchorId, type ViewId } from '../../lib/views'

/** True for a view mounted by a navigation (not the first page load): its h1 takes focus. */
export const ViewFocusContext = createContext(false)

/** The view a SubHeading sits in (set by Section), so the heading can carry its subsection anchor id. */
export const SectionViewContext = createContext<ViewId | null>(null)

/**
 * After a navigation, moves focus to the view's title (an element with tabIndex -1) so screen readers start there.
 * Not when the address names a subsection heading (#/colour/tints-and-shades): scrollToSubsection focuses that heading,
 * and the title must not take focus back after it.
 */
export function useFocusTitleOnNavigate(titleId: string) {
  const focusOnMount = useContext(ViewFocusContext)
  useEffect(() => {
    if (!focusOnMount) return
    const { route } = parseHash(window.location.hash)
    const sub = route.view !== 'not-found' && route.sub ? findSubsection(route.view, route.sub) : undefined
    if (sub && !sub.top) return
    document.getElementById(titleId)?.focus({ preventScroll: true })
  }, [focusOnMount, titleId])
}

/** Longest wait for a lazily loaded view to put the target heading in the DOM, ms. */
const WAIT_FOR_VIEW = 5000
/** After an instant jump into a view still settling (images, reveals), check the heading once more after this long, ms. */
const SETTLE_CHECK = 700

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Scrolls to a view's subsection and moves focus to its heading (or to the view's h1 for the opening block, or with no
 * subsection). Waits for the heading to exist, since views load lazily and mount after the previous one leaves.
 * Smooth within a view, instant on a view change or with reduced motion. The heading's scroll-margin clears the top
 * bar. Returns a cancel function.
 */
export function scrollToSubsection(view: ViewId, sub: string | undefined, { smooth = true, focus = true } = {}) {
  const entry = sub ? findSubsection(view, sub) : undefined
  const behavior: ScrollBehavior = smooth && !reducedMotion() ? 'smooth' : 'instant'

  if (!entry || entry.top) {
    window.scrollTo({ top: 0, behavior })
    if (focus) document.getElementById(`${view}-title`)?.focus({ preventScroll: true })
    return () => {}
  }

  const started = performance.now()
  let frame = 0
  let settle = 0
  const tick = () => {
    const heading = document.getElementById(subAnchorId(view, entry.id))
    // A link in the nav drawer fires while the drawer still holds its scroll lock (useModal), which cuts a smooth
    // scroll short: wait for the lock to go as well.
    if (!heading || document.body.style.overflow === 'hidden') {
      if (performance.now() - started < WAIT_FOR_VIEW) frame = requestAnimationFrame(tick)
      return
    }
    if (focus) heading.focus({ preventScroll: true })
    heading.scrollIntoView({ block: 'start', behavior })
    if (behavior === 'instant') {
      // Where the heading should sit: the page's scroll padding (top bar) plus the heading's own margin.
      const offset = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + (parseFloat(getComputedStyle(heading).scrollMarginTop) || 0)
      settle = window.setTimeout(() => {
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
        if (!atBottom && Math.abs(heading.getBoundingClientRect().top - offset) > 24) heading.scrollIntoView({ block: 'start', behavior: 'instant' })
      }, SETTLE_CHECK)
    }
  }
  frame = requestAnimationFrame(tick)
  return () => {
    cancelAnimationFrame(frame)
    clearTimeout(settle)
  }
}
