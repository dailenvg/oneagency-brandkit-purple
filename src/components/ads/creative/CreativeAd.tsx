import { Quotes } from '@phosphor-icons/react'
import type { CSSProperties } from 'react'
import { mobiusStill, type CreativeAdConcept, type CreativeAdSize, type CreativeFormat } from '../../../data/ad-creative'
import { AdCanvas } from './AdCanvas'
import { AdChecklist } from './AdChecklist'
import { AdCta } from './AdCta'
import { AdEyebrow } from './AdEyebrow'
import { AdHeadline } from './AdHeadline'
import { AdSmall } from './AdSmall'
import { AdStats } from './AdStats'
import { adText } from './ad-type'
import { HalftoneContext } from './visuals/halftone-context'
import { VISUALS, type VisualPlan } from './visuals/registry'

interface CreativeAdProps {
  concept: CreativeAdConcept
  size: CreativeAdSize
  /** Screen px per ad px (1 is true size). */
  scale?: number
}

type Arrangement = 'beside' | 'centre' | 'left' | 'landscape'

/** Long headlines run smaller; a headline in a narrow column smaller again. */
function headlineScale(text: string, narrow: boolean) {
  const n = text.length
  const base = n <= 22 ? 1.1 : n <= 36 ? 0.96 : n <= 46 ? 0.84 : n <= 60 ? 0.74 : 0.72
  return narrow ? base * 0.78 : base
}

/** Long CTAs step down so they hold one line: the bar in tall formats, the pill in landscape. */
function ctaScale(label: string, arrangement: Arrangement) {
  if (arrangement === 'landscape') return label.length > 30 ? 0.78 : 0.92
  return label.length > 34 ? 0.9 : 1
}

/**
 * Square: compact objects sit beside the headline, wide visuals run across the middle. Portrait: the same, stacked with
 * a bigger visual. Story: centred in the safe zone. Landscape: copy left, visual right.
 */
function arrangementFor(format: CreativeFormat, plan: VisualPlan): Arrangement {
  if (format === 'landscape') return 'landscape'
  if (format === 'story' || plan.square === 'centre') return 'centre'
  return format === 'square' ? 'beside' : 'left'
}

/** Where a visual drawn behind the copy sits on the canvas, ad px. */
const BACKDROP_BOX: Partial<Record<Arrangement, CSSProperties>> = {
  beside: { right: 14, top: 34, width: '48%', height: '52%' },
  landscape: { right: 18, top: 14, bottom: 14, width: '44%' },
}

