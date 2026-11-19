import { DownloadSimple } from '@phosphor-icons/react'
import { ASSET_MANIFEST } from '../../lib/assets'
import { formatBytes } from '../../lib/format'
import { FULL_KIT_URL } from '../../lib/kit'
import type { ButtonSize } from './button-styles'
import { ButtonLink } from './ButtonLink'

/** "Download full kit" with its size. Disabled until `npm run kit:zips` has built the ZIP. */
export function FullKitButton({ size, className, label = 'Download full kit' }: { size?: ButtonSize; className?: string; label?: string }) {
  const full = ASSET_MANIFEST?.full
  return (
    <ButtonLink href={FULL_KIT_URL} download size={size} disabled={!full} className={className} aria-label={`Download full kit, ZIP${full ? `, ${formatBytes(full.bytes)}` : ', not available yet'}`}>
      <DownloadSimple aria-hidden />
      {label}
      {full && <span className="font-normal opacity-75">{formatBytes(full.bytes)}</span>}
    </ButtonLink>
  )
}
