/** Glass and texture guidelines, codified from the nine reference ads (src/data/glass-references.ts). */

/** Numbered parts of a glass card, as drawn on the anatomy diagram. */
export const GLASS_ANATOMY = [
  { part: 'Rim light', value: '1.25 px gradient border: rose at two corners, fading to clear along the edges.', token: '--glass-rim' },
  { part: 'Fill', value: 'Night tint at 55% under a white sheen (13% to 4%), rose 9% in the far corner.', token: '--glass-fill' },
  { part: 'Specular highlight', value: 'A soft white bloom at the top left (30%), as if lit from above.', token: '--glass-specular' },
  { part: 'Inner glow', value: 'Rose 45%, 28 px, inset; a 1 px white line along the top edge.', token: '--glass-inner-glow' },
  { part: 'Under-glow', value: 'A rose glow on the ground beneath the object, plus a deep drop shadow.', token: '--glass-under-glow' },
  { part: 'Radius', value: '24 px cards, 18 px icon tiles, 12 px small parts, full pill for toggles.', token: '--glass-radius' },
] as const

export const GLASS_BLUR = '18 px backdrop blur at 140% saturation behind every glass surface.'

export const DEPTH_RULES = [
  'Two or three layers. Never more.',
  'Back layers recede up and to one side: 18% across and 14% up per step.',
  'Each step back: 90% then 80% scale, 55% then 30% opacity, 1.5 px more blur.',
  'Only the front layer carries content.',
  'The check badge sits on the front card and breaks its edge, bottom right.',
]

export const USE_GLASS = [
  'Hero objects in ads: the one thing the eye lands on.',
  'Icon tiles that list what the offer includes.',
  'A result marker: the check badge, the switched-on toggle.',
  'Dashboard cards on this hub, over the theme ground.',
]

export const USE_FLAT = [
  'Body copy, tables and anything people read for long.',
  'CTAs: the rose pill stays flat and solid.',
  'Proof bars and stats: numbers need a still ground.',
  'Small sizes (under 300 px wide), where the rim light turns to noise.',
]

export const GLASS_DO = [
  'Near-black ground (or the violet variant), so the rim light carries.',
  'One glass object or stack per layout, at a slight perspective.',
  'Rose for rim, glow, dots and checks; white or silver icons.',
  'Halftone arc or particle stream behind the object, not over it.',
]

export const GLASS_DONT = [
  'Glass on a busy photo: the blur turns to mud.',
  'Rim light in a colour other than rose.',
  'Text inside the blur or the halftone without a solid panel.',
  'Stacks deeper than three, or every element in glass.',
]

/** One entry per kit component in src/kit/glass/: what it is for and the call that draws it. */
export const GLASS_COMPONENTS = [
  { name: 'GlassCard', use: 'The glass body: fill, blur, rim light, highlight, glow. Optional depth stack.', code: '<GlassCard depth={2}>…</GlassCard>' },
  { name: 'GlassIcon', use: 'Icon tile with a vertical divider and a label, as in the offer grids.', code: '<GlassIcon icon={MagnifyingGlass} label="SEO audit" />' },
  { name: 'CheckBadge', use: 'Rose glass circle with a white check: the result marker.', code: '<CheckBadge size="lg" />' },
  { name: 'HalftoneArc', use: 'Rose dot arc behind objects; dots shrink toward the ends and edges.', code: '<HalftoneArc className="w-full" />' },
  { name: 'ParticleStream', use: 'Fine dots and lines in a wave, white to rose, drifting left to right.', code: '<ParticleStream className="h-40 w-full" />' },
  { name: 'Grain', use: 'Film grain over a composition: overlay on dark, multiply on light.', code: '<Grain />' },
  { name: 'GlowGround', use: 'Rose under-glow beneath an object, or the violet-to-night ground.', code: '<GlowGround variant="violet" />' },
] as const

export type GlassComponentName = (typeof GLASS_COMPONENTS)[number]['name']
