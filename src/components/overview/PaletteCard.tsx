import { motion } from 'motion/react'
import { TOKENS } from '../../data/tokens'
import { readableOn } from '../../lib/colour'
import { press } from '../../lib/motion'
import { useCopy } from '../../lib/toast'
import { DashboardCard } from './DashboardCard'

/** The core palette, in the order a layout reaches for it. */
const NAMES = ['--ground', '--rose', '--lilac', '--rose-deep', '--lilac-deep', '--lavender', '--paper', '--pos']

const SWATCHES = NAMES.flatMap((name) => {
  const token = TOKENS.find((t) => t.name === name)
  return token?.hex ? [{ name, hex: token.hex.toUpperCase() }] : []
})

/** The live signature gradient, as the site writes it. */
const GRADIENT = 'linear-gradient(90deg, var(--rose) 0%, var(--lilac) 100%)'

/** Palette strip: each chip copies its HEX; the gradient bar copies its CSS. */
export function PaletteCard({ className }: { className?: string }) {
  const copy = useCopy()
  return (
    <DashboardCard title="Palette" view="colour" linkLabel="All colour" className={className}>
      {/* Columns follow the card's own width (container query), so token names never truncate in a narrow card. */}
      <div className="@container">
        <ul className="grid grid-cols-2 gap-2 @lg:grid-cols-4">
          {SWATCHES.map((s) => {
            const ink = readableOn(s.hex) === 'ink'
            return (
              <li key={s.name}>
                <motion.button
                  type="button"
                  onClick={() => copy(s.hex, `${s.hex} (${s.name})`)}
                  aria-label={`Copy ${s.hex}, ${s.name}`}
                  className={`flex h-24 w-full flex-col justify-end gap-0.5 rounded-site-sm border border-edge p-2 text-left text-step-small ${ink ? 'text-ink focus-visible:outline-ink' : 'text-paper focus-visible:outline-paper'} focus-visible:-outline-offset-4`}
                  style={{ background: s.hex }}
                  {...press}
                >
                  <span className="truncate font-code font-semibold">{s.name}</span>
                  <span className="font-code">{s.hex.slice(1)}</span>
                </motion.button>
              </li>
            )
          })}
        </ul>
      </div>
      <motion.button
        type="button"
        onClick={() => copy(GRADIENT, '--accent-fill')}
        aria-label="Copy the signature gradient, --accent-fill"
        className="flex min-h-touch items-end rounded-site-sm border border-edge p-3 text-left font-code text-step-small font-semibold text-on-accent focus-visible:outline-text"
        style={{ background: 'var(--accent-fill)' }}
        {...press}
      >
        --accent-fill · rose to blue
      </motion.button>
      <p className="text-step-small text-text-3">Tap or click a colour to copy its HEX. Values are the live site&apos;s.</p>
    </DashboardCard>
  )
}
