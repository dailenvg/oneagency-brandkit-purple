import { DownloadSimple } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import type { Ref } from 'react'
import type { AssetEntry } from '../../lib/assets'
import { formatBytes, formatSeconds, formatSize } from '../../lib/format'
import { usesMobius } from '../../lib/mobius-assets'
import { press, swap } from '../../lib/motion'
import { MobiusCreditLine } from '../ads/creative/MobiusCredit'
import { AssetThumb } from './AssetThumb'

interface AssetRowProps {
  asset: AssetEntry
  /** Forwarded so AnimatePresence popLayout can measure the row. */
  ref?: Ref<HTMLLIElement>
}

/** One downloadable file: preview, name, format, dimensions, size and its download. */
export function AssetRow({ asset, ref }: AssetRowProps) {
  const meta = [formatSize(asset.width, asset.height), asset.duration ? formatSeconds(asset.duration) : null, formatBytes(asset.bytes)].filter(Boolean)
  return (
    <motion.li ref={ref} layout variants={swap} initial="hidden" animate="show" exit="exit" className="flex min-w-0 items-center gap-4 rounded-site border border-edge bg-surface p-3 sm:p-4">
      <AssetThumb asset={asset} />
      <div className="min-w-0 flex-1">
        {/* Two lines, breaking anywhere: long file names stay readable on phones, where a title tooltip never shows. */}
        <p className="line-clamp-2 font-code text-step-small break-all text-text" title={asset.name}>
          {asset.name}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-step-small text-text-3">
          <span className="rounded-full border border-edge px-2 font-semibold text-text-2">{asset.format}</span>
          {meta.map((m) => (
            <span key={m} className="font-num">
              {m}
            </span>
          ))}
        </p>
        {usesMobius(asset.url) && (
          <div className="mt-1">
            <MobiusCreditLine />
          </div>
        )}
      </div>
      <motion.a
        href={asset.url}
        download
        aria-label={`Download ${asset.name}, ${formatBytes(asset.bytes)}`}
        className="grid size-touch shrink-0 place-items-center rounded-full border border-edge text-text transition-colors hover:border-rose hover:bg-rose hover:text-on-accent active:bg-rose-deep"
        {...press}
      >
        <DownloadSimple className="size-5" aria-hidden />
      </motion.a>
    </motion.li>
  )
}
