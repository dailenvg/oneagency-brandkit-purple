import { FileDashed, WarningCircle } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { GLASS_MANIFEST, glassDisplaySrc, glassItems, type GlassItem, type GlassKind } from '../../lib/glass'
import { swap } from '../../lib/motion'
import { EmptyState } from '../ui/EmptyState'
import { FilterTabs } from '../ui/FilterTabs'
import { Lightbox } from '../ui/Lightbox'
import { ReloadButton } from '../ui/ReloadButton'
import { Reveal } from '../ui/Reveal'
import { GlassItemCard } from './GlassItemCard'

const KINDS: { id: GlassKind; label: string }[] = [
  { id: 'illustration', label: 'Illustrations' },
  { id: 'texture', label: 'Textures' },
]

/** Illustrations come in variants of one subject (on dark, on light, transparent); textures stand alone. */
function groupItems(items: GlassItem[]) {
  const groups = new Map<string, GlassItem[]>()
  for (const item of items) {
    const key = item.kind === 'illustration' && item.subject ? `subject:${item.subject}` : item.id
    groups.set(key, [...(groups.get(key) ?? []), item])
  }
  return [...groups.values()]
}

/** Magnific illustrations and textures in the glass style, from the manifest; empty and error states when it is not there. */
export function GlassLibrary() {
  const [kind, setKind] = useState<GlassKind>('illustration')
  const [open, setOpen] = useState<GlassItem | null>(null)
  const options = useMemo(() => KINDS.map((k) => ({ ...k, count: glassItems(k.id).length })), [])
  const groups = useMemo(() => groupItems(glassItems(kind)), [kind])

  if (GLASS_MANIFEST.status === 'invalid') {
    return (
      <EmptyState icon={WarningCircle} tone="error" title="The illustrations and textures did not load" action={<ReloadButton />}>
        Reload the page. If they are still missing, the kit is being updated; try again shortly.
      </EmptyState>
    )
  }
  if (GLASS_MANIFEST.status === 'missing' || !GLASS_MANIFEST.items.length) {
    return (
      <EmptyState icon={FileDashed} title="The glass illustrations are on the way">
        The illustrations (AI-generated in Magnific) and textures for this style are on the way. They appear here as soon as they are published.
      </EmptyState>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <FilterTabs label="Illustrations or textures" layoutId="glass-kind" options={options} value={kind} onChange={setKind} controls="glass-library" />
      <div id="glass-library" role="tabpanel" aria-label={KINDS.find((k) => k.id === kind)!.label}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={kind} variants={swap} initial="hidden" animate="show" exit="exit">
            {groups.length ? (
              <Reveal as="ul" stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {groups.map((items) => (
                  <GlassItemCard key={items[0].id} items={items} onOpen={setOpen} />
                ))}
              </Reveal>
            ) : (
              <EmptyState icon={FileDashed} title={`No ${kind === 'illustration' ? 'illustrations' : 'textures'} yet`}>
                They appear here as soon as they are published.
              </EmptyState>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <Lightbox open={!!open} onClose={() => setOpen(null)} title={open ? `${open.name} · ${open.width}×${open.height}` : ''}>
        {open && (
          <div data-theme={open.theme === 'any' ? undefined : open.theme} className={`rounded-site-sm ${open.theme === 'any' ? 'checker' : open.theme === 'light' ? 'bg-paper' : 'bg-ground'}`}>
            <img src={glassDisplaySrc(open.files)!} alt={open.name} width={open.width} height={open.height} className="mx-auto h-auto max-h-[75svh] w-auto max-w-full" />
          </div>
        )}
      </Lightbox>
    </div>
  )
}
