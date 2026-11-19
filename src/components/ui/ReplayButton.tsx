import { ArrowCounterClockwise } from '@phosphor-icons/react'
import { motion, useReducedMotion } from 'motion/react'
import { press } from '../../lib/motion'
import { buttonClass } from './button-styles'

/**
 * Replays a motion demo. `label` names what replays, for screen readers. Hidden under reduced motion: the demos show
 * their final frame there, so there is nothing to replay.
 */
export function ReplayButton({ onClick, label }: { onClick: () => void; label: string }) {
  const reduced = useReducedMotion()
  if (reduced) return null
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`Replay ${label}`}
      className={buttonClass('quiet', 'sm')}
      {...press}
    >
      <ArrowCounterClockwise aria-hidden />
      Replay
    </motion.button>
  )
}
