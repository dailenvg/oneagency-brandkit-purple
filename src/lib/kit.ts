/**
 * Kit-wide constants shared by the site and the Node scripts (scripts/*.mjs import this file directly, so it stays
 * import-free and uses erasable TypeScript only).
 */

export const KIT = {
  version: '1.1',
  /** The release before this one, for the "what's new" note. */
  previousVersion: '1.0',
  updated: '2026-11-20',
  site: 'https://oneagency.com',
  /** The rebrand moodboard: palette and logo masters (design/source/rebrand/). */
  board: 'Figma file Ex4UgCrCeAKPnv8H6BdHMm, node 133:305',
  boardExported: '2026-11-20',
} as const

export const VERSION_NOTE = `Brand kit v${KIT.version} · Updated ${KIT.updated}`

/**
 * Download groups, each with its own ZIP. Order is the filter order on the site. A group is the folder public/kit/[id]
 * unless it lists `paths` (folders or single files under public/).
 */
export const ASSET_GROUPS = [
  { id: 'logos', label: 'Logos' },
  { id: 'colour', label: 'Colour' },
  { id: 'fonts', label: 'Fonts' },
  { id: 'elements', label: 'Elements' },
  { id: 'glass', label: 'Glass & texture', paths: ['kit/illustrations', 'kit/textures', 'kit/references', 'vendor/ciq/README.md'] },
  { id: 'templates', label: 'Templates' },
  { id: 'ads', label: 'Creative ads' },
  { id: 'imagery', label: 'Imagery' },
  { id: 'motion', label: 'Motion' },
  { id: 'copy', label: 'Copy' },
] as const

export type AssetGroupId = (typeof ASSET_GROUPS)[number]['id']

/** Where a group's files live, relative to public/. */
export const groupPaths = (id: AssetGroupId): readonly string[] => {
  const group = ASSET_GROUPS.find((g) => g.id === id)
  return group && 'paths' in group ? group.paths : [`kit/${id}`]
}

export const zipUrl = (group: AssetGroupId) => `/kit/zips/one-agency_kit_${group}.zip`

export const FULL_KIT_URL = '/kit/zips/one-agency_kit_full.zip'

/** Google Fonts pages for the two brand faces (both SIL Open Font License 1.1). */
export const FONT_PAGES = {
  unbounded: 'https://fonts.google.com/specimen/Unbounded',
  geist: 'https://fonts.google.com/specimen/Geist',
} as const
