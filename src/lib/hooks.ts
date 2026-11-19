import { useEffect, useState, useSyncExternalStore, type CSSProperties, type RefObject } from 'react'

/**
 * True while the element is on screen and the tab is visible. Gate endless loops on this so off-screen motion never
 * competes with scrolling for frames.
 */
export function useOnScreen<T extends Element>(ref: RefObject<T | null>, margin = '0px') {
  const [onScreen, setOnScreen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  const visible = useSyncExternalStore(
    (onChange) => {
      document.addEventListener('visibilitychange', onChange)
      return () => document.removeEventListener('visibilitychange', onChange)
    },
    () => document.visibilityState === 'visible',
  )
  return onScreen && visible
}

export type ScrollAxis = 'x' | 'y'

/**
 * Whether a scroller has hidden content before (start) or after (end) what is showing, along `axis` (horizontal strips
 * by default; "y" for the sidebar nav). Drives the fade edges that tell people a region scrolls.
 */
export function useScrollEdges<T extends HTMLElement>(ref: RefObject<T | null>, axis: ScrollAxis = 'x') {
  const [edges, setEdges] = useState({ start: false, end: false })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const [pos, view, total] = axis === 'x' ? [el.scrollLeft, el.clientWidth, el.scrollWidth] : [el.scrollTop, el.clientHeight, el.scrollHeight]
      const start = pos > 1
      const end = pos + view < total - 1
      setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    Array.from(el.children).forEach((child) => ro.observe(child))
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [ref, axis])
  return edges
}

/** Fade width for scroll edges, px (8pt grid). */
const EDGE_FADE = 32

/** Mask that fades whichever edge of a scroller has more content behind it (left/right for "x", top/bottom for "y"). */
export function edgeFade({ start, end }: { start: boolean; end: boolean }, axis: ScrollAxis = 'x'): CSSProperties {
  if (!start && !end) return {}
  const mask = `linear-gradient(${axis === 'x' ? 'to right' : 'to bottom'}, ${start ? 'transparent' : '#000'} 0, #000 ${EDGE_FADE}px, #000 calc(100% - ${EDGE_FADE}px), ${end ? 'transparent' : '#000'} 100%)`
  return { maskImage: mask, WebkitMaskImage: mask }
}

/** Live result of a CSS media query. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => matchMedia(query).matches,
  )
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])'

/**
 * Modal behaviour for an open dialog: locks page scroll, moves focus inside (to `initialFocus` or the first control),
 * keeps Tab and Shift+Tab inside, closes on Escape, and returns focus to whatever opened it.
 */
export function useModal<T extends HTMLElement>(open: boolean, containerRef: RefObject<T | null>, onClose: () => void, initialFocus?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusables = () => [...(containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
    ;(initialFocus?.current ?? focusables()[0])?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (!items.length) return
      const [first, last] = [items[0], items[items.length - 1]]
      const inside = containerRef.current?.contains(document.activeElement)
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      opener?.focus({ preventScroll: true })
    }
  }, [open, containerRef, onClose, initialFocus])
}
