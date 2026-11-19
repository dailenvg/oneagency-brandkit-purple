/**
 * The Möbius loop as ad stills: always big and cropped, a background graphic that bleeds off the frame the way the
 * loop runs behind this hub's Overview hero, never the whole loop shrunk into the middle. scripts/build-mobius.mjs imports
 * this file to render the set, so it stays import-free.
 *
 * File names follow the kit convention:
 *   mobius/one-agency_element_mobius-[look]-[crop]-[ground]_[WxH].[jpg|png]
 *     look    energy, strings
 *     crop    sweep, band-top, band-bottom, side, frame (where the loop sits, and so where the copy goes)
 *     ground  on-navy, on-paper: flattened, JPG. clear-dark, clear-light (strings: clear): transparent PNG.
 *     size    1080x1080, 1080x1350, 1080x1920, 1200x628
 * plus a half-size WebP of each in /previews/elements/mobius/ for the hub (not part of the kit).
 */

export const MOBIUS_DIR = '/kit/elements/mobius'
export const MOBIUS_PREVIEWS_DIR = '/previews/elements/mobius'

export interface MobiusGround {
  /** File name part, e.g. "on-navy". */
  id: string
  label: string
  /** The theme the loop is drawn in. */
  theme: 'dark' | 'light'
  /** Ground token it is flattened onto; none: transparent. */
  ground?: '--ground' | '--paper'
  format: 'jpg' | 'png'
}

export interface MobiusLook {
  /** The <ciq-loop> look attribute and the file name part. */
  id: 'energy' | 'strings'
  label: string
  use: string
  grounds: readonly MobiusGround[]
}

/**
 * Where the loop goes in a format. scale: the loop's width (its bounding box) as a multiple of the format's short side.
 * anchor: a point on the loop, as fractions of its bounding box (the top twist is about [0.55, 0.14]). to: where that
 * point lands, as fractions of the format. Anything past the edges is cropped: that is the bleed.
 */
export interface MobiusPlacement {
  scale: number
  anchor: readonly [number, number]
  to: readonly [number, number]
}

export interface MobiusCrop extends MobiusPlacement {
  id: string
  label: string
  /** Where the copy goes, for the hub. */
  copy: string
  /** Per-shape adjustments: square (1:1), tall (4:5, 9:16), wide (1.91:1). */
  at?: Partial<Record<'square' | 'tall' | 'wide', Partial<MobiusPlacement>>>
}

export interface MobiusSize {
  /** "WxH" in px, as it appears in the file name. */
  id: string
  label: string
  width: number
  height: number
}

const ON_NAVY: MobiusGround = { id: 'on-navy', label: 'On navy', theme: 'dark', ground: '--ground', format: 'jpg' }
const ON_PAPER: MobiusGround = { id: 'on-paper', label: 'On paper', theme: 'light', ground: '--paper', format: 'jpg' }

export const MOBIUS_LOOKS: readonly MobiusLook[] = [
  {
    id: 'energy',
    label: 'Energy',
    use: 'The loop in light, with sparks. The brightest look: one per ad, behind a short headline.',
    grounds: [
      ON_NAVY,
      ON_PAPER,
      { id: 'clear-dark', label: 'Transparent, dark', theme: 'dark', format: 'png' },
      { id: 'clear-light', label: 'Transparent, light', theme: 'light', format: 'png' },
    ],
  },
  {
    id: 'strings',
    label: 'Strings',
    use: 'The loop as fine parallel strings. Quieter than energy; good behind longer copy.',
    // Strings draws the same lines in both themes, so it has one transparent set.
    grounds: [ON_NAVY, ON_PAPER, { id: 'clear', label: 'Transparent', theme: 'dark', format: 'png' }],
  },
]

export const MOBIUS_SIZES: readonly MobiusSize[] = [
  { id: '1080x1080', label: 'Square 1:1', width: 1080, height: 1080 },
  { id: '1080x1350', label: 'Portrait 4:5', width: 1080, height: 1350 },
  { id: '1080x1920', label: 'Story 9:16', width: 1080, height: 1920 },
  { id: '1200x628', label: 'Link 1.91:1', width: 1200, height: 628 },
]