/** One creative ad: the concept's copy and glass visual, recomposed for the size. */
export function CreativeAd({ concept, size, scale = 1 }: CreativeAdProps) {
  const { format } = size
  const plan = VISUALS[concept.visual]
  const Visual = plan.component
  const arrangement = arrangementFor(format, plan)
  const centre = arrangement === 'centre'
  const behind = arrangement in BACKDROP_BOX
  const narrow = arrangement === 'beside'
  const mobius = concept.backdrop === 'mobius' ? concept.mobius : undefined
  const still = mobius && { src: mobiusStill(mobius, format), ...mobius.shift?.[format] }
  const showHeadline = !plan.draws.includes('quote') || arrangement === 'landscape'
  /** Landscape keeps two checklist items when there are no stats to carry the proof. */
  const listItems = arrangement === 'landscape' ? (concept.stats.length ? [] : concept.list.slice(0, 2)) : concept.list
  const showList = listItems.length > 0 && !plan.draws.includes('list')
  const showStats = concept.stats.length > 0 && !plan.draws.includes('stats')
  /** A long square headline leaves little height, so its stat sits beside the visual rather than under it. */
  const sideStats = format === 'square' && centre && showStats
  /** A landscape quote sits centred in its column, with the attribution under it. */
  const centreCopy = arrangement === 'landscape' && concept.quote
  const tall = format === 'story' || format === 'portrait'
  /** Landscape is short: a long headline with stats takes the eyebrow's room. */
  const showEyebrow = !!concept.eyebrow && !(arrangement === 'landscape' && showStats && concept.headline.length > 30)

  const stats = (inline: boolean) => (
    <AdStats
      stats={concept.stats}
      source={concept.source}
      format={format}
      align={centre && !inline ? 'center' : 'start'}
      scale={arrangement === 'landscape' ? 0.8 : 1}
      glass={!!mobius && arrangement !== 'landscape'}
      rule={!centre && arrangement !== 'landscape'}
    />
  )
  const proof = (showList || (showStats && !sideStats)) && (
    <div className={`flex w-full flex-col gap-4 ${centre ? 'items-center' : 'items-start'}`}>
      {showList && <AdChecklist items={listItems} format={format} />}
      {showStats && !sideStats && stats(false)}
    </div>
  )
  const visual = sideStats ? (
    <div className="mt-6 mb-3 flex min-h-0 w-full flex-1 items-center gap-5 text-left">
      <Visual concept={concept} format={format} placement="flow" className="h-full flex-[1.4]" />
      <div data-part="proof" className="relative z-10 flex-1">
        {stats(true)}
      </div>
    </div>
  ) : (
    <Visual concept={concept} format={format} placement={behind ? 'side' : 'flow'} className={behind ? 'size-full' : `${centre && tall ? 'mt-8' : 'mt-6'} mb-3 w-full flex-1`} bleed={format === 'story' ? 1.15 : 1} />
  )

  return (
    <HalftoneContext.Provider value={!mobius}>
      <AdCanvas
        size={size}
        scale={scale}
        ground={plan.ground}
        logo={centre ? 'centre' : 'left'}
        still={still}
        label={`${concept.name} ad, ${size.width}×${size.height}: ${concept.headline}`}
        backdrop={
          behind && (
            <div className="absolute" style={BACKDROP_BOX[arrangement]}>
              {visual}
            </div>
          )
        }
      >
        <div className={`flex min-h-0 flex-1 flex-col ${centre ? 'items-center text-center' : 'items-start'} ${format === 'landscape' ? 'w-[54%]' : ''}`}>
          <div data-part="header" className={`relative z-10 flex flex-col gap-3 ${tall ? 'mt-7' : 'mt-5'} ${arrangement === 'beside' ? 'w-[47%]' : 'w-full'} ${arrangement === 'landscape' ? 'mt-3' : ''} ${centreCopy ? 'my-auto' : ''}`}>
            {showEyebrow && <AdEyebrow text={concept.eyebrow!} format={format} />}
            {showHeadline && concept.quote && <Quotes weight="fill" aria-hidden className="size-8 text-rose" />}
            {showHeadline && <AdHeadline concept={concept} format={format} scale={centreCopy ? 0.82 : headlineScale(concept.headline, narrow) * (arrangement === 'landscape' ? 0.92 : 1)} />}
            {showHeadline && concept.quote && concept.attribution && <p style={{ ...adText('statLabel', format), color: 'var(--text-2)' }}>{concept.attribution}</p>}
            {concept.sub && <p style={adText('subhead', format, 0.62)}>{concept.sub}</p>}
          </div>

          {behind ? !centreCopy && <div className={`${arrangement === 'landscape' ? 'min-h-3' : 'min-h-4'} flex-1`} /> : visual}

          <div data-part="proof" className={`relative z-10 flex w-full flex-col ${arrangement === 'landscape' ? 'gap-2.5' : 'gap-4'} ${centre ? 'items-center' : 'items-start'}`}>
            {proof}
            <AdCta label={concept.cta} format={format} block={arrangement !== 'landscape'} scale={ctaScale(concept.cta, arrangement)} />
            {concept.small && !plan.draws.includes('small') && <AdSmall text={concept.small} format={format} />}
          </div>
        </div>
      </AdCanvas>
    </HalftoneContext.Provider>
  )
}
