import { X } from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import { useModal } from '../../lib/hooks'
import { KIT } from '../../lib/kit'
import { backdrop, drawer, fade, press } from '../../lib/motion'
import type { ViewId } from '../../lib/views'
import { iconButtonClass } from '../ui/button-styles'
import { BrandLogo } from './BrandLogo'
import { Sidebar } from './Sidebar'

interface NavDrawerProps {
  open: boolean
  onClose: () => void
  current: ViewId | null
}

/** The sidebar as a modal drawer below lg: focus trapped, Escape and the overlay close it, focus returns to the menu button. */
export function NavDrawer({ open, onClose, current }: NavDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()
  useModal(open, panelRef, onClose, closeRef)

  return (
    <AnimatePresence>
      {open && (
        <div key="drawer" className="fixed inset-0 z-60 lg:hidden">
          <motion.div className="absolute inset-0 bg-void/70 backdrop-blur-sm" variants={backdrop} initial="hidden" animate="show" exit="exit" onClick={onClose} aria-hidden />
          <motion.div
            ref={panelRef}
            id="nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            variants={reduced ? fade : drawer}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute inset-y-0 left-0 flex w-[min(320px,86vw)] flex-col border-r border-edge bg-ground shadow-card"
          >
            <div className="flex shrink-0 items-center gap-3 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
              <BrandLogo lockup="horizontal" alt="ONE Agency" className="h-5 w-auto" />
              <span className="rounded-full border border-edge px-2 py-0.5 font-num text-step-small text-text-3">v{KIT.version}</span>
              <motion.button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className={iconButtonClass('ghost', 'ml-auto')}
                {...press}
              >
                <X aria-hidden />
              </motion.button>
            </div>
            {/* Only the nav list scrolls; the logo row above and the Full kit + theme row below stay pinned. */}
            <div className="flex min-h-0 flex-1 flex-col">
              <Sidebar current={current} layoutId="nav-active-drawer" onNavigate={onClose} showBrand={false} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
