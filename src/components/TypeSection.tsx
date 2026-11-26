import { FACES } from '../data/type'
import { KIT } from '../lib/kit'
import { Section } from './layout/Section'
import { SubHeading } from './layout/SubHeading'
import { AdTextStyles } from './type/AdTextStyles'
import { HighlightBand } from './type/HighlightBand'
import { FaceSpecimen } from './type/FaceSpecimen'
import { TypeScaleTable } from './type/TypeScaleTable'
import { Badge } from './ui/Badge'
import { Reveal } from './ui/Reveal'
import { SourceNote } from './ui/SourceNote'
import { ZipButton } from './ui/ZipButton'

/** Typography: the two brand faces, the type scale, and the ad text styles. */
export function TypeSection() {
  return (
    <Section
      id="type"
      eyebrow="Typography"
      title="Unbounded for display, Geist for words"
      accent={[0]}
      lede="Two faces, each with its job. Both are free under the SIL Open Font License."
      actions={<ZipButton group="fonts" label="All fonts" />}
    >
      <div className="flex flex-col gap-section">
        <Reveal stagger className="grid gap-4 xl:grid-cols-2">
          {FACES.map((face) => (
            <FaceSpecimen key={face.id} face={face} />
          ))}
        </Reveal>

        <div>
          <SubHeading title="Type scale">The kit&apos;s fluid steps. Values grow with the screen between the two widths shown.</SubHeading>
          <TypeScaleTable />
        </div>

        <div>
          <SubHeading title="Ad text styles" badge={<Badge>Proposed</Badge>}>
            Fixed px sizes for the two ad scales. Taller social formats (1080x1350, 1080x1920) use the 1080 sizes with more space between blocks.
          </SubHeading>
          <AdTextStyles />
        </div>

        <div>
          <SubHeading title="Highlight band" badge={<Badge>Derived</Badge>}>
            A solid band behind part of a title, from the reference ads. It replaces the accent word on that title: use one or the other.
          </SubHeading>
          <HighlightBand />
        </div>

        <SourceNote>
          Unbounded and Geist come with the rebrand (concept 01 &ldquo;Nova&rdquo;, moodboard {KIT.board}). They replace Lato and Metal, the old site&apos;s
          faces, which are retired.
        </SourceNote>
      </div>
    </Section>
  )
}
