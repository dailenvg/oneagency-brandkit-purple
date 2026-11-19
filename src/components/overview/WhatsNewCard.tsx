import { ArrowRight } from '@phosphor-icons/react'
import { WHATS_NEW } from '../../data/overview'
import { CheckBadge } from '../../kit/glass/CheckBadge'
import { KIT } from '../../lib/kit'
import { viewFor, viewHref } from '../../lib/views'
import { DashboardCard } from './DashboardCard'

/** What changed in this version, each line linking to where it lives. */
export function WhatsNewCard({ className }: { className?: string }) {
  return (
    <DashboardCard title={`What's new in v${KIT.version}`} className={className}>
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {WHATS_NEW.map((item) => (
          <li key={item.text} className="flex items-start gap-3">
            <CheckBadge size="sm" className="mt-0.5" />
            <span className="text-step--1 text-text-2">
              {item.text}{' '}
              {item.view !== 'overview' && (
                <a href={viewHref(item.view)} className="inline-flex items-center gap-1 font-semibold whitespace-nowrap text-accent underline-offset-4 hover:underline">
                  {viewFor(item.view).label}
                  <ArrowRight className="size-3.5" aria-hidden />
                </a>
              )}
            </span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  )
}
