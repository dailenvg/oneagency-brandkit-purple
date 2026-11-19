import { displaySrc, manifestItems } from '../../lib/ads'
import { SmartImage } from '../ui/SmartImage'
import { DashboardCard } from './DashboardCard'

const SHOWN = 3

/** The newest sample ads from the Magnific manifest, as square thumbnails captioned with their concept. */
export function LatestAdsCard({ className }: { className?: string }) {
  const square = manifestItems('sample').filter((a) => a.width === a.height)
  const ads = (square.length >= SHOWN ? square : manifestItems('sample')).slice(0, SHOWN)
  return (
    <DashboardCard title="Latest ads" view="ads" linkLabel="All ads" className={className}>
      {ads.length ? (
        <ul className="grid grid-cols-3 gap-3">
          {ads.map((ad) => (
            <li key={ad.id} className="flex flex-col gap-2">
              <SmartImage
                src={displaySrc(ad.files)!}
                alt={`${ad.name}${ad.concept ? `, concept ${ad.concept}` : ''}`}
                width={ad.width}
                height={ad.height}
                className="aspect-square rounded-site-sm border border-edge bg-surface-2"
                imgClassName="size-full object-cover"
              />
              <span className="truncate text-step-small text-text-2">{ad.name.split(' · ')[1] ?? ad.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-site-sm border border-dashed border-edge-strong/50 p-4 text-step-small text-text-2">
          Sample ads show here as soon as they are published.
        </p>
      )}
    </DashboardCard>
  )
}
