import { CheckCircle, XCircle } from '@phosphor-icons/react'

/** A do or don't list for a guideline. */
export function DirectionList({ kind, items }: { kind: 'do' | 'dont'; items: string[] }) {
  const Icon = kind === 'do' ? CheckCircle : XCircle
  return (
    <div className="rounded-site border border-edge bg-surface p-6">
      {/* h2: the lists sit straight under the view's h1. */}
      <h2 className={`mb-4 text-step-small font-bold tracking-eyebrow uppercase ${kind === 'do' ? 'text-do' : 'text-dont'}`}>{kind === 'do' ? 'Do' : "Don't"}</h2>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-step-0 text-text">
            <Icon className={`size-5 shrink-0 ${kind === 'do' ? 'text-do' : 'text-dont'}`} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
