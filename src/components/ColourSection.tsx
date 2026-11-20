import { CheckCircle } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { ACCENT_RULES, GROUP_LABELS, GROUP_ORDER } from '../data/colour-rules'
import { DERIVED_RAMPS, RAMPS, TOKEN_SOURCE, TOKENS } from '../data/tokens'
import { reveal } from '../lib/motion'
import { ContrastMatrix } from './colour/ContrastMatrix'
import { LightThemeTokens } from './colour/LightThemeTokens'
import { RampRow } from './colour/RampRow'
import { Swatch } from './colour/Swatch'
import { Section } from './layout/Section'
import { SubHeading } from './layout/SubHeading'
import { Badge } from './ui/Badge'
import { DownloadLink } from './ui/DownloadLink'
import { Reveal } from './ui/Reveal'
import { SourceNote } from './ui/SourceNote'
import { ZipButton } from './ui/ZipButton'

const CSS_URL = '/kit/colour/one-agency_tokens_web.css'
const JSON_URL = '/kit/colour/one-agency_tokens_web.json'

/** Colour: the board palette and derived tokens by group, ramps, the contrast matrix and the ad accent rules. */
export function ColourSection() {
  return (
    <Section
      id="colour"
      eyebrow="Colour"
      title="Navy, Mint and Ultra Violet"
      accent={[1]}
      lede="Five colours from the moodboard, and everything the kit derives from them, labelled. Tap or click any value to copy it."
      actions={
        <>
          <DownloadLink url={CSS_URL} label="CSS tokens" />
          <DownloadLink url={JSON_URL} label="JSON tokens" />
          <ZipButton group="colour" label="Colour (ZIP)" />
        </>
      }
    >
      <div className="flex flex-col gap-section">
        {GROUP_ORDER.map((group) => {
          const tokens = TOKENS.filter((t) => t.group === group)
          if (!tokens.length) return null
          return (
            <div key={group}>
              <SubHeading title={GROUP_LABELS[group].label}>{GROUP_LABELS[group].note}</SubHeading>
              <Reveal as="ul" stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tokens.map((t) => (
                  <Swatch key={t.name} token={t} />
                ))}
              </Reveal>
            </div>
          )
        })}

        <div>
          <SubHeading title="Tints and shades" badge={<Badge>{DERIVED_RAMPS.label}</Badge>}>
            {DERIVED_RAMPS.method} ● marks the board value. Tap or click a step to copy its HEX.
          </SubHeading>
          <Reveal className="flex flex-col gap-6">
            {RAMPS.map((ramp) => (
              <RampRow key={ramp.base} ramp={ramp} />
            ))}
          </Reveal>
        </div>

        <div>
          <SubHeading title="Text on ground: approved pairs">WCAG 2.1 contrast for every text token on every ground, drawn with the token variables.</SubHeading>
          <ContrastMatrix />
        </div>

        <div>
          <SubHeading title="Accent rules for ads" badge={<Badge>Proposed</Badge>} />
          <Reveal as="ul" stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ACCENT_RULES.map((r) => (
              <motion.li key={r.rule} variants={reveal} className="flex gap-3 rounded-site border border-edge bg-surface p-5">
                <CheckCircle className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                <div>
                  <p className="font-semibold text-text">{r.rule}</p>
                  <p className="mt-1 text-step-small text-text-2">{r.detail}</p>
                </div>
              </motion.li>
            ))}
          </Reveal>
        </div>

        <div>
          <SubHeading title="Light theme for this hub" badge={<Badge>Derived</Badge>}>
            The sun and moon switch swaps each role from its navy token to a white, Mist and Sky one. Mint never sets text on light grounds, so accent text
            and the focus ring use Ultra Violet.
          </SubHeading>
          <LightThemeTokens />
        </div>

        <SourceNote>
          From the {TOKEN_SOURCE.name} ({TOKEN_SOURCE.figma}, exported {TOKEN_SOURCE.exported}). {TOKEN_SOURCE.note}
        </SourceNote>
      </div>
    </Section>
  )
}
