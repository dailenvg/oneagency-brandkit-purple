import { ArrowsIn, ArrowsOut, CaretDown } from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useMemo, useState } from 'react'
import { CHANNELS, displaySrc, manifestItems, type AdChannel, type AdGroup, type AdItem } from '../../lib/ads'
import { collapse, fade, sequence, spring, stagger, viewport } from '../../lib/motion'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { FilterTabs } from '../ui/FilterTabs'
import { Lightbox } from '../ui/Lightbox'
import { ManifestNotice } from '../ui/ManifestNotice'
import { AdFrame } from './AdFrame'
import { PlannedSizes } from './PlannedSizes'

type Filter = AdChannel | 'all'

const GROUPS: { id: Exclude<AdGroup, 'imagery'>; title: string; intro: string }[] = [
  { id: 'template', title: 'Templates', intro: 'Editable in Magnific, with placeholder copy. Every channel size.' },
  { id: 'sample', title: 'Sample ads', intro: 'The three approved concepts set in the templates.' },
]

/**
 * The Magnific templates and sample ads by channel, behind a disclosure (closed by default). Fitted by default, with
 * true pixel size one tap away per channel row, and always in the lightbox.
 */
export function TemplatesAndSamples() {
  const ads = useMemo(() => [...manifestItems('template'), ...manifestItems('sample')], [])
  const [expanded, setExpanded] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  /** Rows (group + channel) switched to true pixel size. Everything else is fitted, so a phone never scrolls sideways. */
  const [trueSize, setTrueSize] = useState<ReadonlySet<string>>(() => new Set())
  const [open, setOpen] = useState<AdItem | null>(null)
  const reduced = useReducedMotion()
  const panelId = useId()

  const toggleTrueSize = (row: string) =>
    setTrueSize((prev) => {
      const next = new Set(prev)
      if (next.has(row)) next.delete(row)
      else next.add(row)
      return next
    })

  const options = useMemo(
    () => [
      { id: 'all' as Filter, label: 'All', count: ads.length },
      ...CHANNELS.map((c) => ({ id: c.id as Filter, label: c.label, count: ads.filter((a) => a.channel === c.id).length })).filter((o) => o.count),
    ],
    [ads],
  )
  const visible = filter === 'all' ? ads : ads.filter((a) => a.channel === filter)

  return (
    <div className="flex flex-col gap-6">
      <Button variant="secondary" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} aria-controls={expanded ? panelId : undefined} className="self-start">
        {expanded ? 'Hide templates and samples' : 'Show templates and samples'}
        {ads.length > 0 && (
          <span className="font-num">
            {ads.length}
            <span className="sr-only"> ads</span>
          </span>
        )}
        <motion.span className="grid" animate={{ rotate: expanded ? 180 : 0 }} transition={spring.snappy}>
          <CaretDown aria-hidden />
        </motion.span>
      </Button>
      <AnimatePresence initial={false}>
        {expanded && (
          // overflow-hidden is for the height animation; the 8 px bleed (-mx-2 px-2) keeps focus rings and hover lifts at the column edges from being clipped.
          <motion.div id={panelId} key="panel" variants={reduced ? fade : collapse} initial="hidden" animate="show" exit="exit" className="-mx-2 overflow-hidden px-2">
            {ads.length ? (
              <div className="flex flex-col gap-10 pt-2">
                <FilterTabs label="Filter templates and samples by channel" layoutId="ads-channel" options={options} value={filter} onChange={setFilter} controls="ads-gallery" />
                <div id="ads-gallery" role="tabpanel" aria-label="Templates and samples" className="flex flex-col gap-12">
                  {GROUPS.map((g) => {
                    const items = visible.filter((a) => a.group === g.id)
                    return (
                      <div key={g.id}>
                        <h3 className="mb-1 flex flex-wrap items-center gap-3 text-step-1 font-semibold">
                          {g.title}
                          <Badge>{items.length}</Badge>
                        </h3>
                        <p className="mb-6 text-step--1 text-text-2">{g.intro}</p>
                        {items.length ? (
                          CHANNELS.map((c) => {
                            const inChannel = items.filter((a) => a.channel === c.id)
                            if (!inChannel.length) return null
                            const row = `${g.id}-${c.id}`
                            const real = trueSize.has(row)
                            return (
                              <div key={c.id} className="mb-10">
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                                  <h4 id={`ads-${row}`} className="text-step-0 font-semibold text-text-2">
                                    {c.label}
                                  </h4>
                                  <Button variant="quiet" size="sm" onClick={() => toggleTrueSize(row)} aria-describedby={`ads-${row}`}>
                                    {real ? <ArrowsIn className="size-4" aria-hidden /> : <ArrowsOut className="size-4" aria-hidden />}
                                    {real ? 'Fit to screen' : 'View at true size'}
                                  </Button>
                                </div>
                                <motion.div className="flex flex-wrap items-start gap-8" variants={sequence(stagger.children)} initial="hidden" whileInView="show" viewport={viewport}>
                                  {inChannel.map((item) => (
                                    <AdFrame key={item.id} item={item} fit={!real} onOpen={() => setOpen(item)} />
                                  ))}
                                </motion.div>
                              </div>
                            )
                          })
                        ) : (
                          <ManifestNotice
                            what={g.title.toLowerCase()}
                            emptyHint={g.id === 'sample' ? 'None for this channel. Use the templates above.' : 'None for this channel yet. Pick another channel, or download all templates.'}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-8 pt-2">
                <ManifestNotice what="ad templates and sample ads" />
                <div>
                  <h3 className="mb-1 text-step-1 font-semibold">Sizes on the way</h3>
                  <p className="mb-6 text-step--1 text-text-2">Every planned size, drawn to scale. Each one fills in when its Magnific template lands.</p>
                  <PlannedSizes />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Lightbox open={!!open} onClose={() => setOpen(null)} title={open ? `${open.name} · ${open.width}×${open.height}` : ''}>
        {open && <img src={displaySrc(open.files)!} alt={open.name} width={open.width} height={open.height} className="mx-auto max-w-none" style={{ width: open.width }} />}
      </Lightbox>
    </div>
  )
}
