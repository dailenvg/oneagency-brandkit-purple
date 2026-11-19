import type { CreativeFormat } from '../../../data/ad-creative'
import { CheckBadge } from '../../../kit/glass/CheckBadge'
import { adText } from './ad-type'

/** Checklist with rose glass check badges, as in the reference ads. */
export function AdChecklist({ items, format }: { items: string[]; format: CreativeFormat }) {
  return (
    <ul className="flex w-fit flex-col gap-[0.5em] text-left text-balance" style={{ ...adText('body', format, format === 'story' ? 0.86 : 1), fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
      {items.map((item) => (
        <li key={item} className="flex items-center gap-[0.6em]">
          <CheckBadge size="sm" className="size-[1.3em]! [&>svg]:size-[0.7em]!" />
          {item}
        </li>
      ))}
    </ul>
  )
}
