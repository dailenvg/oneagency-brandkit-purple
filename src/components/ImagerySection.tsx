import { useState } from 'react'
import { adDescription } from '../data/visitor-descriptions'
import { displaySrc, manifestItems, type AdItem } from '../lib/ads'
import { imagerySubjects } from '../lib/imagery'
import { DirectionList } from './imagery/DirectionList'
import { ImageryCard } from './imagery/ImageryCard'
import { Section } from './layout/Section'
import { SubHeading } from './layout/SubHeading'
import { Badge } from './ui/Badge'
import { Lightbox } from './ui/Lightbox'
import { ManifestNotice } from './ui/ManifestNotice'
import { Reveal } from './ui/Reveal'
import { ZipButton } from './ui/ZipButton'

/** Creative Direction v2.1, graphic system. */
const DO = ['Real client work', 'Real customer moments', 'Client work, full-bleed']
const DONT = ['Stock offices', 'Robot hands', 'Glowing AI brains']

/** Imagery: the direction, then the starter library from the Magnific manifest. */
export function ImagerySection() {
  const subjects = imagerySubjects(manifestItems('imagery'))
  const [open, setOpen] = useState<AdItem | null>(null)

  return (
    <Section
      id="imagery"
      eyebrow="Imagery"
      title="Real work, real customers"
      accent={[1]}
      lede="Show the client's work and the people it reaches. Nothing that could be any agency's stock library."
      actions={<ZipButton group="imagery" label="All imagery" />}
    >
      <div className="flex flex-col gap-section">
        <Reveal className="grid gap-4 md:grid-cols-2">
          <DirectionList kind="do" items={DO} />
          <DirectionList kind="dont" items={DONT} />
        </Reveal>
        <div>
          <SubHeading title="Starter library" badge={<Badge>AI-generated</Badge>}>
            AI-generated in Magnific. No real people or real clients. Use these as stand-ins until you have real client work and real customer moments. Tap or click an
            image to see it larger.
          </SubHeading>
          {subjects.length ? (
            <Reveal as="ul" stagger className="columns-1 gap-4 sm:columns-2 xl:columns-3 [&>li]:mb-4 [&>li]:break-inside-avoid">
              {subjects.map((subject) => (
                <ImageryCard key={subject.id} subject={subject} onOpen={() => setOpen(subject.master)} />
              ))}
            </Reveal>
          ) : (
            <ManifestNotice what="imagery files" />
          )}
        </div>
      </div>
      <Lightbox open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ''}>
        {open && <img src={displaySrc(open.files)!} alt={adDescription(open) ?? open.name} width={open.width} height={open.height} className="mx-auto h-auto max-w-full rounded-site-sm" />}
      </Lightbox>
    </Section>
  )
}