/** The crops: two to three times the format, so only part of the loop shows, and one side always stays quiet for copy. */
export const MOBIUS_CROPS: readonly MobiusCrop[] = [
  {
    id: 'sweep',
    label: 'Sweep',
    copy: 'The strands cross at the top and curve down the right, as behind the Overview hero. Copy goes bottom left.',
    scale: 2.6,
    anchor: [0.9, 0.18],
    to: [0.72, 0.3],
    at: { tall: { scale: 2.4, to: [0.7, 0.42] }, wide: { scale: 3.4, to: [0.8, 0.42] } },
  },
  {
    id: 'band-top',
    label: 'Band, top',
    copy: 'The twist as a wide band across the top. Copy goes below it.',
    scale: 2.4,
    anchor: [0.55, 0.14],
    to: [0.62, 0.3],
    at: { tall: { to: [0.55, 0.26] }, wide: { scale: 2.6, to: [0.7, 0.42] } },
  },
  {
    id: 'band-bottom',
    label: 'Band, bottom',
    copy: 'The twist low in the frame. Copy goes above it.',
    scale: 1.5,
    anchor: [0.5, 0.14],
    to: [0.5, 0.74],
    at: { tall: { to: [0.5, 0.8] }, wide: { scale: 2.5, to: [0.6, 0.72] } },
  },
  {
    id: 'side',
    label: 'Side',
    copy: 'One side of the loop running down the right edge. Copy goes left.',
    scale: 2.4,
    anchor: [0.1, 0.2],
    to: [0.62, 0.22],
    at: { tall: { scale: 2.2, to: [0.55, 0.18] }, wide: { scale: 3, to: [0.62, 0.15] } },
  },
  {
    id: 'frame',
    label: 'Frame',
    copy: 'The loop huge and centred, running off every edge. Copy goes inside it.',
    scale: 1.3,
    anchor: [0.5, 0.5],
    to: [0.5, 0.55],
    at: { tall: { scale: 1.25, to: [0.5, 0.5] }, wide: { scale: 2, to: [0.5, 0.6] } },
  },
]

/** A crop's placement in one format, with its shape's adjustments applied. */
export function mobiusPlacement(crop: MobiusCrop, size: MobiusSize): MobiusPlacement {
  const shape = size.width > size.height ? 'wide' : size.width < size.height ? 'tall' : 'square'
  return { scale: crop.scale, anchor: crop.anchor, to: crop.to, ...crop.at?.[shape] }
}

const stem = (look: MobiusLook, crop: MobiusCrop, ground: MobiusGround, size: MobiusSize) =>
  `one-agency_element_mobius-${look.id}-${crop.id}-${ground.id}_${size.id}`

/** File name of one still, e.g. one-agency_element_mobius-energy-sweep-on-navy_1080x1080.jpg. */
export const mobiusFileName = (look: MobiusLook, crop: MobiusCrop, ground: MobiusGround, size: MobiusSize) => `${stem(look, crop, ground, size)}.${ground.format}`

export const mobiusUrl = (look: MobiusLook, crop: MobiusCrop, ground: MobiusGround, size: MobiusSize) => `${MOBIUS_DIR}/${mobiusFileName(look, crop, ground, size)}`

export const mobiusPreviewUrl = (look: MobiusLook, crop: MobiusCrop, ground: MobiusGround, size: MobiusSize) =>
  `${MOBIUS_PREVIEWS_DIR}/${stem(look, crop, ground, size)}.webp`

/** One crop, look and ground at every size, for a download menu. */
export const mobiusDownloads = (look: MobiusLook, crop: MobiusCrop, ground: MobiusGround) =>
  MOBIUS_SIZES.map((size) => ({ url: mobiusUrl(look, crop, ground, size), label: size.label }))
