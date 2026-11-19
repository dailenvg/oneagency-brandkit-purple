import { useMemo, useState } from 'react'
import { CONTRAST, type ContrastPair } from '../../data/tokens'
import { FilterTabs } from '../ui/FilterTabs'

type View = 'pass' | 'all'

const VIEWS: { id: View; label: string }[] = [
  { id: 'pass', label: 'AA pairs only' },
  { id: 'all', label: 'All pairs' },
]

const unique = (list: string[]) => [...new Set(list)]

function verdict(pair: ContrastPair) {
  if (pair.aaaNormal) return 'AAA'
  if (pair.aaNormal) return 'AA'
  if (pair.aaLarge) return 'Large'
  return 'Fail'
}

/** Text tokens down, grounds across, each cell drawn live with the real CSS variables. */
export function ContrastMatrix() {
  const [view, setView] = useState<View>('pass')
  const texts = useMemo(() => unique(CONTRAST.map((c) => c.text)), [])
  const grounds = useMemo(() => unique(CONTRAST.map((c) => c.background)), [])
  const lookup = useMemo(() => new Map(CONTRAST.map((c) => [`${c.text}|${c.background}`, c])), [])
  const passing = CONTRAST.filter((c) => c.aaNormal).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs label="Contrast pairs to show" layoutId="contrast-view" options={VIEWS} value={view} onChange={setView} controls="contrast-table" />
        <p className="text-step-small text-text-3">
          <span className="font-num text-text">{passing}</span> of {CONTRAST.length} pairs pass AA for body text (4.5:1). “Large” passes 3:1 only.
        </p>
      </div>
      <div className="scroll-strip overflow-x-auto rounded-site border border-edge" tabIndex={0} role="region" aria-label="Contrast matrix, scrolls sideways">
        <table id="contrast-table" className="w-full border-collapse text-step-small">
          <caption className="sr-only">Contrast of each text token on each ground token, with the WCAG 2.1 verdict.</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-surface p-3 text-left font-semibold text-text-2">
                Text ↓ / Ground →
              </th>
              {grounds.map((g) => (
                <th key={g} scope="col" className="min-w-24 bg-surface p-3 text-left font-code font-medium whitespace-nowrap text-text-2">
                  {g}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {texts.map((t) => (
              <tr key={t} className="border-t border-edge">
                <th scope="row" className="sticky left-0 z-10 bg-surface p-3 text-left font-code font-medium whitespace-nowrap text-text-2">
                  {t}
                </th>
                {grounds.map((g) => {
                  const pair = lookup.get(`${t}|${g}`)
                  const show = pair && (view === 'all' || pair.aaNormal)
                  return (
                    <td key={g} className="p-0">
                      {show ? (
                        <div className="flex h-full min-h-16 flex-col justify-between gap-1 p-2.5" style={{ background: `var(${g})`, color: `var(${t})` }}>
                          <span className="text-step-0 leading-none font-semibold">Aa</span>
                          <span className="font-num font-bold">
                            {pair.ratio.toFixed(1)} · {verdict(pair)}
                          </span>
                        </div>
                      ) : (
                        <div role="img" className="grid min-h-16 place-items-center text-text-4" aria-label={pair ? `Fails AA, ${pair.ratio.toFixed(1)} to 1` : 'Not measured'}>
                          <span aria-hidden>·</span>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
