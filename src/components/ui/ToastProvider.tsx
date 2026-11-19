import { CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from '../../lib/motion'
import { ToastContext, type ToastApi } from '../../lib/toast'

interface Toast {
  id: number
  message: string
  tone: 'ok' | 'error'
}

const VISIBLE_MS = 2400
const MAX_TOASTS = 3

/** Toast region at the bottom of the screen. Messages are announced politely and leave on their own. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const notify = useCallback<ToastApi['notify']>((message, tone = 'ok') => {
    const id = ++nextId.current
    setToasts((list) => [...list.slice(-(MAX_TOASTS - 1)), { id, message, tone }])
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), VISIBLE_MS)
  }, [])

  const api = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-70 flex flex-col items-center gap-2 px-4">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.p
              key={t.id}
              layout
              variants={toast}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex items-center gap-2 rounded-full border border-edge bg-raised px-4 py-2.5 text-step-small font-medium text-text shadow-card"
            >
              {t.tone === 'ok' ? <CheckCircle className="size-4 shrink-0 text-do" aria-hidden /> : <WarningCircle className="size-4 shrink-0 text-dont" aria-hidden />}
              {t.message}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
