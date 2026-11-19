import { assetFor } from '../../lib/assets'
import { DownloadLink } from '../ui/DownloadLink'
import { FullKitButton } from '../ui/FullKitButton'
import { ZipButton } from '../ui/ZipButton'
import { DashboardCard } from './DashboardCard'

const TOKENS_CSS = '/kit/colour/one-agency_tokens_web.css'
const TOKENS_JSON = '/kit/colour/one-agency_tokens_web.json'

/** Full-width row: icon and label on the left, size on the right, so the sizes line up down the card. */
const ROW = 'w-full [&>:last-child]:ms-auto'

/** The downloads people come back for: the full kit, logos, fonts, glass, the creative ads and the colour tokens, each with its size. */
export function QuickDownloadsCard({ className }: { className?: string }) {
  return (
    <DashboardCard title="Quick downloads" view="assets" linkLabel="All files" className={className}>
      <FullKitButton className={ROW} />
      <div className="flex flex-col gap-2">
        <ZipButton group="logos" label="Logos" variant="quiet" className={ROW} />
        <ZipButton group="fonts" label="Fonts" variant="quiet" className={ROW} />
        <ZipButton group="glass" label="Glass & texture" variant="quiet" className={ROW} />
        <ZipButton group="ads" label="Creative ads" variant="quiet" className={ROW} />
      </div>
      <div className="flex flex-col gap-2 border-t border-edge pt-4">
        <p className="text-step-small font-semibold text-text-2">Colour tokens</p>
        <div className="grid grid-cols-2 gap-2">
          <DownloadLink url={TOKENS_CSS} label="CSS" bytes={assetFor(TOKENS_CSS)?.bytes} className={ROW} />
          <DownloadLink url={TOKENS_JSON} label="JSON" bytes={assetFor(TOKENS_JSON)?.bytes} className={ROW} />
        </div>
      </div>
    </DashboardCard>
  )
}
