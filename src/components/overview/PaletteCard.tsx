import { motion } from 'motion/react'
import { BRAND_ORDER } from '../../data/colour-rules'
import { PALETTE_PHOTOS } from '../../data/imagery-photos'
import { TOKENS } from '../../data/tokens'
import { readableOn } from '../../lib/colour'
import { photoZoom, pressCard } from '../../lib/motion'
import { useCopy } from '../../lib/toast'
import { DashboardCard } from './DashboardCard'

/** The brand palette as on the Colour view (lightest to darkest), each colour over the photo it pairs with. */
const SWATCHES = BRAND_ORDER.flatMap((name) => {
  const token = TOKENS.find((t) => t.name === name)
  return token?.hex ? [{ name, label: token.label ?? name, hex: token.hex.toUpperCase(), photo: PALETTE_PHOTOS[name] }] : []
})

/** The signature gradient, as tokens.css writes it. */
const GRADIENT = 'linear-gradient(90deg, var(--mint) 0%, var(--violet) 100%)'

/** Palette: each colour copies its HEX; the gradient bar copies its CSS. */
export function PaletteCard({ className }: { className?: string }) {
  const copy = useCopy()
  return (
    <DashboardCard title="Palette" view="colour" linkLabel="All colour" className={className}>
      {/* Columns follow the card's own width (container query), so names never truncate in a narrow card. */}
      <div className="@container">
        <ul className="grid grid-cols-2 gap-2 @md:grid-cols-4">
          {SWATCHES.map((s) => {
            const ink = readableOn(s.hex) === 'ink'
            return (
              <li key={s.name}>
                <motion.button
                  type="button"
                  onClick={() => copy(s.hex, `${s.hex} (${s.label})`)}
                  aria-label={`${s.label} ${s.hex}, copy HEX`}
                  whileHover="hover"
                  whileTap={pressCard.whileTap}
                  className={`flex w-full flex-col overflow-hidden rounded-site-sm text-left text-step-small ring-1 ring-edge-soft ${ink ? 'text-ink focus-visible:outline-ink' : 'text-paper focus-visible:outline-paper'} focus-visible:-outline-offset-4`}
                >
                  <span className="flex h-20 w-full flex-col justify-end gap-0.5 p-2.5" style={{ background: s.hex }}>
                    <span className="truncate font-semibold">{s.label}</span>
                    <span className="font-code opacity-80">{s.hex}</span>
                  </span>
                  {s.photo && (
                    <span className="block h-10 w-full overflow-hidden" style={{ background: s.hex }} aria-hidden>
                      <motion.span variants={photoZoom} initial="rest" className="block size-full">
                        {/* A plain img, not SmartImage: its Retry button cannot sit inside this button. On error the colour shows. */}
                        <img
                          src={s.photo.url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="size-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.visibility = 'hidden'
                          }}
                        />
                      </motion.span>
                    </span>
                  )}
                </motion.button>
              </li>
            )
          })}
        </ul>
      </div>
      <motion.button
        type="button"
        onClick={() => copy(GRADIENT, '--gradient')}
        aria-label="Copy the signature gradient, --gradient"
        className="flex min-h-touch items-end rounded-site-sm p-3 text-left font-code text-step-small font-semibold text-on-accent ring-1 ring-edge-soft focus-visible:outline-text"
        style={{ background: 'var(--gradient)' }}
        whileHover={{ scale: 1.01 }}
        whileTap={pressCard.whileTap}
      >
        --gradient · Mint to Violet
      </motion.button>
      <p className="text-step-small text-text-3">Tap or click a colour to copy its HEX.</p>
    </DashboardCard>
  )
}
