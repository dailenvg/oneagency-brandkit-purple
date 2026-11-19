import { ArrowUpRight } from '@phosphor-icons/react'
import type { CreativeAdConcept } from '../../../data/ad-creative'
import { DownloadMenu } from '../../ui/DownloadMenu'
import { buttonClass } from '../../ui/button-styles'
import { creativeDownloads } from './creative-downloads'

/**
 * A concept's source page link and its download menu (every size, PNG and WebP). Under a card the link's text lines up
 * with the card edge and the menu sits right; `inline` sets both in a heading row.
 */
export function CreativeAdActions({ concept, inline = false }: { concept: CreativeAdConcept; inline?: boolean }) {
  const files = creativeDownloads(concept)
  const push = inline ? '' : 'ml-auto'
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={concept.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Source page for ${concept.name} (opens in a new tab)`}
        className={buttonClass('link', 'sm', inline ? '' : '-ms-4')}
      >
        Source page <ArrowUpRight aria-hidden />
      </a>
      {files.length ? (
        <DownloadMenu title={concept.name} className={push} files={files} />
      ) : (
        // No export manifest yet: say so where the download button would be (the lightbox still shows the live ad).
        <span className={`${push} text-step-small text-text-3`}>Downloads for this ad are coming soon.</span>
      )}
    </div>
  )
}
