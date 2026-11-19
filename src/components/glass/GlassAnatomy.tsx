import { motion } from 'motion/react'
import { GLASS_ANATOMY, GLASS_BLUR } from '../../data/glass-rules'
import { GlassCard } from '../../kit/glass/GlassCard'
import { GlowGround } from '../../kit/glass/GlowGround'
import { reveal } from '../../lib/motion'
import { Reveal } from '../ui/Reveal'

/** Where each numbered marker sits on the diagram card (percent of the card box). */
const MARKERS = [
  { left: '96%', top: '6%' },
  { left: '55%', top: '55%' },
  { left: '14%', top: '10%' },
  { left: '6%', top: '72%' },
  { left: '50%', top: '112%' },
  { left: '100%', top: '100%' },
] as const

function Marker({ n }: { n: number }) {
  return (
    <span className="grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-text font-num text-step-small font-bold text-on-text shadow-card ring-2 ring-ground">
      {n}
    </span>
  )
}

/** Anatomy of a glass card: a live card with numbered markers, and the legend with values and tokens. */
export function GlassAnatomy() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <figure className="relative isolate grid place-items-center overflow-hidden rounded-site border border-edge bg-ground px-10 pt-14 pb-20">
        <div className="relative w-full max-w-sm">
          <GlowGround className="-bottom-12 left-1/2 -z-10 h-24 w-full -translate-x-1/2" />
          <GlassCard className="aspect-[4/3]" />
          {MARKERS.map((m, i) => (
            <span key={i} aria-hidden className="absolute" style={m}>
              <Marker n={i + 1} />
            </span>
          ))}
        </div>
        <figcaption className="sr-only">A glass card with six numbered markers, explained in the list beside it.</figcaption>
      </figure>
      <div className="flex flex-col gap-4">
        <Reveal as="ol" stagger className="flex flex-col gap-3">
          {GLASS_ANATOMY.map((a, i) => (
            <motion.li key={a.part} variants={reveal} className="flex gap-4 rounded-site border border-edge bg-surface p-4">
              <span aria-hidden className="shrink-0 pt-0.5">
                <span className="grid size-7 place-items-center rounded-full bg-text font-num text-step-small font-bold text-on-text">{i + 1}</span>
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-text">{a.part}</p>
                <p className="text-step-small text-text-2">{a.value}</p>
                <code className="font-code text-step-small text-text-3">{a.token}</code>
              </div>
            </motion.li>
          ))}
        </Reveal>
        <p className="text-step-small text-text-3">{GLASS_BLUR}</p>
      </div>
    </div>
  )
}
