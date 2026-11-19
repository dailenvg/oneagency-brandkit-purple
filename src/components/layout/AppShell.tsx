import { useCallback, useState } from 'react'
import { useMediaQuery } from '../../lib/hooks'
import { routeKey, useRoute } from '../../lib/router'
import { viewFor } from '../../lib/views'
import { Footer } from './Footer'
import { NavDrawer } from './NavDrawer'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { ViewOutlet } from './ViewOutlet'

/** Dashboard layout: fixed sidebar from lg, top bar and drawer below it; the routed view and the footer on the right. */
export function AppShell() {
  const route = useRoute()
  const current = route.view === 'not-found' ? null : route.view
  const key = routeKey(route)
  const desktop = useMediaQuery('(min-width: 1024px)')
  // The view the drawer was opened on: it never outlives a navigation or a resize up to the sidebar layout.
  const [openedOn, setOpenedOn] = useState<string | null>(null)
  const menuOpen = openedOn === key && !desktop
  const closeMenu = useCallback(() => setOpenedOn(null), [])

  return (
    <div className="min-h-svh">
      <aside aria-label="Sidebar" className="fixed inset-y-0 left-0 z-40 hidden w-sidebar border-r border-edge-soft bg-ground lg:block">
        <Sidebar current={current} layoutId="nav-active" />
      </aside>
      <TopBar menuOpen={menuOpen} onMenu={() => setOpenedOn(key)} current={current ? viewFor(current).label : 'Not found'} />
      <NavDrawer open={menuOpen} onClose={closeMenu} current={current} />
      <div className="lg:pl-sidebar">
        <main id="main" tabIndex={-1} className="min-h-[70svh] outline-none">
          <ViewOutlet route={route} />
        </main>
        <Footer />
      </div>
    </div>
  )
}
