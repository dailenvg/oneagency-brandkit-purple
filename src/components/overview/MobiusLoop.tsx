import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { loadScriptOnce } from '../../lib/load-script'
import { duration, ease } from '../../lib/motion'
import { useTheme } from '../../lib/theme'

/** ConversionIQ's key visual, vendored byte for byte. Loaded only when the Overview mounts. */
const SRC = '/vendor/ciq/ciq-loop.js'

type Status = 'loading' | 'ready' | 'error'

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

/**
 * The Möbius loop behind the Overview hero, used as supplied: look "energy", shape "mobius", placed right, on the
 * hub's own ground (background "none"), in the hub's theme. It stops itself off screen and holds still for reduced
 * motion; this wrapper also pauses it while the tab is hidden, and unmounting the view removes it. If the script
 * fails, the hero simply goes without it.
 */
export function MobiusLoop({ className, onStatus, paused = false }: { className?: string; onStatus?: (status: Status) => void; paused?: boolean }) {
  const theme = useTheme()
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const [status, setStatus] = useState<Status>('loading')
  const hidden = useSyncExternalStore(subscribeVisibility, () => document.visibilityState === 'hidden')

  useEffect(() => {
    let live = true
    loadScriptOnce(SRC)
      .then(() => customElements.whenDefined('ciq-loop'))
      .then(
        () => live && setStatus('ready'),
        () => live && setStatus('error'),
      )
    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    onStatus?.(status)
  }, [status, onStatus])

  // Never touch "paused" under reduced motion: removing it would start the loop the component chose to hold still.
  // `paused` is the visitor's own pause (WCAG 2.2.2: endless motion needs a way to stop it).
  useEffect(() => {
    if (!reduced) ref.current?.toggleAttribute('paused', hidden || paused)
  }, [hidden, paused, reduced, status])

  if (status !== 'ready') return null
  return (
    <motion.div aria-hidden className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: duration.page, ease: ease.outCubic }}>
      <ciq-loop ref={ref} look="energy" shape="mobius" place="right" background="none" theme={theme} className="block size-full" />
    </motion.div>
  )
}
