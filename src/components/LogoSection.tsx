import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { LOGOS, type LogoLockup } from '../data/logos'
import { sequence, stagger, swap, viewport } from '../lib/motion'
import { Section } from './layout/Section'
import { SubHeading } from './layout/SubHeading'
import { ClearSpace } from './logo/ClearSpace'
import { FaviconSet } from './logo/FaviconSet'
import { LogoVariantCard } from './logo/LogoVariantCard'
import { MinimumSizes } from './logo/MinimumSizes'
import { MisuseGrid } from './logo/MisuseGrid'
import { Badge } from './ui/Badge'
import { FilterTabs } from './ui/FilterTabs'
import { ZipButton } from './ui/ZipButton'

const LOCKUPS: { id: LogoLockup; label: string; use: string }[] = [
  { id: 'stacked', label: 'Stacked', use: 'The primary lockup and master layout. Use it unless the space is too wide and short.' },
  { id: 'horizontal', label: 'Horizontal', use: 'For wide, short spaces: headers, banners, footers.' },
  { id: 'icon', label: 'Icon', use: 'The ONE mark alone, for avatars, small spaces and when the name is already on screen.' },
]

/** Logo: lockups by variant with every file, then the rules (clear space, minimum size, misuse) and the small icons. */
export function LogoSection() {
  const [lockup, setLockup] = useState<LogoLockup>('stacked')
  const current = LOCKUPS.find((l) => l.id === lockup)!

  return (
    <Section
      id="logo"
      eyebrow="Logo"
      title="The chrome ONE mark"
      accent={[1]}
      lede="The live site's logo is the master. Shapes are unchanged; the kit adds layouts and colour variants for every ground."
      actions={<ZipButton group="logos" label="All logos" />}
    >
      <div className="flex flex-col gap-section">
        <div>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <FilterTabs label="Logo lockup" layoutId="logo-lockup" options={LOCKUPS} value={lockup} onChange={setLockup} controls="logo-variants" />
            <p className="max-w-md text-step-small text-text-3">{current.use}</p>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={lockup} id="logo-variants" role="tabpanel" aria-label={`${current.label} lockup`} variants={swap} initial="hidden" animate="show" exit="exit">
              <motion.ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" variants={sequence(stagger.children)} initial="hidden" whileInView="show" viewport={viewport}>
                {LOGOS.filter((l) => l.lockup === lockup).map((logo) => (
                  <LogoVariantCard key={logo.svg.url} logo={logo} />
                ))}
              </motion.ul>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="min-w-0">
            <SubHeading title="Clear space" badge={<Badge>Proposed</Badge>} />
            <ClearSpace />
          </div>
          <div className="min-w-0">
            <SubHeading title="Minimum size" badge={<Badge>Proposed</Badge>}>
              Smallest on-screen width for each lockup, drawn at true pixel size.
            </SubHeading>
            <MinimumSizes />
          </div>
        </div>

        <div>
          <SubHeading title="Misuse">Seven ways the logo goes wrong, rendered for real.</SubHeading>
          <MisuseGrid />
        </div>

        <div>
          <SubHeading title="Favicon and social avatar">
            The favicon crops to the O, as the live site does. Small sizes show at true size.
          </SubHeading>
          <FaviconSet />
        </div>
      </div>
    </Section>
  )
}
