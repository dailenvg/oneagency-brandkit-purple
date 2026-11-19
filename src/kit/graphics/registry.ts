import type { ComponentType } from 'react'
import { AiSearch } from './AiSearch'
import { AnsweringLeads } from './AnsweringLeads'
import { ContourPattern } from './ContourPattern'
import { ConversionCurve } from './ConversionCurve'
import { ConversionStages } from './ConversionStages'
import { DotGridPattern } from './DotGridPattern'
import { EditorialFrame } from './EditorialFrame'
import { FreeAudit } from './FreeAudit'
import { FlowPattern } from './FlowPattern'
import { GridPattern } from './GridPattern'
import { OrbitRings } from './OrbitRings'
import { PaidMedia } from './PaidMedia'
import { SignalRibbon } from './SignalRibbon'
import { CONVERSION_CURVE_SIZE, CONVERSION_STAGES_SIZE, EDITORIAL_FRAME_SIZE, ILLUSTRATION_SIZE, ORBIT_SIZE, PATTERN_SIZE, SIGNAL_RIBBON_SIZE } from './sizes'
import type { GraphicProps } from './types'

export interface GraphicEntry {
  /** Element id in src/data/elements.ts. */
  id: string
  Component: ComponentType<GraphicProps>
  width: number
  height: number
}

const entry = (id: string, Component: ComponentType<GraphicProps>, size: { width: number; height: number }): GraphicEntry => ({ id, Component, ...size })

/**
 * Every vector graphic in the kit, keyed by element id. The hub renders these components; scripts/build-elements.mjs
 * renders the same ones to SVG and PNG, so the download is always what the page shows.
 */
export const GRAPHICS: GraphicEntry[] = [
  entry('conversion-curve', ConversionCurve, CONVERSION_CURVE_SIZE),
  entry('signal-ribbon', SignalRibbon, SIGNAL_RIBBON_SIZE),
  entry('conversion-stages', ConversionStages, CONVERSION_STAGES_SIZE),
  entry('orbit', OrbitRings, ORBIT_SIZE),
  entry('editorial-frame', EditorialFrame, EDITORIAL_FRAME_SIZE),
  entry('pattern-dots', DotGridPattern, PATTERN_SIZE),
  entry('pattern-contours', ContourPattern, PATTERN_SIZE),
  entry('pattern-grid', GridPattern, PATTERN_SIZE),
  entry('pattern-flow', FlowPattern, PATTERN_SIZE),
  entry('illustration-answering-leads', AnsweringLeads, ILLUSTRATION_SIZE),
  entry('illustration-free-audit', FreeAudit, ILLUSTRATION_SIZE),
  entry('illustration-ai-search', AiSearch, ILLUSTRATION_SIZE),
  entry('illustration-paid-media', PaidMedia, ILLUSTRATION_SIZE),
]

export const graphicById = (id: string) => {
  const found = GRAPHICS.find((g) => g.id === id)
  if (!found) throw new Error(`No graphic for ${id}`)
  return found
}
