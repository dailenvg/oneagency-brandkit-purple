import { ArrowsHorizontal } from '@phosphor-icons/react'
import { useRef, type ReactNode } from 'react'
import { Halo } from '../kit/motion/Halo'
import { edgeFade, useScrollEdges } from '../lib/hooks'
import { AwardBadge } from './elements/AwardBadge'
import { CtaStates } from './elements/CtaStates'
import { ElementCard } from './elements/ElementCard'
import { ElementGraphic } from './elements/ElementGraphic'
import { IconSet } from './elements/IconSet'
import { MobiusSet } from './elements/MobiusSet'
import { StatBar } from './elements/StatBar'
import { Section } from './layout/Section'
import { SubHeading } from './layout/SubHeading'
import { Reveal } from './ui/Reveal'
import { ZipButton } from './ui/ZipButton'

/** Stage for a kit graphic: follows the hub theme, with room around the artwork. */
const GRAPHIC_STAGE = 'bg-ground px-6 py-10 sm:px-10'

const PATTERNS = ['pattern-dots', 'pattern-contours', 'pattern-grid', 'pattern-flow'] as const
const ILLUSTRATIONS = ['illustration-answering-leads', 'illustration-free-audit', 'illustration-ai-search', 'illustration-paid-media'] as const

/**
 * Phones: a wide graphic keeps a readable size and scrolls sideways inside its stage, with faded edges and a hint while
 * there is more to see. It takes focus only while it scrolls, so keyboard users can pan it with the arrow keys.
 */
function ScrollStage({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const edges = useScrollEdges(ref)
  const scrolls = edges.start || edges.end
  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div
        ref={ref}
        role={scrolls ? 'region' : undefined}
        aria-label={scrolls ? label : undefined}
        tabIndex={scrolls ? 0 : undefined}
        className="scroll-strip overflow-x-auto rounded-site-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        style={edgeFade(edges)}
      >
        {children}
      </div>
      {scrolls && (
        <p aria-hidden className="flex items-center justify-center gap-2 text-step-small text-text-3">
          <ArrowsHorizontal className="size-4" aria-hidden />
          {hint}
        </p>
      )}
    </div>
  )
}

