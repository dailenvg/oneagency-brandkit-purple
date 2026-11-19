import { FACES } from '../data/type'
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

/** Typography: the three faces the live site loads, its scale, and the ad text styles. */
export function TypeSection() {
  return (
    <Section
      id="type"
      eyebrow="Typography"
      title="Geist for words, Lato for numbers, Metal for one accent"
      accent={[9]}
      lede="Three faces, each with one job. All are free under the SIL Open Font License."
      actions={<ZipButton group="fonts" label="All fonts" />}
    >
      <div className="flex flex-col gap-section">
        <Reveal stagger className="grid gap-4 xl:grid-cols-3">
          {FACES.map((face) => (
            <FaceSpecimen key={face.id} face={face} />
          ))}
        </Reveal>

        <div>
          <SubHeading title="Type scale">The live site&apos;s fluid steps. Values grow with the screen between the two widths shown.</SubHeading>
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
            A solid band behind part of a title, from the reference ads. It replaces the Metal accent on that title: use one or the other.
          </SubHeading>
          <HighlightBand />
        </div>

        <SourceNote>
          The rebrand task names Bricolage Grotesque as the headline face, but the live site loads Geist, Lato and Metal. This kit follows the live site; the
          difference is noted in the brand kit brief.
        </SourceNote>
      </div>
    </Section>
  )
}
