import { useState } from 'react'
import { BRAND_PHOTOS } from '../data/imagery-photos'
import { adDescription } from '../data/visitor-descriptions'
import { displaySrc, manifestItems } from '../lib/ads'
import { imagerySubjects } from '../lib/imagery'
import { DirectionList } from './imagery/DirectionList'
import { ImageryCard } from './imagery/ImageryCard'
import { PhotoCard } from './imagery/PhotoCard'
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

/** What the lightbox shows: any image in the view, at its own size. */
interface LightboxImage {
  title: string
  src: string
  alt: string
  width: number
  height: number
}

/** Imagery: the direction, the Nova photo set, then the starter library from the Magnific manifest. */
export function ImagerySection() {
  const subjects = imagerySubjects(manifestItems('imagery'))
  const [open, setOpen] = useState<LightboxImage | null>(null)

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
          <SubHeading title="Photo set" badge={<Badge>Concept 01 Nova</Badge>}>
            Five abstract photos from concept 01 &ldquo;Nova&rdquo;, each paired with a palette colour. Use them as grounds and texture behind type. Each one links to
            its source on Unsplash.
          </SubHeading>
          <Reveal as="ul" stagger className="columns-1 gap-4 sm:columns-2 xl:columns-3 [&>li]:mb-4 [&>li]:break-inside-avoid">
            {BRAND_PHOTOS.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} onOpen={() => setOpen({ title: photo.title, src: photo.url, alt: photo.alt, width: photo.width, height: photo.height })} />
            ))}
          </Reveal>
        </div>
        <div>
          <SubHeading title="Starter library" badge={<Badge>AI-generated</Badge>}>
            AI-generated in Magnific. No real people or real clients. Use these as stand-ins until you have real client work and real customer moments. Tap or click an
            image to see it larger.
          </SubHeading>
          {subjects.length ? (
            <Reveal as="ul" stagger className="columns-1 gap-4 sm:columns-2 xl:columns-3 [&>li]:mb-4 [&>li]:break-inside-avoid">
              {subjects.map((subject) => (
                <ImageryCard
                  key={subject.id}
                  subject={subject}
                  onOpen={() =>
                    setOpen({
                      title: subject.name,
                      src: displaySrc(subject.master.files)!,
                      alt: adDescription(subject.master) ?? subject.name,
                      width: subject.master.width,
                      height: subject.master.height,
                    })
                  }
                />
              ))}
            </Reveal>
          ) : (
            <ManifestNotice what="imagery files" />
          )}
        </div>
      </div>
      <Lightbox open={!!open} onClose={() => setOpen(null)} title={open?.title ?? ''}>
        {open && <img src={open.src} alt={open.alt} width={open.width} height={open.height} className="mx-auto h-auto max-w-full rounded-site-sm" />}
      </Lightbox>
    </Section>
  )
}
