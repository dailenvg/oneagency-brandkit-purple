/**
 * The photo set in public/kit/imagery/photos/: one photo per palette mood. Four come from concept 01 "Nova"
 * (one-agency-rebrand-v2, public/palette/), where the file names are Unsplash photo ids; the photographers are not
 * recorded there, so the credit is the id and its Unsplash page. The Mint photo is AI-generated in Magnific; its credit
 * is the Magnific creation.
 */

/** Where a photo comes from, which decides its credit line and link. */
export type PhotoSource = { kind: 'unsplash'; id: string } | { kind: 'magnific'; creation: string; url: string }

export interface BrandPhoto {
  /** Kebab-case subject, the file name part. */
  id: string
  title: string
  /** One sentence on what the photo shows, for screen readers. */
  alt: string
  /** The palette colour the photo is paired with (Nova's Deep Plum and Ink map to Navy in this palette). */
  mood: 'Mint' | 'Ultra Violet' | 'Navy' | 'Mist'
  source: PhotoSource
  url: string
  width: number
  height: number
}

export interface PhotoCredit {
  /** The visible credit, e.g. "Unsplash 5Q9Gf0WSyLk" or "AI-generated in Magnific". */
  label: string
  /** The source page. */
  url: string
  /** What the link opens, for its accessible name. */
  destination: string
}

/** The credit line and link for a photo, by where it comes from. */
export function photoCredit(source: PhotoSource): PhotoCredit {
  if (source.kind === 'unsplash') {
    return { label: `Unsplash ${source.id}`, url: `https://unsplash.com/photos/${source.id}`, destination: "the photo's source page" }
  }
  return { label: 'AI-generated in Magnific', url: source.url, destination: `the Magnific creation "${source.creation}"` }
}

const unsplash = (id: string): PhotoSource => ({ kind: 'unsplash', id })
const magnific = (creation: string, url: string): PhotoSource => ({ kind: 'magnific', creation, url })

const DIR = '/kit/imagery/photos'

const photo = (id: string, title: string, alt: string, mood: BrandPhoto['mood'], source: PhotoSource, width: number, height: number): BrandPhoto => ({
  id,
  title,
  alt,
  mood,
  source,
  url: `${DIR}/one-agency_photo-${id}_${width}x${height}.webp`,
  width,
  height,
})

export const BRAND_PHOTOS: BrandPhoto[] = [
  photo('mint-paper-waves', 'Mint paper waves', 'Layers of pale Mint paper curving across the frame in soft, overlapping waves, matte and evenly lit.', 'Mint', magnific('ONE Agency v2 · Photo · Mint paper waves', 'https://www.magnific.com/app/creation/Xm9WAQjBfo'), 900, 600),
  photo('violet-silk-wave', 'Violet silk wave', 'A soft violet fold of light curving across a deep purple ground.', 'Ultra Violet', unsplash('5Q9Gf0WSyLk'), 900, 507),
  photo('violet-ribbon-swirl', 'Violet ribbon swirl', 'Glossy purple and pink ribbons of fine lines sweeping around an open violet centre.', 'Navy', unsplash('1uyWq9xVwcE'), 900, 600),
  photo('dark-curves', 'Dark curves', 'Smooth black surfaces curving in soft layers, lit faintly from above.', 'Navy', unsplash('NYtHU9TLkPE'), 900, 507),
  photo('white-layered-waves', 'White layered waves', 'Thin white layers rippling in gentle waves, like stacked paper.', 'Mist', unsplash('pHUF3pNk1XA'), 900, 600),
]

