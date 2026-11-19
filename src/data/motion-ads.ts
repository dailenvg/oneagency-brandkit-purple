/**
 * The animated HTML5 ads: three concepts (src/data/ad-copy.ts) at three sizes. scripts/build-motion-ads.mjs writes the
 * sources and scripts/export-motion-ads.mjs renders the exports from this list, so it stays import-free.
 */

export type MotionAdConcept = 'audit' | 'proof' | 'award'

export interface MotionAdSize {
  width: number
  height: number
  /** Which ad text style column applies (src/data/ad-styles.ts). */
  scale: 'social' | 'banner'
}

export const MOTION_AD_SIZES: MotionAdSize[] = [
  { width: 1080, height: 1920, scale: 'social' },
  { width: 1080, height: 1080, scale: 'social' },
  { width: 300, height: 250, scale: 'banner' },
]

/** Seconds, including the final 4 s hold. Whole frames at 30 fps. */
export const MOTION_AD_DURATION: Record<MotionAdConcept, number> = { audit: 8, proof: 9, award: 8 }

export const MOTION_AD_CONCEPTS: MotionAdConcept[] = ['audit', 'proof', 'award']

export const motionAdSlug = (concept: MotionAdConcept, s: Pick<MotionAdSize, 'width' | 'height'>) => `${concept}-${s.width}x${s.height}`

export const motionAdSource = (concept: MotionAdConcept, s: MotionAdSize) => `/kit/motion/ads/${motionAdSlug(concept, s)}/index.html`

export type MotionAdExport = 'mp4' | 'webm' | 'gif' | 'png' | 'zip'

/** one-agency_motion-[concept]_[WxH].[ext] in /kit/motion/exports/. The .zip is the HTML5 source package. */
export const motionAdExport = (concept: MotionAdConcept, s: Pick<MotionAdSize, 'width' | 'height'>, ext: MotionAdExport) =>
  `/kit/motion/exports/one-agency_motion-${concept}_${s.width}x${s.height}.${ext}`
