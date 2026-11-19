import { useEffect, useRef } from 'react'
import { edgeFade, useScrollEdges } from '../../lib/hooks'
import { KIT } from '../../lib/kit'
import { viewHref, type ViewId } from '../../lib/views'
import { FullKitButton } from '../ui/FullKitButton'
import { BrandLogo } from './BrandLogo'
import { SidebarNav } from './SidebarNav'
import { ThemeToggle } from './ThemeToggle'

/** Height of the nav's edge fade, px (matches EDGE_FADE in lib/hooks and scroll-py-8). */
const NAV_FADE = 32

interface SidebarProps {
  current: ViewId | null
  layoutId: string
  onNavigate?: () => void
  /** The drawer has its own logo row with the close button. */
  showBrand?: boolean
}

/**
 * Lateral panel: logo and version, grouped views, the full-kit download and the theme switch. Only the nav scrolls
 * (short phones, short laptop screens): the brand row and the footer stay pinned, and a fade at the top or bottom edge
 * says there is more list behind it.
 */
export function Sidebar({ current, layoutId, onNavigate, showBrand = true }: SidebarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const edges = useScrollEdges(scrollRef, 'y')

  // On open (drawer), first paint and every navigation, bring the current view into the visible part of the list,
  // clear of the fades at either end.
  useEffect(() => {
    const el = scrollRef.current
    const active = el?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!el || !active) return
    const item = active.getBoundingClientRect()
    const box = el.getBoundingClientRect()
    if (item.bottom > box.bottom - NAV_FADE) el.scrollTop += item.bottom - box.bottom + NAV_FADE
    else if (item.top < box.top + NAV_FADE) el.scrollTop -= box.top + NAV_FADE - item.top
  }, [current])

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {showBrand && (
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <a href={viewHref('overview')} onClick={onNavigate} aria-label="ONE Agency brand kit, overview" className="flex min-h-touch items-center rounded-site-sm">
            <BrandLogo lockup="horizontal" alt="" eager className="h-6 w-auto" />
          </a>
          <span className="rounded-full border border-edge px-2 py-0.5 font-num text-step-small text-text-3">v{KIT.version}</span>
        </div>
      )}
      {/* scroll-py-8 keeps a focused item clear of the 32px fade when Tab scrolls the list. */}
      <div ref={scrollRef} className="scroll-strip min-h-0 flex-1 scroll-py-8 overflow-y-auto overscroll-contain px-3 py-2" style={edgeFade(edges, 'y')}>
        <SidebarNav current={current} layoutId={layoutId} onNavigate={onNavigate} />
      </div>
      <div className="flex shrink-0 items-center gap-2 border-t border-edge-soft px-4 pt-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <FullKitButton size="sm" label="Full kit" className="min-w-0 flex-1 whitespace-nowrap" />
        <ThemeToggle />
      </div>
    </div>
  )
}
