import type { ComponentType } from 'react'
import type { CreativeVisual } from '../../../../data/ad-creative'
import type { AdGround } from '../AdCanvas'
import { AwardVisual } from './AwardVisual'
import { BrowserVisual } from './BrowserVisual'
import { LeadStreamVisual } from './LeadStreamVisual'
import { MapPackVisual } from './MapPackVisual'
import { ProfileStackVisual } from './ProfileStackVisual'
import { QuoteVisual } from './QuoteVisual'
import { SearchCardVisual } from './SearchCardVisual'
import { SiteStreamVisual } from './SiteStreamVisual'
import { StatBoardVisual } from './StatBoardVisual'
import { TilesVisual } from './TilesVisual'
import type { VisualProps } from './visual-props'

/**
 * How a square ad is arranged around its visual: `beside` puts a compact object to the right of the headline (the
 * profile stack reference), `centre` runs a wide visual across the middle (the icon tiles reference).
 */
export type SquareArrangement = 'beside' | 'centre'

export interface VisualPlan {
  component: ComponentType<VisualProps>
  square: SquareArrangement
  /** Parts of the concept the visual draws itself, so the layout leaves them out. */
  draws: ('list' | 'stats' | 'quote' | 'small')[]
  ground: AdGround
}

export const VISUALS: Record<CreativeVisual, VisualPlan> = {
  browser: { component: BrowserVisual, square: 'beside', draws: [], ground: 'night' },
  tiles: { component: TilesVisual, square: 'centre', draws: ['list'], ground: 'night' },
  'search-card': { component: SearchCardVisual, square: 'beside', draws: [], ground: 'night' },
  'profile-stack': { component: ProfileStackVisual, square: 'beside', draws: [], ground: 'night' },
  'map-pack': { component: MapPackVisual, square: 'beside', draws: [], ground: 'night' },
  'site-stream': { component: SiteStreamVisual, square: 'centre', draws: [], ground: 'night' },
  'lead-stream': { component: LeadStreamVisual, square: 'centre', draws: [], ground: 'violet' },
  'stat-board': { component: StatBoardVisual, square: 'centre', draws: ['stats', 'small'], ground: 'violet' },
  award: { component: AwardVisual, square: 'beside', draws: [], ground: 'night' },
  quote: { component: QuoteVisual, square: 'centre', draws: ['quote'], ground: 'night' },
}
