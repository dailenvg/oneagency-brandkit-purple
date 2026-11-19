import { ArrowUpRight } from '@phosphor-icons/react'
import { CREATIVE_AD_SIZES, CREATIVE_CONCEPTS } from '../data/ad-creative'
import { GLASS_REFERENCES } from '../data/glass-references'
import { AD_MANIFEST } from '../lib/ads'
import { AnimatedAds } from './ads/AnimatedAds'
import { CreativeGallery } from './ads/creative/CreativeGallery'
import { CreativeHero } from './ads/creative/CreativeHero'
import { TemplatesAndSamples } from './ads/TemplatesAndSamples'
import { ReferenceGallery } from './glass/ReferenceGallery'
import { Section } from './layout/Section'
import { SubHeading } from './layout/SubHeading'
import { Badge } from './ui/Badge'
import { ButtonLink } from './ui/ButtonLink'
import { ZipButton } from './ui/ZipButton'

/**
 * Ads: the creative ads composed from the kit (a featured collage, then all ten concepts in four sizes), the reference
 * ads the style comes from, the Magnific templates and samples (collapsed), and the animated HTML5 ads.
 */
export function AdsSection() {
  const magnific = AD_MANIFEST.status === 'ready' ? AD_MANIFEST.manifest.brandKitUrl ?? AD_MANIFEST.manifest.folderUrl : null

  return (
    <Section
      id="ads"
      eyebrow="Ads"
      title="Creative ads, templates and motion"
      accent={[0]}
      lede="Ten ready-to-run ad concepts built from the kit's glass components, with every claim and figure taken from oneagency.com. Download any size as PNG or WebP, or open it at true size."
      actions={
        // Three actions, one lead: the creative ads ZIP is the secondary pill every view uses for its ZIP; templates and the
        // outbound Magnific link step down to quiet. Phones stack them full width; tablets wrap them in a row; from xl,
        // where the header sits beside the title, they stack in one equal-width column so the lede keeps its measure.
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap xl:flex-col">
          <ZipButton group="ads" label="All creative ads" />
          <ZipButton group="templates" label="All templates" variant="quiet" />
          {magnific && (
            <ButtonLink href={magnific} external variant="quiet">
              Magnific brand kit
              <ArrowUpRight aria-hidden />
            </ButtonLink>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-section">
        <CreativeHero />

        <div>
          <SubHeading title="Creative ads" badge={<Badge>{CREATIVE_CONCEPTS.length * CREATIVE_AD_SIZES.length} ads</Badge>}>
            {CREATIVE_CONCEPTS.length} concepts in {CREATIVE_AD_SIZES.length} sizes: square, portrait, story and landscape.
            Each layout recomposes for its size. Client figures carry their client, and their date where the site gives one.
          </SubHeading>
          <CreativeGallery />
        </div>

        <div>
          <SubHeading title="Reference ads" badge={<Badge>{GLASS_REFERENCES.length}</Badge>}>
            The originals the glass style is codified from. One difference by design: their serif italic accent word is set here in Metal with the signature gradient.
          </SubHeading>
          <ReferenceGallery />
        </div>

        <div>
          <SubHeading title="Templates and samples" badge={<Badge>Magnific</Badge>}>
            Editable templates in every channel size and the sample ads set in them, by channel.
          </SubHeading>
          <TemplatesAndSamples />
        </div>

        <div>
          <SubHeading title="Animated ads" badge={<Badge>Film moves</Badge>}>
            HTML5 ads driven by one-motion.js, with the approved sample copy. Each plays once and holds on the CTA; nothing flashes. Download the video, the GIF, the end
            frame or the HTML5 package for ad servers.
          </SubHeading>
          <AnimatedAds />
        </div>
      </div>
    </Section>
  )
}
