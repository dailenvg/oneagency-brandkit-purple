import type { CSSProperties, ReactNode } from 'react'
import { CREATIVE_AD_UNIT, STORY_SAFE, type CreativeAdSize, type CreativeFormat } from '../../../data/ad-creative'
import { Grain } from '../../../kit/glass/Grain'
import { LightStreaks } from '../../../kit/glass/LightStreaks'

export type AdGround = 'night' | 'violet'

interface AdCanvasProps {
  size: CreativeAdSize
  /** Screen px per ad px: 1 is true size (export, lightbox); the hub passes whatever fits its frame. */
  scale?: number
  ground?: AdGround
  logo?: 'left' | 'centre'
  /** Accessible name: the whole ad reads as one image. */
  label: string
  /** A full-bleed still under everything but the ground (the Möbius loop): placed and nudged, never reshaped. */
  still?: { src: string; x?: number; y?: number }
  /** Arcs and streams behind the layout, free to run into the margins and the story safe zones. */
  backdrop?: ReactNode
  children: ReactNode
}

const U = CREATIVE_AD_UNIT

/** Content box per format, ad px (half the exported px). Story keeps the top 220 and bottom 340 exported px clear. */
const INSET: Record<CreativeFormat, CSSProperties> = {
  square: { inset: 36 },
  portrait: { inset: '40px 40px 38px' },
  story: { top: STORY_SAFE.top / U + 8, bottom: STORY_SAFE.bottom / U + 8, left: 44, right: 44 },
  landscape: { inset: '26px 32px' },
}

const LOGO_WIDTH: Record<CreativeFormat, number> = { square: 100, portrait: 108, story: 112, landscape: 84 }



/**
 * Fixed-pixel artboard for one creative ad: the brand's navy (or violet) ground pinned to the dark theme, the stacked
 * logo, the format's safe content box and film grain over everything. Laid out at half size and drawn at 2x (scale 1),
 * so the kit's glass components keep their proportions; the hub scales the whole board to fit.
 */
export function AdCanvas({ size, scale = 1, ground = 'night', logo = 'left', label, still, backdrop, children }: AdCanvasProps) {
  const { width, height, format } = size
  return (
    <div role="img" aria-label={label} className="relative overflow-hidden" style={{ width: width * scale, height: height * scale }}>
      <div
        data-theme="dark"
        className="absolute top-0 left-0 isolate overflow-hidden font-sans text-text"
        style={{ width: width / U, height: height / U, transform: `scale(${U * scale})`, transformOrigin: '0 0', background: 'var(--navy)' }}
      >
        {ground === 'violet' && (
          <>
            <div aria-hidden className="violet-ground absolute inset-0" />
            {/* The streaks would compete with the Möbius strands, so a still replaces them. */}
            {!still && <LightStreaks className="opacity-70" />}
          </>
        )}
        {/* The still is placed unchanged (the Mint recolour is already in it): the grain goes under it, so nothing is blended into the loop. */}
        {still && <Grain />}
        {still && (
          <img
            src={still.src}
            alt=""
            data-still
            className="pointer-events-none absolute h-auto w-full max-w-none"
            style={{ left: `${(still.x ?? 0) * 100}%`, top: `${(still.y ?? 0) * 100}%` }}
          />
        )}
        <div aria-hidden className="absolute inset-0">
          {backdrop}
        </div>
        <div className={`absolute flex flex-col ${logo === 'centre' ? 'items-center text-center' : 'items-start'}`} style={INSET[format]}>
          <img src="/kit/logos/stacked/one-agency_logo_stacked-on-navy.svg" alt="" width={LOGO_WIDTH[format]} height={Math.round((LOGO_WIDTH[format] * 567.08) / 1223.2)} className="relative z-10 shrink-0" />
          <div className="flex min-h-0 w-full flex-1 flex-col">{children}</div>
        </div>
        {!still && <Grain className="z-20" />}
      </div>
    </div>
  )
}
