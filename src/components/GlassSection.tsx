import { CheckCircle, MinusCircle } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { GLASS_DO, GLASS_DONT, USE_FLAT, USE_GLASS } from '../data/glass-rules'
import { reveal } from '../lib/motion'
import { ComponentGallery } from './glass/ComponentGallery'
import { DepthStack } from './glass/DepthStack'
import { GlassAnatomy } from './glass/GlassAnatomy'
import { GlassLibrary } from './glass/GlassLibrary'
import { GlassScene } from './glass/GlassScene'
import { ReferenceGallery } from './glass/ReferenceGallery'
import { DirectionList } from './imagery/DirectionList'
import { Section } from './layout/Section'
import { SubHeading } from './layout/SubHeading'
import { Badge } from './ui/Badge'
import { Reveal } from './ui/Reveal'
import { SourceNote } from './ui/SourceNote'
import { ZipButton } from './ui/ZipButton'

function UsageList({ title, items, glass }: { title: string; items: string[]; glass: boolean }) {
  const Icon = glass ? CheckCircle : MinusCircle
  return (
    <motion.div variants={reveal} className="rounded-site border border-edge bg-surface p-6">
      <h3 className="mb-4 text-step-1 font-semibold text-text">{title}</h3>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-step-0 text-text-2">
            <Icon className={`mt-1 size-5 shrink-0 ${glass ? 'text-accent' : 'text-text-3'}`} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

/** Glass and texture: the reference ads' style as components, anatomy, depth and usage rules, sources and Magnific files. */
export function GlassSection() {
  return (
    <Section
      id="glass"
      eyebrow="Glass & texture"
      title="Frosted glass with a rose rim light"
      highlight={[4, 6]}
      lede="The style of the nine reference ads: frosted glass objects floating at a slight angle on a near-black ground, lit with a rose rim, stacked in depth, with halftone arcs and particle streams behind them."
      actions={<ZipButton group="glass" label="All glass & texture" />}
    >
      <div className="flex flex-col gap-section">
        <Reveal>
          <GlassScene />
        </Reveal>

        <div>
          <SubHeading title="Components" badge={<Badge>Proposed</Badge>}>
            Components built to these rules from the theme tokens, so they work on dark and light. Copy a component&apos;s code to use it.
          </SubHeading>
          <ComponentGallery />
        </div>

        <div>
          <SubHeading title="Anatomy of a glass card">Six parts, numbered on the card. Values are for a 1080 px ad; the hub uses the same tokens.</SubHeading>
          <GlassAnatomy />
        </div>

        <div>
          <SubHeading title="Depth stack">How the reference ads layer cards: a few steps back, each one smaller, dimmer and softer.</SubHeading>
          <DepthStack />
        </div>

        <div>
          <SubHeading title="Glass or flat" />
          <Reveal stagger className="grid gap-4 md:grid-cols-2">
            <UsageList title="Use glass for" items={USE_GLASS} glass />
            <UsageList title="Keep it flat for" items={USE_FLAT} glass={false} />
          </Reveal>
        </div>

        <div>
          <SubHeading title="Do and don't" />
          <Reveal className="grid gap-4 md:grid-cols-2">
            <DirectionList kind="do" items={GLASS_DO} />
            <DirectionList kind="dont" items={GLASS_DONT} />
          </Reveal>
        </div>

        <div>
          <SubHeading title="Source of the style">The nine ONE Agency reference ads this view is built from. Tap or click one to see it at full size.</SubHeading>
          <ReferenceGallery />
        </div>

        <div>
          <SubHeading title="Illustrations and textures">
            The illustrations are AI-generated in Magnific to this style, each on dark, on light and transparent. The textures are made in code, not generated.
          </SubHeading>
          <GlassLibrary />
        </div>

        <SourceNote>
          Codified from nine ONE Agency reference ads (November 2026). Rim, glow and dots use the live site&apos;s rose (--rose, #ffa0aa). The violet ground (#2a004c into
          #0e0f12) is sampled from the references and labelled derived; it is not on the live site.
        </SourceNote>
      </div>
    </Section>
  )
}
