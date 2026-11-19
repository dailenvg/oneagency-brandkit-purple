import type { AssetGroupId } from './kit'

/** Shape of src/data/assets.generated.json, written by scripts/build-zips.mjs from the files on disk. */
export interface AssetEntry {
  /** Public URL path. */
  url: string
  name: string
  group: AssetGroupId
  /** Upper-case extension, e.g. "PNG". */
  format: string
  bytes: number
  width: number | null
  height: number | null
  /** Seconds, for video and GIF. */
  duration: number | null
  /** Image to show as the thumbnail: the file itself, a video's end frame, or null for an icon. */
  preview: string | null
}

export interface AssetZip {
  url: string
  bytes: number
  files: number
}

export interface AssetGroupSummary {
  id: AssetGroupId
  label: string
  count: number
  bytes: number
  zip: AssetZip | null
}

export interface AssetManifest {
  generatedAt: string
  version: string
  groups: AssetGroupSummary[]
  full: AssetZip
  files: AssetEntry[]
}

/** Optional at build time so a fresh checkout still builds before `npm run kit:zips` has run. */
const raw = import.meta.glob<AssetManifest>('../data/assets.generated.json', { eager: true, import: 'default' })

export const ASSET_MANIFEST: AssetManifest | null = Object.values(raw)[0] ?? null

type Known = Pick<AssetEntry, 'url' | 'bytes'> & Partial<AssetEntry>

const byUrl = new Map<string, Known>([
  ...(ASSET_MANIFEST?.files ?? []).map((f): [string, Known] => [f.url, f]),
  ...(ASSET_MANIFEST?.groups ?? []).flatMap((g): [string, Known][] => (g.zip ? [[g.zip.url, g.zip]] : [])),
  ...(ASSET_MANIFEST ? [[ASSET_MANIFEST.full.url, ASSET_MANIFEST.full] as [string, Known]] : []),
])

/** What the last `npm run kit:zips` found on disk for a public URL (files and ZIPs), or null. */
export const assetFor = (url: string) => byUrl.get(url) ?? null
