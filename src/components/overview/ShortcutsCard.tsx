import { ArrowRight } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { VIEW_SUMMARIES } from '../../data/overview'
import { pressCard } from '../../lib/motion'
import { VIEWS, viewHref } from '../../lib/views'
import { preloadView } from '../layout/view-loaders'
import { DashboardCard } from './DashboardCard'

const SHORTCUTS = VIEWS.filter((v) => v.id !== 'overview')

/** A tile for every view: icon, name and what is in it. */
export function ShortcutsCard({ className }: { className?: string }) {
  return (
    <DashboardCard title="Every view" className={className}>
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {SHORTCUTS.map((view) => {
          const IconComponent = view.icon
          return (
            <li key={view.id}>
              <motion.a
                href={viewHref(view.id)}
                onPointerEnter={() => preloadView(view.id)}
                onFocus={() => preloadView(view.id)}
                className="group flex h-full min-h-touch gap-3 rounded-site-sm border border-edge bg-surface/60 p-3 transition-colors hover:border-accent hover:bg-surface active:bg-surface-2"
                {...pressCard}
              >
                <IconComponent className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex items-center gap-1 font-semibold text-text">
                    {view.label}
                    <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden />
                  </span>
                  <span className="text-step-small text-text-3">{VIEW_SUMMARIES[view.id]}</span>
                </span>
              </motion.a>
            </li>
          )
        })}
      </ul>
    </DashboardCard>
  )
}
