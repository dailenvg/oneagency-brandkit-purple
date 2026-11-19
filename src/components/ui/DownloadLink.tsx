import { DownloadSimple } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { press } from '../../lib/motion'
import { fileName, formatBytes } from '../../lib/format'
import { buttonClass } from './button-styles'

interface DownloadLinkProps {
  url: string
  /** Short visible label, e.g. "SVG" or "PNG 2x". */
  label: string
  bytes?: number | null
  className?: string
}

/** Per-file download chip. The accessible name carries the visible label, the size and the full file name. */
export function DownloadLink({ url, label, bytes, className }: DownloadLinkProps) {
  return (
    <motion.a
      href={url}
      download
      // Visible label first (WCAG 2.5.3 label in name), then the exact file and size.
      aria-label={`${label}${bytes ? ` ${formatBytes(bytes)}` : ''}, download ${fileName(url)}`}
      className={buttonClass('quiet', 'sm', className)}
      {...press}
    >
      <DownloadSimple aria-hidden />
      {label}
      {bytes ? <span className="font-normal text-text-3">{formatBytes(bytes)}</span> : null}
    </motion.a>
  )
}
