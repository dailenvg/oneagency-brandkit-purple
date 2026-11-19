import { ArrowRight } from '@phosphor-icons/react'
import { useId, type ReactNode } from 'react'
import { GlassCard } from '../../kit/glass/GlassCard'
import { viewHref, type ViewId } from '../../lib/views'
import { buttonClass } from '../ui/button-styles'

interface DashboardCardProps {
  title: string
  /** View the card's "open" link goes to. */
  view?: ViewId
  /** Visible link text; the card title completes its accessible name. */
  linkLabel?: string
  className?: string
  children: ReactNode
}

/** An Overview card: glass, an h2, an optional link to the full view, then the content. */
export function DashboardCard({ title, view, linkLabel = 'Open', className, children }: DashboardCardProps) {
  const headingId = useId()
  return (
    <GlassCard as="section" aria-labelledby={headingId} className={`flex flex-col gap-5 p-5 sm:p-6 ${className ?? ''}`}>
      <header className="flex min-h-touch items-center justify-between gap-3">
        <h2 id={headingId} className="text-step-1 font-semibold tracking-tight text-text">
          {title}
        </h2>
        {view && (
          <a
            href={viewHref(view)}
            className={buttonClass('link', 'sm', '-me-3')}
          >
            {linkLabel}
            <span className="sr-only">: {title}</span>
            <ArrowRight aria-hidden />
          </a>
        )}
      </header>
      {children}
    </GlassCard>
  )
}
