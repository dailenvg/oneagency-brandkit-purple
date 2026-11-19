import { motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { elementById, elementDownloads, type ElementFile } from '../../data/elements'
import { reveal } from '../../lib/motion'
import { Badge } from '../ui/Badge'
import { DownloadMenu } from '../ui/DownloadMenu'
import { ReplayButton } from '../ui/ReplayButton'

interface ElementCardProps {
  /** Element ids from src/data/elements.ts whose files this card offers. */
  ids: string[]
  /** Card title; defaults to the first element's. */
  title?: string
  /** Live render. Re-mounted on replay when `replayable`. Omit for a files-only card. */
  children?: ReactNode
  replayable?: boolean
  /** Classes for the stage (height, ground, padding). */
  stage?: string
  /**
   * The stage follows the hub's theme (kit graphics, which ship on-dark and on-light). Otherwise it stays on the
   * brand's night ground in both themes.
   */
  themed?: boolean
  className?: string
  /** Heading level: 2 when the card sits straight under the view's h1, 3 (default) under a SubHeading h2. */
  level?: 2 | 3
}

const SOURCE_BADGE = {
  live: <Badge>Live site</Badge>,
  film: <Badge>Film</Badge>,
  proposed: <Badge>Proposed</Badge>,
}

/** Every file the card's elements ship. With several elements, each row or label names its element. */
function downloadsFor(items: ElementFile[]) {
  if (items.length === 1) return elementDownloads(items[0])
  return items.flatMap((item) =>
    elementDownloads(item).map((file) => (file.group ? { ...file, group: `${item.title}, ${file.group}` } : { ...file, label: `${item.title} ${file.label}` })),
  )
}

/** A graphic element: live render on a stage, what it is for, and its downloads (SVG and PNG, per tone where it has them). */
export function ElementCard({ ids, title, children, replayable, stage = 'h-56 bg-ground p-8', themed, className, level = 3 }: ElementCardProps) {
  const [run, setRun] = useState(0)
  const Heading = level === 2 ? 'h2' : 'h3'
  const items = ids.map(elementById)
  const [first] = items

  return (
    <motion.article variants={reveal} className={`flex flex-col overflow-hidden rounded-site border border-edge bg-surface ${className ?? ''}`}>
      {children && (
        <div key={run} data-theme={themed ? undefined : 'dark'} className={`relative grid place-items-center overflow-hidden ${stage}`}>
          {children}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <Heading className="font-semibold text-text">{title ?? first.title}</Heading>
          {SOURCE_BADGE[first.source]}
        </header>
        <p className="text-step-small text-text-2">{first.use}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          {replayable && <ReplayButton onClick={() => setRun((n) => n + 1)} label={title ?? first.title} />}
          <DownloadMenu title={title ?? first.title} className="ml-auto" files={downloadsFor(items)} />
        </div>
      </div>
    </motion.article>
  )
}
