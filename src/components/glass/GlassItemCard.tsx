import { ArrowsOut, ArrowUpRight } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { glassDescription } from '../../data/visitor-descriptions'
import { glassDisplaySrc, glassFileList, type GlassItem, type GlassTheme } from '../../lib/glass'
import { reveal } from '../../lib/motion'
import { useTheme } from '../../lib/theme'
import { Badge } from '../ui/Badge'
import { DownloadMenu } from '../ui/DownloadMenu'
import { FilterTabs } from '../ui/FilterTabs'
import { SmartImage } from '../ui/SmartImage'
import { buttonClass } from '../ui/button-styles'

const THEME_LABEL: Record<GlassTheme, string> = { dark: 'On dark', light: 'On light', any: 'Transparent' }

/** Stage per variant: the ground it was made for; transparent ones on the checkerboard. */
const STAGE: Record<GlassTheme, { theme?: 'dark' | 'light'; className: string }> = {
  dark: { theme: 'dark', className: 'bg-ground' },
  light: { theme: 'light', className: 'bg-paper' },
  any: { className: 'checker' },
}

interface GlassItemCardProps {
  /** Variants of one subject (on dark, on light, transparent), or a single texture. */
  items: GlassItem[]
  onOpen: (item: GlassItem) => void
}

/** One illustration subject (switch between its variants) or one texture: preview, files and the Magnific source. */
export function GlassItemCard({ items, onOpen }: GlassItemCardProps) {
  const hubTheme = useTheme()
  const [selectedId, setSelectedId] = useState(() => (items.find((i) => i.theme === hubTheme) ?? items[0]).id)
  const item = items.find((i) => i.id === selectedId) ?? items[0]
  const src = glassDisplaySrc(item.files)!
  const stage = STAGE[item.theme]
  const title = items.length > 1 ? item.name.replace(/\s*\((on-dark|on-light|transparent)\)$/i, '') : item.name
  const panelId = `glass-${items[0].id}`
  const description = glassDescription(item)

  return (
    <motion.li variants={reveal} className="flex flex-col overflow-hidden rounded-site border border-edge bg-surface">
      <div id={panelId} data-theme={stage.theme} role={items.length > 1 ? 'tabpanel' : undefined} aria-label={items.length > 1 ? `${title}, ${THEME_LABEL[item.theme]}` : undefined}>
        <SmartImage
          key={item.id}
          src={src}
          alt={description ? `${item.name}. ${description}` : item.name}
          width={item.width}
          height={item.height}
          className={`aspect-square ${stage.className}`}
          imgClassName="size-full object-contain"
          overlay={
            <button type="button" onClick={() => onOpen(item)} aria-label={`Open ${item.name} at full size`} className="group absolute inset-0 cursor-zoom-in focus-visible:-outline-offset-4">
              <span
                aria-hidden
                className="absolute right-3 bottom-3 grid size-touch place-items-center rounded-full bg-void/70 text-text opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
              >
                <ArrowsOut className="size-5" />
              </span>
            </button>
          }
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-text">{title}</h3>
          {items.length === 1 && <Badge>{THEME_LABEL[item.theme]}</Badge>}
        </header>
        {items.length > 1 && (
          <FilterTabs
            label={`${title}: variant`}
            layoutId={`${panelId}-variant`}
            options={items.map((i) => ({ id: i.id, label: THEME_LABEL[i.theme] }))}
            value={item.id}
            onChange={setSelectedId}
            controls={panelId}
          />
        )}
        {description && <p className="text-step-small text-text-2">{description}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-2">
          {item.magnificUrl && (
            <a
              href={item.magnificUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass('link', 'sm', '-ms-4')}
            >
              Magnific <span className="sr-only">source for {item.name} (opens in a new tab)</span>
              <ArrowUpRight aria-hidden />
            </a>
          )}
          <DownloadMenu title={item.name} className="ml-auto" files={glassFileList(item.files).map((f) => ({ url: f.url, label: f.format }))} />
        </div>
      </div>
    </motion.li>
  )
}
