import { CheckCircle, User } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { DEPTH_RULES } from '../../data/glass-rules'
import { CheckBadge } from '../../kit/glass/CheckBadge'
import { GlassCard } from '../../kit/glass/GlassCard'
import { GlowGround } from '../../kit/glass/GlowGround'
import { HalftoneArc } from '../../kit/glass/HalftoneArc'
import { reveal } from '../../lib/motion'
import { Reveal } from '../ui/Reveal'

/** Depth stack rules beside the profile stack from the reference ads, built with GlassCard depth={2}. */
export function DepthStack() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div aria-hidden className="relative isolate grid place-items-center overflow-hidden rounded-site border border-edge bg-ground px-10 py-16">
        <HalftoneArc className="absolute -top-6 left-1/2 -z-10 w-[120%] max-w-none -translate-x-1/2" />
        <div className="relative w-48 sm:w-56">
          <GlowGround className="-bottom-10 left-1/2 -z-10 h-20 w-full -translate-x-1/2" />
          <GlassCard depth={2} className="grid aspect-square place-items-center">
            <User className="glass-icon size-20" weight="fill" />
          </GlassCard>
          <CheckBadge size="lg" className="absolute -right-6 -bottom-6" />
        </div>
      </div>
      <Reveal as="ul" stagger className="flex flex-col gap-3">
        {DEPTH_RULES.map((r) => (
          <motion.li key={r} variants={reveal} className="flex gap-3 text-step-0 text-text-2">
            <CheckCircle className="mt-1 size-5 shrink-0 text-accent" aria-hidden />
            {r}
          </motion.li>
        ))}
      </Reveal>
    </div>
  )
}
