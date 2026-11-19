import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useOnScreen } from '../../lib/hooks'
import { out, wordRise } from '../../lib/motion'

const LINES = ['Convert visitors into leads', 'Convert leads into customers']
/** Seconds the first line sits before it leaves. */
const DWELL = 1.2

/** Out: the first line rises away, then the next line rises in (AnimatePresence, mode="wait"). */
export function OutDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const onScreen = useOnScreen(ref)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!onScreen || index) return
    const t = window.setTimeout(() => setIndex(1), DWELL * 1000)
    return () => window.clearTimeout(t)
  }, [onScreen, index])

  return (
    <div ref={ref} className="grid h-full place-items-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          className="text-center text-step-2 font-bold tracking-tight"
          variants={{ ...wordRise, ...out }}
          initial={index ? 'hidden' : false}
          animate="show"
          exit="exit"
        >
          {LINES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
