import { ArrowUp, ArrowUpRight, CaretDown } from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { AD_MANIFEST } from '../../lib/ads'
import { FONT_PAGES, KIT, VERSION_NOTE } from '../../lib/kit'
import { collapse, duration, ease, fade, press } from '../../lib/motion'
import { GradientBar } from '../../kit/motion/GradientBar'
import { Button } from '../ui/Button'
import { buttonClass } from '../ui/button-styles'
import { BrandLogo } from './BrandLogo'

const SIGNATURE_URL = 'https://github.com/dailenvg'

/** The signature's underline draws in left to right on hover or focus. */
const SIGNATURE_LINE = {
  rest: { scaleX: 0 },
  lit: { scaleX: 1, transition: { duration: duration.micro, ease: ease.outCubic } },
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-text underline decoration-edge-strong underline-offset-4 hover:text-accent hover:decoration-accent">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
      <ArrowUpRight className="size-3.5" aria-hidden />
    </a>
  )
}

function SourceNotes() {
  const magnific = AD_MANIFEST.status === 'ready' ? AD_MANIFEST.manifest.brandKitUrl ?? AD_MANIFEST.manifest.folderUrl : null
  return (
    <div className="grid gap-8 pt-6 text-step-small text-text-2 sm:grid-cols-3">
      <div>
        <h2 className="mb-3 font-semibold text-text">Colour</h2>
        <p>
          Live CSS pulled {KIT.liveCssPulled}: <ExternalLink href={KIT.liveCss}>home.bundle.css</ExternalLink>. Values and token names are the site&apos;s, unchanged.
          Tints and shades are derived and labelled. The light theme of this hub is derived too: the live site is dark-only.
        </p>
      </div>
      <div>
        <h2 className="mb-3 font-semibold text-text">Fonts</h2>
        <p>
          The faces oneagency.com loads: <ExternalLink href={FONT_PAGES.geist}>Geist</ExternalLink>, <ExternalLink href={FONT_PAGES.lato}>Lato</ExternalLink> and{' '}
          <ExternalLink href={FONT_PAGES.metal}>Metal</ExternalLink>, all SIL Open Font License 1.1.
        </p>
      </div>
      <div>
        <h2 className="mb-3 font-semibold text-text">Templates</h2>
        <p>
          Ad templates are editable Magnific designs.{' '}
          {magnific ? <ExternalLink href={magnific}>Open the Magnific brand kit</ExternalLink> : <span>The Magnific link appears here once the templates are published.</span>}
        </p>
      </div>
      <p className="sm:col-span-3">
        Logo master: the live chrome ONE mark (oneagency.com/assets/img/one-agency-logo.svg). Motion follows the film &ldquo;ONE Agency: The Free Business Audit&rdquo;. The
        glass and texture style comes from nine ONE Agency reference ads. Möbius loop: ConversionIQ key visual, used as supplied. © {KIT.updated.slice(0, 4)} ONE Agency, LLC.
      </p>
    </div>
  )
}

/** Every view ends here: version note, source notes (open on request), back to top and the designer's signature. */
export function Footer() {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()
  const toTop = () => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
    document.getElementById('main')?.focus({ preventScroll: true })
  }

  return (
    <footer className="relative border-t border-edge-soft bg-void">
      <div className="container-site flex flex-col gap-6 py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-start gap-3">
            <BrandLogo lockup="horizontal" className="h-6 w-auto" />
            <GradientBar className="h-1 w-20" />
            <p className="font-num text-step--1 text-text-2">{VERSION_NOTE}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="source-notes"
              className={buttonClass('ghost', 'sm')}
              {...press}
            >
              Source notes
              <motion.span animate={{ rotate: open ? 180 : 0 }} className="grid place-items-center" aria-hidden>
                <CaretDown />
              </motion.span>
            </motion.button>
            <Button variant="secondary" size="sm" onClick={toTop}>
              <ArrowUp aria-hidden />
              Back to top
            </Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div key="notes" id="source-notes" variants={reduced ? fade : collapse} initial="hidden" animate="show" exit="exit" className="overflow-hidden">
              <SourceNotes />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-2 border-t border-edge-soft pt-6 text-step-small text-text-3 sm:flex-row sm:items-center sm:justify-between">
          <p>Digital only: RGB, px, SVG, PNG, JPG, WebP and web fonts.</p>
          <motion.a
            href={SIGNATURE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Designed by dailenvg, on GitHub (opens in a new tab)"
            initial="rest"
            whileHover="lit"
            whileFocus="lit"
            className="inline-flex min-h-touch items-center gap-2 self-start rounded-full font-code text-step-small tracking-wide text-text-3 transition-colors hover:text-text sm:self-auto"
          >
            <span aria-hidden className="text-text-4">designed by</span>
            <span className="relative">
              dailenvg
              <motion.span aria-hidden variants={SIGNATURE_LINE} className="absolute inset-x-0 -bottom-0.5 h-px origin-left bg-[image:var(--ui-accent-fill)]" />
            </span>
          </motion.a>
        </div>
      </div>
    </footer>
  )
}
