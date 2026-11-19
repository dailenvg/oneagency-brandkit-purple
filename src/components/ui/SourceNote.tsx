import { Info } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

interface SourceNoteProps {
  title?: string
  children: ReactNode
  className?: string
}

/** Small aside for provenance and known conflicts between sources. */
export function SourceNote({ title = 'Source note', children, className }: SourceNoteProps) {
  return (
    <aside className={`flex gap-3 rounded-site border border-edge bg-surface p-4 text-step-small text-text-2 ${className ?? ''}`}>
      <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
      <div>
        <p className="font-semibold text-text">{title}</p>
        <div className="mt-1 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-text">{children}</div>
      </div>
    </aside>
  )
}
