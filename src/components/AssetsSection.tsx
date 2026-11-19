import { FileDashed, WarningCircle } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { ASSET_MANIFEST } from '../lib/assets'
import type { AssetGroupId } from '../lib/kit'
import { usesMobius } from '../lib/mobius-assets'
import { MobiusCreditLine } from './ads/creative/MobiusCredit'
import { AssetRow } from './assets/AssetRow'
import { Section } from './layout/Section'
import { Button } from './ui/Button'
import { EmptyState } from './ui/EmptyState'
import { FilterTabs } from './ui/FilterTabs'
import { FullKitButton } from './ui/FullKitButton'
import { ReloadButton } from './ui/ReloadButton'
import { ZipButton } from './ui/ZipButton'

type Filter = AssetGroupId | 'all'

/** Rows shown before "Show more". */
const PAGE = 24

/** Every downloadable file, generated from disk, with per-group and full-kit ZIPs. */
export function AssetsSection() {
  const [filter, setFilter] = useState<Filter>('all')
  const [limit, setLimit] = useState(PAGE)
  const manifest = ASSET_MANIFEST

  const options = useMemo(
    () => (manifest ? [{ id: 'all' as Filter, label: 'All', count: manifest.files.length }, ...manifest.groups.map((g) => ({ id: g.id as Filter, label: g.label, count: g.count }))] : []),
    [manifest],
  )

  if (!manifest) {
    return (
      <Section id="assets" eyebrow="Assets" title="Every file, in one place" highlight={[2, 4]}>
        <EmptyState
          icon={WarningCircle}
          tone="error"
          title="The file list did not load"
          action={
            <ReloadButton />
          }
        >
          Reload the page. If the list is still missing, the kit is being updated; every view still has its own downloads.
        </EmptyState>
      </Section>
    )
  }

  const files = filter === 'all' ? manifest.files : manifest.files.filter((f) => f.group === filter)
  const group = manifest.groups.find((g) => g.id === filter)
  // Any file in this list that shows ConversionIQ's loop (Möbius stills, ads on the loop): credit it above the list too,
  // since the rows that carry it may sit past the first page.
  const showsMobius = files.some((f) => usesMobius(f.url))

  return (
    <Section
      id="assets"
      eyebrow="Assets"
      title="Every file, in one place"
      highlight={[2, 4]}
      lede={`${manifest.files.length} files across ${manifest.groups.filter((g) => g.count).length} groups. Download one at a time, a group as a ZIP, or the full kit.`}
      actions={<FullKitButton />}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterTabs
            label="Filter assets by group"
            layoutId="assets-filter"
            options={options}
            value={filter}
            onChange={(f) => {
              setFilter(f)
              setLimit(PAGE)
            }}
            controls="asset-list"
          />
          {group && group.count > 0 && <ZipButton group={group.id} label={`All ${group.label.toLowerCase()}`} />}
        </div>

        {/* The tabpanel wraps the list (a role on the <ul> would drop its list semantics) and the empty state. */}
        <div id="asset-list" role="tabpanel" aria-label={group ? `Files: ${group.label}` : 'Files: all'}>
          {showsMobius && (
            <div className="mb-4">
              <MobiusCreditLine />
            </div>
          )}
          {files.length ? (
            <motion.ul layout className="grid gap-3 lg:grid-cols-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {files.slice(0, limit).map((f) => (
                  <AssetRow key={f.url} asset={f} />
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <EmptyState icon={FileDashed} title={`No ${group?.label.toLowerCase() ?? ''} files yet`}>
              They appear here as soon as they are published. Pick another group, or download the full kit.
            </EmptyState>
          )}
        </div>

        {files.length > limit && (
          <Button variant="secondary" onClick={() => setLimit((n) => n + PAGE * 2)} className="self-center" aria-controls="asset-list">
            Show more ({files.length - limit} left)
          </Button>
        )}
        <p className="text-step-small text-text-3">
          List updated {manifest.generatedAt.slice(0, 10)}. File names follow one-agency_[asset]_[variant]_[size].[ext].
        </p>
      </div>
    </Section>
  )
}
