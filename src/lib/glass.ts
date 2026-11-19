/**
 * Typed, defensive loader for the Magnific glass manifest (src/data/glass.generated.json, written by the Magnific
 * agent): illustrations and textures in the glass style. The file may be absent, partial or off-shape while they are
 * being made; anything that does not validate is skipped and counted, never thrown.
 *
 * Expected: { folderUrl?, items: [{ id, kind: "illustration" | "texture", name, subject, theme: "dark" | "light" | "any",
 * width, height, files: { png?, jpg?, webp?, svg? }, magnificUrl?, notes }] }, file paths starting /kit/.
 */

import { httpUrl, isObject, kitPath, size, text } from './manifest'

export type GlassKind = 'illustration' | 'texture'
export type GlassTheme = 'dark' | 'light' | 'any'

export interface GlassFiles {
  png?: string
  jpg?: string
  webp?: string
  svg?: string
}

export interface GlassItem {
  id: string
  kind: GlassKind
  name: string
  subject: string | null
  theme: GlassTheme
  width: number
  height: number
  files: GlassFiles
  magnificUrl: string | null
  notes: string | null
}

export type GlassManifestState =
  | { status: 'missing' }
  | { status: 'invalid'; reason: string }
  | { status: 'ready'; items: GlassItem[]; folderUrl: string | null; skipped: number }

/** Optional at build time: import.meta.glob returns an empty object when the file does not exist yet. */
const raw = import.meta.glob<unknown>('../data/glass.generated.json', { eager: true, import: 'default' })

const FORMATS = ['png', 'jpg', 'webp', 'svg'] as const

function parseKind(v: unknown): GlassKind | null {
  const s = (text(v) ?? '').toLowerCase()
  if (s.startsWith('illustration')) return 'illustration'
  if (s.startsWith('texture')) return 'texture'
  return null
}

function parseTheme(v: unknown): GlassTheme {
  const s = (text(v) ?? '').toLowerCase()
  return s === 'dark' || s === 'light' ? s : 'any'
}

function parseFiles(v: unknown): GlassFiles {
  if (!isObject(v)) return {}
  const files: GlassFiles = {}
  for (const format of FORMATS) {
    const path = kitPath(v[format] ?? (format === 'jpg' ? v.jpeg : undefined))
    if (path) files[format] = path
  }
  return files
}

function parseItem(v: unknown, index: number): GlassItem | null {
  if (!isObject(v)) return null
  const kind = parseKind(v.kind)
  const width = size(v.width)
  const height = size(v.height)
  const files = parseFiles(v.files)
  if (!kind || !width || !height || !Object.keys(files).length) return null
  return {
    id: text(v.id) ?? `${kind}-${index}`,
    kind,
    name: text(v.name) ?? `${kind === 'illustration' ? 'Illustration' : 'Texture'} ${index + 1}`,
    subject: text(v.subject),
    theme: parseTheme(v.theme),
    width,
    height,
    files,
    magnificUrl: httpUrl(v.magnificUrl),
    notes: text(v.notes),
  }
}

export function parseGlassManifest(data: unknown): GlassManifestState {
  if (!isObject(data)) return { status: 'invalid', reason: 'The manifest is not a JSON object.' }
  if (!Array.isArray(data.items)) return { status: 'invalid', reason: 'The manifest has no items list.' }
  const items = data.items.map(parseItem)
  const valid = items.filter((item): item is GlassItem => item !== null)
  return { status: 'ready', items: valid, folderUrl: httpUrl(data.folderUrl), skipped: items.length - valid.length }
}

/** The manifest, parsed once per page load. */
export const GLASS_MANIFEST: GlassManifestState = (() => {
  const modules = Object.values(raw)
  return modules.length ? parseGlassManifest(modules[0]) : { status: 'missing' }
})()

export const glassItems = (kind?: GlassKind) => (GLASS_MANIFEST.status === 'ready' ? GLASS_MANIFEST.items.filter((item) => !kind || item.kind === kind) : [])

/** Best file to show: WebP, then PNG, JPG, SVG. */
export const glassDisplaySrc = (files: GlassFiles) => files.webp ?? files.png ?? files.jpg ?? files.svg ?? null

export const glassFileList = (files: GlassFiles) => FORMATS.flatMap((format) => (files[format] ? [{ format: format.toUpperCase(), url: files[format]! }] : []))
