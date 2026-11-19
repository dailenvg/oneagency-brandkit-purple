import { LatestAdsCard } from './overview/LatestAdsCard'
import { MotionPreviewCard } from './overview/MotionPreviewCard'
import { OverviewHero } from './overview/OverviewHero'
import { PaletteCard } from './overview/PaletteCard'
import { QuickDownloadsCard } from './overview/QuickDownloadsCard'
import { ShortcutsCard } from './overview/ShortcutsCard'
import { TypeSampleCard } from './overview/TypeSampleCard'
import { WhatsNewCard } from './overview/WhatsNewCard'
import { Reveal } from './ui/Reveal'

/** Overview: the hero with the Möbius loop, then the dashboard cards. */
export function OverviewSection() {
  return (
    <>
      <OverviewHero />
      <div className="container-site py-12 lg:py-16">
        <Reveal stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
          <QuickDownloadsCard className="xl:col-span-5" />
          <PaletteCard className="xl:col-span-7" />
          <TypeSampleCard className="xl:col-span-4" />
          <LatestAdsCard className="xl:col-span-5" />
          <MotionPreviewCard className="xl:col-span-3" />
          <WhatsNewCard className="md:col-span-2 xl:col-span-12" />
          <ShortcutsCard className="md:col-span-2 xl:col-span-12" />
        </Reveal>
      </div>
    </>
  )
}
