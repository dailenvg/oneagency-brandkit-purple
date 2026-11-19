import { X } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { MISUSE } from '../../data/logo-rules'
import { pressCard, reveal } from '../../lib/motion'
import { Reveal } from '../ui/Reveal'
import { MisuseExample } from './MisuseExample'

/** What not to do, each shown as a real rendering with a red cross. */
export function MisuseGrid() {
  return (
    <Reveal as="ul" stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {MISUSE.map((m) => (
        <motion.li key={m.id} variants={reveal} {...pressCard} className="overflow-hidden rounded-site border border-edge bg-surface">
          <div data-theme="dark" className="relative aspect-video overflow-hidden" aria-hidden>
            <MisuseExample id={m.id} />
            <span className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-dont text-paper shadow-card">
              <X className="size-4" weight="bold" />
            </span>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-text">{m.title}</h3>
            <p className="mt-1 text-step-small text-text-3">{m.detail}</p>
          </div>
        </motion.li>
      ))}
    </Reveal>
  )
}
