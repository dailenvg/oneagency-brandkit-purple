import { IconContext } from '@phosphor-icons/react'
import { MotionConfig } from 'motion/react'
import type { MouseEvent } from 'react'
import { AppShell } from './components/layout/AppShell'
import { ToastProvider } from './components/ui/ToastProvider'
import { parseHash } from './lib/router'
import { subAnchorId } from './lib/views'

/**
 * Focuses the current subsection's heading when the address names one (#/logo/clear-space), else the view's title
 * (its h1 is script-focusable), else the main region, without touching the hash, which drives the routes. Screen
 * readers start where a navigation lands.
 */
function skipToMain(e: MouseEvent) {
  e.preventDefault()
  const { route } = parseHash(window.location.hash)
  const sub = route.view !== 'not-found' && route.sub ? document.getElementById(subAnchorId(route.view, route.sub)) : null
  const target = sub ?? document.querySelector<HTMLElement>('#main h1[tabindex="-1"]') ?? document.getElementById('main')
  target?.focus({ preventScroll: true })
  target?.scrollIntoView({ block: 'start' })
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <IconContext.Provider value={{ weight: 'bold' }}>
        <ToastProvider>
          <a
            href="#main"
            onClick={skipToMain}
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-90 focus:rounded-full focus:bg-rose focus:px-4 focus:py-2 focus:font-semibold focus:text-on-accent"
          >
            Skip to content
          </a>
          <AppShell />
        </ToastProvider>
      </IconContext.Provider>
    </MotionConfig>
  )
}
