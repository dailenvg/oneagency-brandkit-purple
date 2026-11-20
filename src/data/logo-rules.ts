import type { LogoLockup } from './logos'

/**
 * Logo usage rules. PROPOSED (not signed off): measured from the moodboard masters (design/source/rebrand/) in their
 * own units.
 */

/** The horizontal master: ONE is 1223.2 x 330.42 units, the whole lockup 2956.67 wide. */
export const HORIZONTAL = { width: 2956.67, height: 330.42 } as const

/** The O (the mark) is 330 units tall: the full height of ONE. It is the unit for clear space. */
export const O_HEIGHT = 330

/** AGENCY cap height in master units: 183.66 in the horizontal lockup, 137.66 in the stacked one (0.7495 scale). */
export const AGENCY_CAP = { horizontal: 183.66, stacked: 137.66 } as const

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
  { lockup: 'horizontal', label: 'Horizontal', px: 160, why: 'AGENCY stays about 10 px tall. Below 160 px, use the stacked lockup or the mark.' },
  { lockup: 'stacked', label: 'Stacked', px: 96, why: 'AGENCY stays about 11 px tall. Below 96 px, use the mark.' },
  { lockup: 'mark', label: 'Mark (the O)', px: 24, why: 'The counter of the O stays open at 24 px wide. Below that, use the favicon tile.' },
]

export type MisuseId = 'stretch' | 'recolour' | 'effects' | 'busy' | 'rotate' | 'wrong-ground' | 'crop'

export interface Misuse {
  id: MisuseId
  title: string
  detail: string
}

export const MISUSE: Misuse[] = [
  { id: 'stretch', title: "Don't stretch or squash it", detail: 'Scale both ways together. Lock the aspect ratio.' },
  { id: 'recolour', title: "Don't recolour it outside the set", detail: 'Use the four variants as supplied: gradient on light, Mint and white on navy, Navy, white.' },
  { id: 'effects', title: "Don't add effects", detail: 'No shadows, outlines, glows or bevels. The gradient is the only colour effect, and it is in the artwork.' },
  { id: 'busy', title: "Don't put it on busy photos", detail: 'Use the white version on a calm, dark area, or add a Navy ground panel.' },
  { id: 'rotate', title: "Don't rotate it", detail: 'The logo sits level. Movement comes from the motion system, not tilt.' },
  { id: 'wrong-ground', title: "Don't use the reversed version on white", detail: 'Its AGENCY is white and disappears. Use the gradient or Navy version on light grounds.' },
  { id: 'crop', title: "Don't crop the lockup", detail: 'Keep the whole ONE, AGENCY and the clear space in frame.' },
]
