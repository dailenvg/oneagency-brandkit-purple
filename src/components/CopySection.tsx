import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { COPY, COPY_GROUPS, type CopyGroup } from '../data/copy'
import { assetFor } from '../lib/assets'
import { CopyLineItem } from './copy/CopyLineItem'
import { Section } from './layout/Section'
import { DownloadLink } from './ui/DownloadLink'
import { FilterTabs } from './ui/FilterTabs'
import { SourceNote } from './ui/SourceNote'

type Filter = CopyGroup | 'all'

const MD = '/kit/copy/one-agency_copy-bank.md'
const JSON_URL = '/kit/copy/one-agency_copy-bank.json'

/** Copy bank: approved lines by group, each one click to copy, each with its source and date. */
export function CopySection() {
  const [filter, setFilter] = useState<Filter>('all')
  const options = useMemo(
    () => [{ id: 'all' as Filter, label: 'All', count: COPY.length }, ...COPY_GROUPS.map((g) => ({ id: g.id as Filter, label: g.label, count: COPY.filter((c) => c.group === g.id).length }))],
    [],
  )
  const lines = filter === 'all' ? COPY : COPY.filter((c) => c.group === filter)

  return (
    <Section
      id="copy"
      eyebrow="Copy bank"
      title="Lines that are ready to use"
      highlight={[3, 5]}
      lede="Headlines, taglines, CTAs, proof points and legal lines, each with where it comes from and when. Tap or click a line to copy it."
      actions={
        <>
          <DownloadLink url={MD} label="Markdown" bytes={assetFor(MD)?.bytes} />
          <DownloadLink url={JSON_URL} label="JSON" bytes={assetFor(JSON_URL)?.bytes} />
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <FilterTabs label="Filter copy by group" layoutId="copy-filter" options={options} value={filter} onChange={setFilter} controls="copy-lines" />
        {/* The tabpanel wraps the list: a role on the <ul> would drop its list semantics. */}
        <div id="copy-lines" role="tabpanel" aria-label="Copy lines">
          <motion.ul layout className="grid gap-3 lg:grid-cols-2">
            <AnimatePresence mode="popLayout" initial={false}>
              {lines.map((line) => (
                <CopyLineItem key={line.id} line={line} />
              ))}
            </AnimatePresence>
          </motion.ul>
        </div>
        <SourceNote>
          The four site figures (10M+, $100M+, 7B+, 450K+) are published on oneagency.com but have no internal source on file, so always run them with &ldquo;As
          published on oneagency.com, November 2026.&rdquo; Lines marked &ldquo;Proposed, pending client test&rdquo; stay off public work until the client test is done.
          Live headlines that lead with &ldquo;growth&rdquo; are left out on purpose (see Voice).
        </SourceNote>
      </div>
    </Section>
  )
}
