import type { CSSProperties } from 'react'
import { CREATIVE_AD_UNIT, type CreativeFormat } from '../../../data/ad-creative'
import { AD_TEXT_STYLES, type AdTextStyle } from '../../../data/ad-styles'

/** Type size per format, against the 1080-wide social sizes in ad-styles.ts. Landscape is short, so it runs smaller. */
const FORMAT_SCALE: Record<CreativeFormat, number> = { square: 1, portrait: 1, story: 1, landscape: 0.68 }

/** Stories have the height for a bigger headline (and its accent word); everything else keeps the 1080 sizes. */
const HEADLINE_SCALE: Partial<Record<CreativeFormat, number>> = { story: 1.14 }

/**
 * Smallest drawn size, ad px (half the exported px): the ad-styles floors, legal 24 px and stat label 30 px at 1080 wide;
 * landscape (1200x627) holds legal at 20 px and the stat label at 25 px.
 */
const MIN_PX: Partial<Record<AdTextStyle['id'], { social: number; landscape: number }>> = {
  legal: { social: 12, landscape: 10 },
  statLabel: { social: 15, landscape: 12.5 },
}

/** Floor for a style in a format, in the drawing's own px when it is scaled by `fit` (a FitBox). */
export const adMinPx = (id: AdTextStyle['id'], format: CreativeFormat, fit = 1) => {
  const min = MIN_PX[id]
  return min ? (format === 'landscape' ? min.landscape : min.social) / fit : 0
}

const FACE: Record<AdTextStyle['face'], string> = { Geist: 'var(--font-sans)', Lato: 'var(--font-num)', Metal: 'var(--font-accent)' }

/** Ad px (CSS px inside the canvas, half the exported px) for a text style in a format, never below its floor. */
export const adPx = (id: AdTextStyle['id'], format: CreativeFormat, scale = 1, fit = 1) =>
  Math.max(
    (AD_TEXT_STYLES.find((s) => s.id === id)!.social / CREATIVE_AD_UNIT) * FORMAT_SCALE[format] * (id === 'headline' ? (HEADLINE_SCALE[format] ?? 1) : 1) * scale,
    adMinPx(id, format, fit),
  )

/**
 * Inline style for an ad text style from ad-styles.ts (face, weight, size, leading, tracking, case, colour). `fit` is the
 * FitBox scale the text is drawn at, so floors hold in the exported pixels.
 */
export function adText(id: AdTextStyle['id'], format: CreativeFormat, scale = 1, fit = 1): CSSProperties {
  const s = AD_TEXT_STYLES.find((t) => t.id === id)!
  return {
    fontFamily: FACE[s.face],
    fontWeight: s.weight,
    fontSize: adPx(id, format, scale, fit),
    lineHeight: s.lineHeight,
    letterSpacing: `${s.tracking}em`,
    textTransform: s.uppercase ? 'uppercase' : undefined,
    color: s.colour === '--accent-fill' ? undefined : `var(${s.colour})`,
  }
}
