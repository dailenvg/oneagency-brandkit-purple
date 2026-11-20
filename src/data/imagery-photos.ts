/**
 * The concept 01 "Nova" photo set (one-agency-rebrand-v2, public/palette/), copied into public/kit/imagery/photos/.
 * Nova drew each palette colour from one of these abstract photos. File names are Unsplash photo ids in the source, kept
 * here as `unsplashId` for the credit; the photographers are not recorded in the source repo.
 */

export interface BrandPhoto {
  /** Kebab-case subject, the file name part. */
  id: string
  title: string
  /** One sentence on what the photo shows, for screen readers. */
  alt: string
  /** The palette colour Nova paired the photo with (Nova's Deep Plum and Ink map to Navy in this palette). */
  mood: 'Mint' | 'Ultra Violet' | 'Navy' | 'Mist'
  unsplashId: string
  url: string
  width: number
  height: number
  bytes: number
}

const DIR = '/kit/imagery/photos'

const photo = (id: string, title: string, alt: string, mood: BrandPhoto['mood'], unsplashId: string, width: number, height: number, bytes: number): BrandPhoto => ({
  id,
  title,
  alt,
  mood,
  unsplashId,
  url: `${DIR}/one-agency_photo-${id}_${width}x${height}.webp`,
  width,
  height,
  bytes,
})

export const BRAND_PHOTOS: BrandPhoto[] = [
  photo('mint-light-streaks', 'Mint light streaks', 'Fine mint and green light streaks falling diagonally across a dark ground.', 'Mint', 'bHd7tm-2oWU', 506, 900, 134084),
  photo('violet-silk-wave', 'Violet silk wave', 'A soft violet fold of light curving across a deep purple ground.', 'Ultra Violet', '5Q9Gf0WSyLk', 900, 507, 5214),
  photo('violet-ribbon-swirl', 'Violet ribbon swirl', 'Glossy purple and pink ribbons of fine lines looping around a dark centre.', 'Navy', '1uyWq9xVwcE', 900, 600, 25664),
  photo('dark-curves', 'Dark curves', 'Smooth black surfaces curving in soft layers, lit from above.', 'Navy', 'NYtHU9TLkPE', 900, 507, 3078),
  photo('white-layered-waves', 'White layered waves', 'Thin white layers rippling in gentle waves, like stacked paper.', 'Mist', 'pHUF3pNk1XA', 900, 600, 10506),
]

export const unsplashUrl = (id: string) => `https://unsplash.com/photos/${id}`
