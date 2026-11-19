import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { ViewId } from '../../lib/views'

type Loader = () => Promise<{ default: ComponentType }>

/** Each view is its own chunk. */
const LOADERS: Record<ViewId, Loader> = {
  overview: () => import('../OverviewSection').then((m) => ({ default: m.OverviewSection })),
  logo: () => import('../LogoSection').then((m) => ({ default: m.LogoSection })),
  colour: () => import('../ColourSection').then((m) => ({ default: m.ColourSection })),
  type: () => import('../TypeSection').then((m) => ({ default: m.TypeSection })),
  elements: () => import('../ElementsSection').then((m) => ({ default: m.ElementsSection })),
  glass: () => import('../GlassSection').then((m) => ({ default: m.GlassSection })),
  motion: () => import('../MotionSection').then((m) => ({ default: m.MotionSection })),
  imagery: () => import('../ImagerySection').then((m) => ({ default: m.ImagerySection })),
  voice: () => import('../VoiceSection').then((m) => ({ default: m.VoiceSection })),
  copy: () => import('../CopySection').then((m) => ({ default: m.CopySection })),
  ads: () => import('../AdsSection').then((m) => ({ default: m.AdsSection })),
  assets: () => import('../AssetsSection').then((m) => ({ default: m.AssetsSection })),
}

export const VIEW_COMPONENTS = {} as Record<ViewId, LazyExoticComponent<ComponentType>>
for (const id of Object.keys(LOADERS) as ViewId[]) VIEW_COMPONENTS[id] = lazy(LOADERS[id])

/** Starts a view's chunk early (nav hover or focus) so the click lands on a loaded view. Errors surface on render. */
export const preloadView = (id: ViewId) => {
  LOADERS[id]().catch(() => {})
}