/** Graphic elements: signature devices, the Möbius stills, patterns, illustrations, then CTAs, proof bar, award badge and icons. */
export function ElementsSection() {
  return (
    <Section
      id="elements"
      eyebrow="Graphic elements"
      title="A line that always ends on a result"
      accent={[7]}
      lede="Devices, patterns and illustrations drawn for ads, plus the site's buttons, proof bar and award badge. The vector pieces download as SVG and PNG; the Möbius stills as JPG and PNG."
      actions={<ZipButton group="elements" label="All elements" />}
    >
      <div className="flex flex-col gap-section">
        <div>
          <SubHeading title="Signature devices">
            Five devices that carry the story: growth, the twist of the loop, the four stages, signals and a frame for copy. Each one lights a single point and keeps
            the rest quiet. All five come on dark and on light. The halo, glow field and laurel from the live site sit alongside them.
          </SubHeading>
          {/*
            No grid-flow-dense: DOM order is the visual order at every width, so Tab moves through the cards as they read.
            The orbit spans both columns at md so the md grid has no hole.
          */}
          <Reveal stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <ElementCard ids={['signal-ribbon']} themed replayable stage={GRAPHIC_STAGE} className="md:col-span-2 xl:col-span-6">
              <ElementGraphic id="signal-ribbon" className="w-full max-w-5xl" />
            </ElementCard>
            <ElementCard ids={['conversion-curve']} themed replayable stage={GRAPHIC_STAGE} className="md:col-span-2 xl:col-span-4">
              <ElementGraphic id="conversion-curve" className="w-full max-w-2xl" />
            </ElementCard>
            <ElementCard ids={['orbit']} themed replayable stage={GRAPHIC_STAGE} className="md:col-span-2 xl:col-span-2">
              <ElementGraphic id="orbit" className="w-full max-w-72" />
            </ElementCard>
            {/* Phones: the 720 px artboard would shrink its labels to about 6 px, so it holds at 544 px and scrolls sideways. */}
            <ElementCard ids={['conversion-stages']} themed replayable stage="grid-cols-1 bg-ground py-10 sm:px-10" className="md:col-span-2 xl:col-span-4">
              <ScrollStage label="Conversion stages, scrolls sideways" hint="Scroll sideways to see all four stages">
                <div className="w-[37rem] px-6 sm:mx-auto sm:w-full sm:max-w-2xl sm:px-0">
                  <ElementGraphic id="conversion-stages" />
                </div>
              </ScrollStage>
            </ElementCard>
            <ElementCard ids={['editorial-frame']} themed replayable stage={GRAPHIC_STAGE} className="xl:col-span-2">
              <div className="relative w-full max-w-72">
                <ElementGraphic id="editorial-frame" />
                {/* A sample headline, to show where copy sits. Not part of the file. */}
                <p aria-hidden className="absolute inset-x-[14%] top-1/2 -translate-y-1/2 text-step-1 leading-tight font-bold text-balance text-text">
                  Turn leads into <span className="accent-word">customers</span>
                </p>
              </div>
            </ElementCard>
            <ElementCard ids={['halo']} replayable className="xl:col-span-2">
              <Halo className="absolute inset-y-0 left-1/2 aspect-square h-full -translate-x-1/2" />
              {/* A sample number, to show the halo behind a stat. Not part of the file. */}
              <span aria-hidden className="relative font-num text-step-3 font-bold">
                450K+
              </span>
            </ElementCard>
            <ElementCard ids={['glow-field']} stage="glow-field h-56" className="xl:col-span-2">
              <span className="sr-only">Night-navy ground with a rose glow top left and a blue glow bottom right.</span>
            </ElementCard>
            <ElementCard ids={['laurel']} className="xl:col-span-2">
              <img src="/kit/elements/one-agency_element_laurel.svg" alt="" width={240} height={240} className="h-full w-auto" loading="lazy" />
            </ElementCard>
          </Reveal>
        </div>

        <div>
          <SubHeading title="Möbius loop">
            The loop as a background graphic for ads: always big and cropped, running off the frame as it does behind this hub&apos;s Overview hero. Five crops, each
            leaving a quiet area for copy, in two looks. Flattened JPGs are ready to place; transparent PNGs go on your own ground.
          </SubHeading>
          <Reveal stagger>
            <MobiusSet />
          </Reveal>
        </div>

        <div>
          <SubHeading title="Patterns">Grounds to sit behind ad copy, 1080×1080 and full bleed. Each one fades across the frame, so set the copy where it is quiet.</SubHeading>
          {/*
            Two columns at most: at four across (about 210 px a card at 1280) the 1.5 px strokes of a 1080 px pattern
            shrink below half a pixel and the grid, contour and flow patterns all but vanish.
          */}
          <Reveal stagger className="grid gap-4 sm:grid-cols-2">
            {PATTERNS.map((id) => (
              <ElementCard key={id} ids={[id]} themed stage="p-0">
                <ElementGraphic id={id} className="w-full" />
              </ElementCard>
            ))}
          </Reveal>
        </div>

        <div>
          <SubHeading title="Illustrations">
            Spot illustrations in the glass style, lit from the top left. Each has one lit element and no words, only a few numerals.
          </SubHeading>
          <Reveal stagger className="grid gap-4 md:grid-cols-2">
            {ILLUSTRATIONS.map((id) => (
              <ElementCard key={id} ids={[id]} themed replayable stage="bg-ground p-4 sm:p-6">
                <ElementGraphic id={id} className="w-full max-w-xl" />
              </ElementCard>
            ))}
          </Reveal>
        </div>

        <div>
          <SubHeading title="CTA buttons">Every state, from the live site&apos;s button styles. One primary CTA per ad.</SubHeading>
          <Reveal className="flex flex-col gap-4">
            <CtaStates />
            <ElementCard ids={['cta-primary', 'cta-secondary', 'cta-on-light']} title="CTA files" />
          </Reveal>
        </div>

        <div>
          <SubHeading title="Proof bar">
            Big numbers with the source line directly underneath, never in a footnote elsewhere. The four site figures always carry &ldquo;As published on oneagency.com,
            November 2026.&rdquo;
          </SubHeading>
          <Reveal stagger>
            <ElementCard ids={['stat-bar']} stage="bg-void p-0">
              <div className="w-full">
                <StatBar />
              </div>
            </ElementCard>
          </Reveal>
        </div>

        <div>
          <SubHeading title="Award badge">The ARDY award belongs to ConversionIQ.ai. The attribution line is part of the badge and is never dropped.</SubHeading>
          <Reveal stagger>
            <ElementCard ids={['award-badge']} stage="bg-void p-0">
              <div className="w-full">
                <AwardBadge />
              </div>
            </ElementCard>
          </Reveal>
        </div>

        <div>
          <SubHeading title="Icons">Phosphor, bold weight only, white or rose. Tap or click an icon to download its SVG; the full set is in the elements ZIP.</SubHeading>
          <IconSet />
        </div>
      </div>
    </Section>
  )
}
