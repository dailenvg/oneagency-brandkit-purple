import { FileDashed, WarningCircle } from '@phosphor-icons/react'
import { AD_MANIFEST } from '../../lib/ads'
import { EmptyState } from './EmptyState'
import { ReloadButton } from './ReloadButton'

interface ManifestNoticeProps {
  /** What is missing, e.g. "ad templates". */
  what: string
  /** Shown when the manifest loaded but has nothing for this view, e.g. "No sample ads for this channel." */
  emptyHint?: string
}

/**
 * Empty or error state for anything driven by the Magnific manifest, in visitor terms only. How to publish or repair
 * the manifest is in the README, never on the page.
 */
export function ManifestNotice({ what, emptyHint }: ManifestNoticeProps) {
  if (AD_MANIFEST.status === 'invalid') {
    return (
      <EmptyState icon={WarningCircle} tone="error" title={`The ${what} did not load`} action={<ReloadButton />}>
        Reload the page. If they are still missing, the kit is being updated; try again shortly.
      </EmptyState>
    )
  }
  if (AD_MANIFEST.status === 'missing') {
    return (
      <EmptyState icon={FileDashed} title={`The ${what} are on the way`}>
        They are being made in Magnific and appear here as soon as they are published.
      </EmptyState>
    )
  }
  return (
    <EmptyState icon={FileDashed} title={`No ${what} here yet`}>
      {emptyHint ?? 'They appear here as soon as they are published.'}
    </EmptyState>
  )
}
