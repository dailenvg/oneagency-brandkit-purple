import { motion } from 'motion/react'
import { useState } from 'react'
import type { Move } from '../../data/motion-moves'
import { reveal } from '../../lib/motion'
import { ReplayButton } from '../ui/ReplayButton'
import { MoveDemo } from './MoveDemo'

/** One film move: live demo with replay, its values from motion.ts, and when to use it. */
export function MoveCard({ move }: { move: Move }) {
  const [run, setRun] = useState(0)
  return (
    <motion.article variants={reveal} className="flex flex-col overflow-hidden rounded-site border border-edge bg-surface">
      <div key={run} aria-hidden data-theme="dark" className="relative grid h-48 place-items-center overflow-hidden bg-ground px-6">
        <MoveDemo id={move.id} />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-step-1 font-semibold text-text">{move.name}</h3>
            <code className="font-code text-step-small text-text-3">{move.api}</code>
          </div>
          {move.id !== 'hold' && <ReplayButton onClick={() => setRun((n) => n + 1)} label={move.name} />}
        </header>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-step-small">
          {move.values.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-text-3">{k}</dt>
              <dd className="font-num text-text">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-auto border-t border-edge pt-4 text-step-small text-text-2">{move.use}</p>
      </div>
    </motion.article>
  )
}
