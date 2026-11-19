/**
 * Typed, defensive loader for the Magnific ad manifest (src/data/ads.generated.json, written by the Magnific agent).
 * The file may be absent, partial or slightly off-shape while templates are still being produced: anything that does
 * not validate is skipped and counted, never thrown.
 */

import { httpUrl, isObject, kitPath, size, text } from './manifest'

export type AdGroup = 'template' | 'sample' | 'imagery'

export type AdChannel = 'social' | 'carousel' | 'linkedin' | 'google-display' | 'web-banners' | 'other'

export interface AdFiles {
  png?: string
  jpg?: string
  webp?: string
}

export interface AdItem {
  id: string
  group: AdGroup
  channel: AdChannel
  /** Channel as written in the manifest, for display when it is not one of the known channels. */
  channelLabel: string
  concept: string | null
  name: string
  width: number
  height: number
  files: AdFiles
  magnificUrl: string | null
  notes: string | null
}

export interface AdManifest {
  brandKitUrl: string | null
  folderUrl: string | null
  items: AdItem[]
}

export type AdManifestState =
  | { status: 'missing' }
  | { status: 'invalid'; reason: string }
  | { status: 'ready'; manifest: AdManifest; skipped: number }

export const CHANNELS: { id: AdChannel; label: string }[] = [
  { id: 'social', label: 'Social' },
  { id: 'carousel', label: 'Carousel' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'google-display', label: 'Google display' },
  { id: 'web-banners', label: 'Web banners' },
  { id: 'other', label: 'Other' },
]

/** Ticket sizes per channel: shown as placeholders until the manifest lists real files. */
export const PLANNED_SIZES: Record<Exclude<AdChannel, 'other'>, [number, number][]> = {
  social: [
    [1080, 1080],
    [1080, 1350],
    [1080, 1920],
  ],
  carousel: [[1080, 1080]],
  linkedin: [
    [1200, 627],
    [1080, 1080],
  ],
  'google-display': [
    [1200, 628],
    [1200, 1200],
    [1200, 300],
  ],
  'web-banners': [
    [970, 250],
    [728, 90],
    [300, 600],
    [300, 250],
    [160, 600],
    [320, 50],
  ],
}

const GROUPS: AdGroup[] = ['template', 'sample', 'imagery']

/** Optional at build time: import.meta.glob returns an empty object when the file does not exist yet. */
const raw = import.meta.glob<unknown>('../data/ads.generated.json', { eager: true, import: 'default' })

export function normaliseChannel(v: unknown): AdChannel {
  const s = (text(v) ?? '').toLowerCase()
  if (s.includes('carousel')) return 'carousel'
  if (s.includes('linkedin')) return 'linkedin'
  if (s.includes('google') || s.includes('display') || s.includes('gdn')) return 'google-display'
  if (s.includes('banner') || s.includes('web')) return 'web-banners'
  if (s.includes('social') || s.includes('meta') || s.includes('instagram') || s.includes('facebook') || s.includes('story')) return 'social'
  return 'other'
}

function parseFiles(v: unknown): AdFiles {
  if (!isObject(v)) return {}
  const files: AdFiles = {}
  for (const key of ['png', 'jpg', 'webp'] as const) {
    const path = kitPath(v[key] ?? (key === 'jpg' ? v.jpeg : undefined))
    if (path) files[key] = path
  }
  return files
}

function parseItem(v: unknown, index: number): AdItem | null {
  if (!isObject(v)) return null
  const group = text(v.group)?.toLowerCase() as AdGroup | undefined
  const width = size(v.width)
  const height = size(v.height)
  const files = parseFiles(v.files)
  if (!group || !GROUPS.includes(group) || !width || !height || !Object.keys(files).length) return null
  const channelLabel = text(v.channel) ?? ''
  return {
    id: text(v.id) ?? `item-${index}`,
    group,
    channel: group === 'imagery' ? 'other' : normaliseChannel(channelLabel),
    channelLabel,
    concept: text(v.concept),
    name: text(v.name) ?? `${width}x${height}`,
    width,
    height,
    files,
    magnificUrl: httpUrl(v.magnificUrl),
    notes: text(v.notes),
  }
}

export function parseAdManifest(data: unknown): AdManifestState {
  if (!isObject(data)) return { status: 'invalid', reason: 'The manifest is not a JSON object.' }
  if (!Array.isArray(data.items)) return { status: 'invalid', reason: 'The manifest has no items list.' }
  const items = data.items.map(parseItem)
  const valid = items.filter((item): item is AdItem => item !== null)
  return {
    status: 'ready',
    skipped: items.length - valid.length,
    manifest: { brandKitUrl: httpUrl(data.brandKitUrl), folderUrl: httpUrl(data.folderUrl), items: valid },
  }
}

export function loadAdManifest(): AdManifestState {
  const modules = Object.values(raw)
  return modules.length ? parseAdManifest(modules[0]) : { status: 'missing' }
}

/** Best file to display: WebP, then PNG, then JPG. */
export const displaySrc = (files: AdFiles) => files.webp ?? files.png ?? files.jpg ?? null

export const fileList = (files: AdFiles) =>
  (Object.entries(files) as [keyof AdFiles, string][]).map(([format, url]) => ({ format: format.toUpperCase(), url }))

/** The manifest, parsed once per page load. */
export const AD_MANIFEST = loadAdManifest()

export const manifestItems = (group?: AdGroup) =>
  AD_MANIFEST.status === 'ready' ? AD_MANIFEST.manifest.items.filter((item) => !group || item.group === group) : []
