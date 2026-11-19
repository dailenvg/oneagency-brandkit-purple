import { Check, Copy } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState, type Ref } from 'react'
import type { CopyLine } from '../../data/copy'
import { fade, swap } from '../../lib/motion'
import { useCopy } from '../../lib/toast'

const CONFIRM_MS = 1400

interface CopyLineItemProps {
  line: CopyLine
  /** Forwarded so AnimatePresence popLayout can measure the row. */
  ref?: Ref<HTMLLIElement>
}

/** One copy-bank line: the whole row copies the text; source and date sit underneath. */
export function CopyLineItem({ line, ref }: CopyLineItemProps) {
  const copy = useCopy()
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!done) return
    const t = window.setTimeout(() => setDone(false), CONFIRM_MS)
    return () => window.clearTimeout(t)
  }, [done])

  return (
    <motion.li ref={ref} layout variants={swap} initial="hidden" animate="show" exit="exit">
      <button
        type="button"
        onClick={async () => {
          if (await copy(line.text, 'the line')) setDone(true)
        }}
        className="group flex w-full items-start gap-4 rounded-site border border-edge bg-surface p-5 text-left transition-colors hover:border-edge-strong hover:bg-raised active:bg-surface-2"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-step-1 font-semibold text-text text-pretty">{line.text}</span>
          <span className="flex flex-wrap gap-x-3 gap-y-1 text-step-small text-text-3">
            <span>{line.source}</span>
            <span aria-hidden>·</span>
            <span className="font-num">{line.date}</span>
          </span>
          {line.note && <span className="text-step-small text-text-2">{line.note}</span>}
        </span>
        <span className="grid size-touch shrink-0 place-items-center rounded-full border border-edge text-text-3 transition-colors group-hover:border-accent group-hover:text-accent" aria-hidden>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={done ? 'done' : 'copy'} variants={fade} initial="hidden" animate="show" exit="exit">
              {done ? <Check className="size-5 text-do" /> : <Copy className="size-5" />}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="sr-only">Copy this line</span>
      </button>
    </motion.li>
  )
}
