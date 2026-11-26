import { Check, Copy } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { PALETTE_PHOTOS } from '../../data/imagery-photos'
import type { ColourToken } from '../../data/tokens'
import { readableOn } from '../../lib/colour'
import { fade, photoZoom, reveal } from '../../lib/motion'
import { useCopy } from '../../lib/toast'
import { SmartImage } from '../ui/SmartImage'

const CONFIRM_MS = 1400

/**
 * A brand colour as a tall card: the colour field with its name set vertically, HEX and RGB rows that copy on click,
 * and the paired photo underneath (zooms gently on hover). Only the name and the two values: roles and sources live in
 * the section notes.
 */
export function BrandColourCard({ token }: { token: ColourToken }) {
  const hex = token.hex!.toUpperCase()
  const rgb = token.rgb!.replace(/^rgba?\(|\)$/g, '')
  const name = token.label ?? token.name
  const ink = readableOn(hex) === 'ink'
  const photo = PALETTE_PHOTOS[token.name]

  return (
    <motion.li variants={reveal} whileHover="hover" className="flex flex-col overflow-hidden rounded-site shadow-card ring-1 ring-edge-soft">
      <div
        className={`@container flex min-h-[19rem] flex-1 flex-col justify-between gap-8 p-4 sm:min-h-[24rem] sm:p-6 ${ink ? 'text-ink' : 'text-paper'}`}
        style={{ background: hex }}
      >
        {/* Vertical, reading upward from the baseline, as on the Nova palette boards. */}
        <h3 className="display self-start text-[clamp(1.6rem,1.1rem+1.5vw,2.4rem)] leading-none [writing-mode:vertical-rl] rotate-180">{name}</h3>
        <dl className="-mx-2 flex flex-col">
          <ValueRow label="HEX" value={hex} description={`HEX for ${name}`} ink={ink} />
          <ValueRow label="RGB" value={rgb} description={`RGB for ${name}`} ink={ink} />
        </dl>
      </div>
      {photo && (
        <div className="aspect-[4/3] overflow-hidden" style={{ background: hex }}>
          <motion.div variants={{ ...photoZoom, show: photoZoom.rest }} className="size-full">
            <SmartImage src={photo.url} alt="" width={photo.width} height={photo.height} className="size-full" imgClassName="size-full object-cover" />
          </motion.div>
        </div>
      )}
    </motion.li>
  )
}

/** One label and value pair; the whole row copies the value. The icon flips to a check for a moment. */
function ValueRow({ label, value, description, ink }: { label: string; value: string; description: string; ink: boolean }) {
  const copy = useCopy()
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!done) return
    const t = window.setTimeout(() => setDone(false), CONFIRM_MS)
    return () => window.clearTimeout(t)
  }, [done])

  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <motion.button
          type="button"
          onClick={async () => {
            if (await copy(value, description)) setDone(true)
          }}
          // Starts with the visible text (WCAG 2.5.3 label in name), then says what it copies.
          aria-label={`${label} ${value}, copy ${description}`}
          // Narrow cards stack the label over the value, so the value never truncates; from 12rem they sit on one line.
          className={`group relative flex min-h-touch w-full flex-col items-start justify-center rounded-site-sm py-1 ps-2 pe-8 text-left text-step--1 transition-colors focus-visible:-outline-offset-2 @[12rem]:flex-row @[12rem]:items-center @[12rem]:justify-start @[12rem]:gap-3 ${
            ink ? 'hover:bg-ink/8 focus-visible:outline-ink active:bg-ink/12' : 'hover:bg-paper/10 focus-visible:outline-paper active:bg-paper/15'
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <span aria-hidden className="shrink-0 text-step-small opacity-80 @[12rem]:w-9 @[12rem]:text-step--1">
            {label}
          </span>
          <span aria-hidden className="min-w-0 truncate font-code tabular-nums">
            {value}
          </span>
          <span
            className={`absolute end-2 top-1/2 grid size-4 -translate-y-1/2 place-items-center transition-opacity ${done ? '' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-60'}`}
            aria-hidden
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={done ? 'done' : 'copy'}
                variants={fade}
                initial="hidden"
                animate="show"
                exit="exit"
                className="grid place-items-center"
              >
                {done ? <Check className="size-4" /> : <Copy className="size-4" />}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.button>
      </dd>
    </div>
  )
}
