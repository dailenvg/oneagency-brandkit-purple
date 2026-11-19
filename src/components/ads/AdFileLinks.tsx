import { ArrowUpRight } from '@phosphor-icons/react'
import { fileList, type AdItem } from '../../lib/ads'
import { DownloadMenu } from '../ui/DownloadMenu'
import { buttonClass } from '../ui/button-styles'

/** "Edit in Magnific" when the item has a design link, and the download menu with every format. */
export function AdFileLinks({ item }: { item: AdItem }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {item.magnificUrl && (
        <a
          href={item.magnificUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Edit in Magnific: ${item.name} (opens in a new tab)`}
          className={buttonClass('link', 'sm', '-ms-4')}
        >
          Edit in Magnific <ArrowUpRight aria-hidden />
        </a>
      )}
      <DownloadMenu title={item.name} className="ml-auto" files={fileList(item.files).map((f) => ({ url: f.url, label: f.format }))} />
    </div>
  )
}
