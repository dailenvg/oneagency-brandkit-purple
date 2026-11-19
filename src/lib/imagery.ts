import { fileList, type AdItem } from './ads'
import type { DownloadFile } from '../components/ui/DownloadMenu'

/** One starter-library subject: the master image and every crop the manifest lists for it. */
export interface ImagerySubject {
  /** e.g. "resort-guests". */
  id: string
  /** e.g. "Resort guests". */
  name: string
  /** The 2048 master (or the largest crop when there is none): what the card shows. */
  master: AdItem
  /** Master first, then the crops in manifest order. */
  crops: AdItem[]
}

/** "image-resort-guests-1080x1350" → "resort-guests". */
export const subjectId = (item: AdItem) => item.id.replace(/^image-/, '').replace(/-(master|\d+x\d+)$/, '')

/** The manifest names items "Image · resort guests · 4:5"; the middle part is the subject, the last the crop. */
const namePart = (item: AdItem, index: number) => item.name.split(' · ')[index]?.trim() ?? ''

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** "1:1 master" → "Master 1:1"; "4:5" stays. */
export const cropLabel = (item: AdItem) => {
  const crop = namePart(item, 2) || `${item.width}×${item.height}`
  return /master/i.test(crop) ? `Master ${crop.replace(/\s*master\s*/i, '')}`.trim() : crop
}

const FORMAT_LABEL: Record<string, string> = { WEBP: 'WebP' }

/** Groups the imagery items by subject, so each image shows once with all its crops behind one download menu. */
export function imagerySubjects(items: AdItem[]): ImagerySubject[] {
  const bySubject = new Map<string, AdItem[]>()
  for (const item of items) bySubject.set(subjectId(item), [...(bySubject.get(subjectId(item)) ?? []), item])
  return [...bySubject].map(([id, crops]) => {
    const master = crops.find((c) => c.id.endsWith('-master')) ?? crops.reduce((a, b) => (b.width * b.height > a.width * a.height ? b : a))
    return {
      id,
      name: capitalise(namePart(master, 1) || id.replace(/-/g, ' ')),
      master,
      crops: [master, ...crops.filter((c) => c !== master)],
    }
  })
}

/** Every crop in every format, one menu row per crop. */
export const subjectFiles = (subject: ImagerySubject): DownloadFile[] =>
  subject.crops.flatMap((crop) => fileList(crop.files).map((f) => ({ url: f.url, label: FORMAT_LABEL[f.format] ?? f.format, group: cropLabel(crop) })))
