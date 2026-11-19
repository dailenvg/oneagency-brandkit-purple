import { Check, Copy } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { fade, press } from '../../lib/motion'
import { useCopy } from '../../lib/toast'

interface CopyButtonProps {
  /** The text that lands on the clipboard. */
  value: string
  /** Visible label; defaults to the value. */
  label?: string
  /** What the toast and screen readers call it, e.g. "HEX for --rose". */
  description?: string
  className?: string
}

const CONFIRM_MS = 1400

/** Click-to-copy chip. The icon flips to a check for a moment; the toast confirms. */
export function CopyButton({ value, label, description, className }: CopyButtonProps) {
  const copy = useCopy()
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!done) return
    const t = window.setTimeout(() => setDone(false), CONFIRM_MS)
    return () => window.clearTimeout(t)
  }, [done])

  return (
    <motion.button
      type="button"
      onClick={async () => {
        if (await copy(value, description ?? value)) setDone(true)
      }}
      // Starts with the visible text (WCAG 2.5.3 label in name), then says what it is.
      aria-label={description ? `${label ?? value}, copy ${description}` : `Copy ${value}`}
      className={`group inline-flex min-h-touch items-center gap-2 rounded-site-sm border border-edge bg-surface px-3 text-left font-code text-step-small text-text-2 transition-colors hover:border-edge-strong hover:text-text active:bg-surface-2 ${className ?? ''}`}
      {...press}
    >
      <span className="min-w-0 truncate">{label ?? value}</span>
      <span className="relative grid size-4 shrink-0 place-items-center" aria-hidden>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={done ? 'done' : 'copy'} variants={fade} initial="hidden" animate="show" exit="exit" className="grid place-items-center">
            {done ? <Check className="size-4 text-do" /> : <Copy className="size-4 text-text-3 group-hover:text-accent" />}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  )
}
