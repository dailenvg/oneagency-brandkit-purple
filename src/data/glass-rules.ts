/** Glass and texture guidelines, codified from the nine reference ads (src/data/glass-references.ts). */

/** Numbered parts of a glass card, as drawn on the anatomy diagram. */
export const GLASS_ANATOMY = [
  { part: 'Rim light', value: '1.25 px gradient border: Mint along the top edge (Ultra Violet on light), fading to clear down the sides.', token: '--glass-rim' },
  { part: 'Colour and frost', value: 'Navy frost at 42% under a 7% milky wash; Mint 20% at the top edge runs down to clear by 78%.', token: '--glass-fill' },
  { part: 'Sheen and top light', value: 'A diagonal strip-light sheen across the face (9% white) and a soft top light along the upper edge (16%).', token: '--glass-sheen' },
  { part: 'Slab edge', value: 'A 1 px white line along the top and a 2 px darker edge along the bottom, so the card reads as a thin slab of glass.', token: '--glass-wall' },
  { part: 'Contact shadow', value: 'A neutral shadow 14 px right and 26 px down, never coloured. Radii: 24 px cards, 12 px tiles, full pill for toggles.', token: '--glass-shadow' },
] as const

export const GLASS_BLUR = '26 px backdrop blur at 160% saturation behind every glass surface: the frost the glass studio renders.'

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
  'CTAs: the Mint pill stays flat and solid.',
  'Proof bars and stats: numbers need a still ground.',
  'Small sizes (under 300 px wide), where the rim light turns to noise.',
]

export const GLASS_DO = [
  'Navy ground (or the violet variant), so the rim light carries.',
  'One glass object or stack per layout, at a slight perspective.',
  'Mint for the rim light, dots and checks; white or silver icons.',
  'Halftone arc behind the object, not over it.',
]

export const GLASS_DONT = [
  'Glass on a busy photo: the blur turns to mud.',
  'Rim light in a colour other than Mint (Ultra Violet on light).',
  'Text inside the blur or the halftone without a solid panel.',
  'Stacks deeper than three, or every element in glass.',
  'Any glow, halo or backlight effect.',
]

/** One entry per kit component in src/kit/glass/: what it is for and the call that draws it. */
export const GLASS_COMPONENTS = [
  { name: 'GlassCard', use: 'The glass body: frost, milky wash, top-down colour, rim light, sheen, slab edge and contact shadow. Optional depth stack.', code: '<GlassCard depth={2}>…</GlassCard>' },
  { name: 'GlassIcon', use: 'Icon tile with a vertical divider and a label, as in the offer grids.', code: '<GlassIcon icon={MagnifyingGlass} label="SEO audit" />' },
  { name: 'CheckBadge', use: 'Mint glass circle with a navy check: the result marker.', code: '<CheckBadge size="lg" />' },
  { name: 'HalftoneArc', use: 'Mint dot arc behind objects; dots shrink toward the ends and edges.', code: '<HalftoneArc className="w-full" />' },
  { name: 'Grain', use: 'Film grain over a composition: overlay on dark, multiply on light.', code: '<Grain />' },
] as const

export type GlassComponentName = (typeof GLASS_COMPONENTS)[number]['name']
