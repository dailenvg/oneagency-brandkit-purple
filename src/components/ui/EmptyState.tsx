import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: Icon
  title: string
  children: ReactNode
  /** Recovery action or command. */
  action?: ReactNode
  tone?: 'empty' | 'error'
}

/** Empty or error panel with a recovery hint. */
export function EmptyState({ icon: IconComponent, title, children, action, tone = 'empty' }: EmptyStateProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className={`flex flex-col items-start gap-3 rounded-site border border-dashed p-6 sm:p-8 ${tone === 'error' ? 'border-dont/60 bg-surface' : 'border-edge-strong/50 bg-surface/60'}`}
    >
      <IconComponent className={`size-8 ${tone === 'error' ? 'text-dont' : 'text-info'}`} aria-hidden />
      <h3 className="text-step-1 font-semibold text-text">{title}</h3>
      <div className="max-w-prose text-step--1 text-text-2">{children}</div>
      {action}
    </div>
  )
}
