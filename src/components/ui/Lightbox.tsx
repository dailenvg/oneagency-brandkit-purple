import { X } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { backdrop, panel, press } from '../../lib/motion'
import { iconButtonClass } from './button-styles'

interface LightboxProps {
  open: boolean
  onClose: () => void
  /** Dialog title, shown and used as the accessible name. */
  title: string
  children: ReactNode
}

const FOCUSABLE = 'a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])'

/** Modal viewer: Escape or the backdrop closes it, focus stays inside and returns to the opener. */
export function Lightbox({ open, onClose, title, children }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      opener?.focus()
    }
  }, [open])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') return onClose()
    if (e.key !== 'Tab' || !dialogRef.current) return
    const items = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const [first, last] = [items[0], items[items.length - 1]]
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first?.focus()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="lightbox"
          className="fixed inset-0 z-80 flex items-center justify-center bg-void/85 p-4 backdrop-blur-sm sm:p-8"
          variants={backdrop}
          initial="hidden"
          animate="show"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            // Focusable (not in the tab order) so a click on the image keeps focus inside and Escape still closes.
            tabIndex={-1}
            onKeyDown={onKeyDown}
            onClick={(e) => e.stopPropagation()}
            variants={panel}
            className={`flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-site border border-edge bg-surface shadow-card outline-none`}
          >
            <header className="flex items-center justify-between gap-4 border-b border-edge px-4 py-2 sm:px-6">
              <h2 id={titleId} className="truncate text-step-0 font-semibold">
                {title}
              </h2>
              <motion.button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={iconButtonClass('ghost')}
                {...press}
              >
                <X aria-hidden />
              </motion.button>
            </header>
            {/* Keyboard-scrollable: true-size ads are wider than a phone. */}
            <div tabIndex={0} role="region" aria-labelledby={titleId} className="scroll-strip min-h-0 flex-1 overflow-auto p-4 focus-visible:-outline-offset-4 sm:p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
