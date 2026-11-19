import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState, type CSSProperties } from 'react'
import { MOBIUS_CROPS, MOBIUS_LOOKS, MOBIUS_SIZES, mobiusDownloads, mobiusPreviewUrl, type MobiusGround, type MobiusLook } from '../../data/mobius'
import { fade, reveal, sequence, stagger, swap } from '../../lib/motion'
import { getTheme } from '../../lib/theme'
import { MobiusCreditLine } from '../ads/creative/MobiusCredit'
import { Badge } from '../ui/Badge'
import { DownloadMenu } from '../ui/DownloadMenu'
import { FilterTabs } from '../ui/FilterTabs'
import { SmartImage } from '../ui/SmartImage'

const FRAMES = MOBIUS_SIZES.map((s) => ({ ...s, ratio: s.width / s.height, dims: `${s.width}×${s.height}` }))

/** Columns sized by aspect ratio, so every frame stands the same height from 1024px up. */
const COLUMNS = FRAMES.map((f) => `${f.ratio}fr`).join(' ')

/** Transparent files sit on a checkerboard of the ground they are drawn for, so the transparency shows. */
const checker = (a: string, b: string): CSSProperties => ({ background: `repeating-conic-gradient(${a} 0 25%, ${b} 0 50%) 0 0 / 20px 20px` })

/**
 * The stage behind the previews. Flattened stills follow the hub. A transparent set pins its own theme on the panel,
 * so the captions on its checkerboard keep their contrast (about 7:1 on dark, 5.6:1 or better on light).
 */
const STAGE: Record<string, { className: string; style?: CSSProperties; theme?: 'dark' | 'light' }> = {
  'on-navy': { className: 'bg-surface-2' },
  'on-paper': { className: 'bg-surface-2' },
  'clear-dark': { className: '', style: checker('var(--ground)', 'var(--surface)'), theme: 'dark' },
  'clear-light': { className: '', style: checker('var(--paper)', 'var(--lavender)'), theme: 'light' },
  clear: { className: '', style: checker('var(--ground)', 'var(--surface)'), theme: 'dark' },
}

/** A ground the new look lacks maps to its nearest one: the two transparent sets of energy and the one of strings. */
function groundFor(look: MobiusLook, id: string): MobiusGround {
  const exact = look.grounds.find((g) => g.id === id)
  if (exact) return exact
  if (id.startsWith('clear')) {
    const clear = look.grounds.find((g) => g.id === (id === 'clear' ? 'clear-dark' : 'clear'))
    if (clear) return clear
  }
  return look.grounds[0]
}

/** The Möbius stills for ads: pick a crop, a look and a ground, see every format, download any size. */
export function MobiusSet() {
  const [cropId, setCropId] = useState(MOBIUS_CROPS[0].id)
  const [lookId, setLookId] = useState(MOBIUS_LOOKS[0].id)
  // Opens on the ground that matches the hub's theme.
  const [groundId, setGroundId] = useState(() => (getTheme() === 'light' ? 'on-paper' : 'on-navy'))
  const reduced = useReducedMotion()
  const panelId = useId()
  const crop = MOBIUS_CROPS.find((c) => c.id === cropId) ?? MOBIUS_CROPS[0]
  const look = MOBIUS_LOOKS.find((l) => l.id === lookId) ?? MOBIUS_LOOKS[0]
  const ground = groundFor(look, groundId)
  const stage = STAGE[ground.id]
  const format = ground.format.toUpperCase()
  const name = `Möbius loop, ${look.label.toLowerCase()}, ${crop.label.toLowerCase()}`

  return (
    <motion.article variants={reveal} className="flex flex-col overflow-hidden rounded-site border border-edge bg-surface">
      <div className="flex flex-col gap-2 border-b border-edge p-3 sm:p-4">
        <FilterTabs
          label="Möbius crop"
          layoutId="mobius-crop"
          controls={panelId}
          value={crop.id}
          onChange={setCropId}
          options={MOBIUS_CROPS.map((c) => ({ id: c.id, label: c.label }))}
        />
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <FilterTabs
            label="Möbius look"
            layoutId="mobius-look"
            controls={panelId}
            value={look.id}
            onChange={setLookId}
            options={MOBIUS_LOOKS.map((l) => ({ id: l.id, label: l.label }))}
          />
          <FilterTabs
            label="Möbius ground"
            layoutId="mobius-ground"
            controls={panelId}
            value={ground.id}
            onChange={setGroundId}
            options={look.grounds.map((g) => ({ id: g.id, label: g.label }))}
          />
        </div>
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-label={`${name}, ${ground.label}`}
        data-theme={stage.theme}
        className={`p-4 sm:p-6 ${stage.className}`}
        style={stage.style}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={`${crop.id}-${look.id}-${ground.id}`}
            variants={sequence(stagger.children / 2)}
            initial="hidden"
            animate="show"
            exit="exit"
            className="grid grid-cols-2 items-start gap-4 lg:[grid-template-columns:var(--cols)]"
            style={{ '--cols': COLUMNS } as CSSProperties}
          >
            {FRAMES.map((frame) => (
              <motion.li key={frame.id} variants={reduced ? fade : swap}>
                <figure className="flex flex-col gap-2">
                  <SmartImage
                    src={mobiusPreviewUrl(look, crop, ground, frame)}
                    alt={`${name}, ${ground.label}, ${frame.label}`}
                    width={540}
                    height={Math.round(540 / frame.ratio)}
                    className="w-full rounded-site-sm shadow-card"
                    imgClassName="size-full object-cover"
                    style={{ aspectRatio: frame.ratio }}
                  />
                  {/* Label over size in every caption: the 9:16 column is too narrow for both on one line, and one
                      layout for all four keeps the row aligned. */}
                  <figcaption className="flex flex-col gap-0.5 text-step-small">
                    <span className="font-semibold whitespace-nowrap text-text">{frame.label}</span>
                    <span className="font-num whitespace-nowrap text-text-3">{frame.dims}</span>
                  </figcaption>
                </figure>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-text">
            {crop.label} <span className="font-normal text-text-3">· {look.label}</span>
          </h3>
          <Badge>Proposed</Badge>
        </header>
        <p className="text-step-small text-text-2">
          {crop.copy} {look.use}
        </p>
        <MobiusCreditLine />
        <div className="flex items-center justify-between gap-2">
          <p className="text-step-small text-text-3">{format} at the four sizes shown above.</p>
          <DownloadMenu title={`${name}, ${ground.label}, ${format}`} files={mobiusDownloads(look, crop, ground)} />
        </div>
      </div>
    </motion.article>
  )
}
