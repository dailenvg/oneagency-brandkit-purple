import type { LogoLockup } from './logos'

/**
 * Logo usage rules. PROPOSED (not signed off): measured from the live master
 * (oneagency.com/assets/img/one-agency-logo.svg) in its own units.
 */

/** The ONE mark is 230.01 units tall in a 906.23-wide master; the O fills the mark's full height. */
export const MARK = { width: 906.23, height: 230.01 } as const

/** "AGENCY" cap height in master units (measured from the SVG paths). */
export const AGENCY_CAP = 44

/** Clear space on every side, in O heights. */
export const CLEAR_SPACE_O = 0.5

export interface MinSize {
  lockup: LogoLockup
  label: string
  /** Minimum width on screen, px. */
  px: number
  why: string
}

/** Smallest on-screen width per lockup; below it, step down to the next lockup. */
export const MIN_SIZES: MinSize[] = [
  { lockup: 'stacked', label: 'Stacked', px: 160, why: '"AGENCY" stays about 8 px tall. Below 160 px, use the icon.' },
  { lockup: 'horizontal', label: 'Horizontal', px: 280, why: '"AGENCY" is small in this lockup: about 7 px tall at 280 px. Below that, use the stacked lockup or the icon.' },
  { lockup: 'icon', label: 'Icon (ONE mark)', px: 64, why: 'The ribbon joins stay open at 16 px tall. Below 64 px, use the favicon (the O crop).' },
]

export type MisuseId = 'stretch' | 'recolour' | 'effects' | 'busy' | 'rotate' | 'wrong-ground' | 'crop'

export interface Misuse {
  id: MisuseId
  title: string
  detail: string
}

export const MISUSE: Misuse[] = [
  { id: 'stretch', title: "Don't stretch or squash it", detail: 'Scale both ways together. Lock the aspect ratio.' },
  { id: 'recolour', title: "Don't recolour it outside the set", detail: 'Use the four variants as supplied: on dark, on light, white, ink.' },
  { id: 'effects', title: "Don't add effects", detail: 'No shadows, outlines, glows or bevels. The chrome is already lit.' },
  { id: 'busy', title: "Don't put the chrome on busy photos", detail: 'Use the white version on a calm, dark area, or add a ground panel.' },
  { id: 'rotate', title: "Don't rotate it", detail: 'The logo sits level. Movement comes from the motion system, not tilt.' },
  { id: 'wrong-ground', title: "Don't use the on-dark version on white", detail: 'Its "AGENCY" is white and disappears. Use on light or ink.' },
  { id: 'crop', title: "Don't crop the mark", detail: 'Keep the whole ONE and its clear space in frame.' },
]
