import { ArrowRight } from '@phosphor-icons/react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { buttonClass, type ButtonVariant } from '../ui/button-styles'

const STATES = ['Rest', 'Hover', 'Focus', 'Pressed', 'Disabled'] as const
type State = (typeof STATES)[number]

interface Row {
  variant: ButtonVariant
  label: string
  source: 'live' | 'proposed'
  light: boolean
  /** Classes that pin each state for the static preview (mirrors button-styles.ts). */
  pinned: Record<Exclude<State, 'Rest' | 'Disabled'>, string>
}

const ROWS: Row[] = [
  {
    variant: 'primary',
    label: 'Primary: rose pill',
    source: 'live',
    light: false,
    pinned: { Hover: 'bg-transparent! text-lavender-text!', Focus: 'outline-2 outline-offset-3 outline-text', Pressed: 'bg-rose-deep! border-rose-deep!' },
  },
  {
    variant: 'secondary',
    label: 'Secondary: outline',
    source: 'live',
    light: false,
    pinned: { Hover: 'bg-text! text-on-text!', Focus: 'outline-2 outline-offset-3 outline-text', Pressed: 'bg-text-2! border-text-2! text-on-text!' },
  },
  {
    variant: 'on-light',
    label: 'On light: ink pill',
    source: 'proposed',
    light: true,
    pinned: { Hover: 'bg-transparent! text-ink!', Focus: 'outline-2 outline-offset-3 outline-ink', Pressed: 'bg-ink-2! border-ink-2!' },
  },
]

function Pinned({ row, state }: { row: Row; state: State }) {
  const extra = state === 'Rest' || state === 'Disabled' ? '' : row.pinned[state]
  return (
    <span aria-hidden className={`${buttonClass(row.variant, 'sm', extra)} pointer-events-none whitespace-nowrap ${state === 'Disabled' ? 'opacity-45' : ''}`}>
      Call to action
    </span>
  )
}

/** Each CTA style in every state, pinned for comparison, plus a live one to try. */
export function CtaStates() {
  return (
    <div className="scroll-strip overflow-x-auto rounded-site border border-edge" tabIndex={0} role="region" aria-label="Button states, scrolls sideways">
      <table className="w-full border-collapse text-step-small">
        <caption className="sr-only">CTA styles by state: rest, hover, focus, pressed, disabled, and a live button.</caption>
        <thead className="bg-surface text-text-2">
          <tr>
            <th scope="col" className="p-3 text-left font-semibold">
              Style
            </th>
            {[...STATES, 'Try it'].map((s) => (
              <th key={s} scope="col" className="p-3 text-left font-semibold">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.variant} data-theme={row.light ? 'light' : 'dark'} className={`border-t border-edge ${row.light ? 'bg-paper' : 'bg-ground'}`}>
              <th scope="row" className={`min-w-40 p-4 text-left font-semibold ${row.light ? 'text-ink' : 'text-text'}`}>
                <span className="block">{row.label}</span>
                <span className="mt-1.5 inline-block">
                  <Badge>{row.source === 'live' ? 'Live site' : 'Proposed'}</Badge>
                </span>
              </th>
              {STATES.map((s) => (
                <td key={s} className="p-4">
                  <Pinned row={row} state={s} />
                </td>
              ))}
              <td className="p-4">
                <Button variant={row.variant} size="sm" className="whitespace-nowrap">
                  Call to action <ArrowRight className="size-4" aria-hidden />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
