import { motion } from 'motion/react'
import { GLASS_COMPONENTS } from '../../data/glass-rules'
import { reveal } from '../../lib/motion'
import { CopyButton } from '../ui/CopyButton'
import { Reveal } from '../ui/Reveal'
import { ComponentDemo } from './ComponentDemo'

/** Every component in src/kit/glass/, live on the theme ground, with the call that draws it (one tap to copy). */
export function ComponentGallery() {
  return (
    <Reveal as="ul" stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {GLASS_COMPONENTS.map((c) => (
        <motion.li key={c.name} variants={reveal} className="flex flex-col overflow-hidden rounded-site border border-edge bg-surface">
          <div aria-hidden className="relative isolate grid h-48 place-items-center overflow-hidden bg-ground p-6">
            <ComponentDemo name={c.name} />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-5">
            <h3 className="font-code font-semibold text-text">{c.name}</h3>
            <p className="text-step-small text-text-2">{c.use}</p>
            <CopyButton value={c.code} description={`${c.name} usage`} className="mt-auto w-full" />
          </div>
        </motion.li>
      ))}
    </Reveal>
  )
}
