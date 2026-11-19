import { motion, useReducedMotion } from 'motion/react'
import { useRef, type KeyboardEvent } from 'react'
import { edgeFade, useScrollEdges } from '../../lib/hooks'
import { spring } from '../../lib/motion'

export interface FilterOption<T extends string> {
  id: T
  label: string
  count?: number
}

interface FilterTabsProps<T extends string> {
  options: FilterOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Accessible name of the group, e.g. "Filter copy by group". */
  label: string
  /** Unique per instance: the active pill animates between tabs with this layoutId. */
  layoutId: string
  /** id of the panel the tabs control. */
  controls?: string
}

/**
 * Segmented filter. Roving tab index with arrow keys, Home and End; the active pill slides between options (layoutId).
 * Scrolls horizontally when it does not fit.
 */
export function FilterTabs<T extends string>({ options, value, onChange, label, layoutId, controls }: FilterTabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const listRef = useRef<HTMLDivElement>(null)
  const edges = useScrollEdges(listRef)
  const reduced = useReducedMotion()

  const select = (i: number) => {
    onChange(options[i].id)
    // Bring a half-hidden tab fully into the strip (phones) without scrolling the page.
    refs.current[i]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduced ? 'auto' : 'smooth' })
  }

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const last = options.length - 1
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: last }[e.key]
    if (next === undefined) return
    e.preventDefault()
    const i = next < 0 ? last : next > last ? 0 : next
    select(i)
    refs.current[i]?.focus()
  }

  return (
    <div ref={listRef} role="tablist" aria-label={label} className="scroll-strip -mx-1 flex max-w-full gap-1 overflow-x-auto p-1" style={edgeFade(edges)}>
      {options.map((option, i) => {
        const active = option.id === value
        return (
          <button
            key={option.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={controls}
            tabIndex={active ? 0 : -1}
            onClick={() => select(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
            // The focused tab is the rose one (roving tab index), so the ring is white and sits 1px out to fit the strip's 4px padding.
            className={`relative inline-flex min-h-touch shrink-0 items-center gap-1.5 rounded-full px-4 text-step-small font-semibold transition-colors focus-visible:outline-offset-1 focus-visible:outline-text ${
              active ? 'text-on-accent' : 'text-text-2 hover:bg-surface-2 hover:text-text'
            }`}
          >
            {active && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-full bg-rose" transition={spring.layout} aria-hidden />}
            <span className="relative">{option.label}</span>
            {option.count !== undefined && <span className={`relative font-num ${active ? 'text-on-accent' : 'text-text-3'}`}>{option.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
