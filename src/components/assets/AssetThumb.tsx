import { File, FileCode, FileText, FileZip, FilmSlate, TextAa } from '@phosphor-icons/react'
import type { AssetEntry } from '../../lib/assets'
import { SmartImage } from '../ui/SmartImage'

const FONT = /font_(geist|lato|metal)-(\d+)/
const FONT_CLASS = { geist: 'font-sans', lato: 'font-num', metal: 'font-accent' } as const

/** Files drawn for light grounds (on-light and ink logos) preview on paper. */
const LIGHT = /-(on-light|ink)[._]/

const ICONS: Record<string, typeof File> = { ZIP: FileZip, MD: FileText, TXT: FileText, JSON: FileCode, CSS: FileCode, JS: FileCode, MJS: FileCode, HTML: FileCode, MP4: FilmSlate, WEBM: FilmSlate }

/** Previews wider than this (width / height) get a landscape frame, so horizontal logos and banners stay legible. */
const WIDE = 1.6

/**
 * Preview: the image itself, a video's end frame, the font set in itself, or a format icon. Square by default;
 * landscape (96×64, 144×80 from sm) for wide images.
 */
export function AssetThumb({ asset }: { asset: AssetEntry }) {
  const onLight = !!asset.preview && LIGHT.test(asset.name)
  const ground = onLight ? 'bg-paper' : 'bg-ground'
  const wide = !!asset.preview && !!asset.width && !!asset.height && asset.width / asset.height > WIDE
  const shape = wide ? 'h-16 w-24 sm:h-20 sm:w-36' : 'size-16 sm:size-20'
  const frame = `${ground} ${shape} grid shrink-0 place-items-center overflow-hidden rounded-site-sm border border-edge`
  if (asset.preview) {
    // Image previews sit on the ground they were drawn for, whatever the hub theme.
    return (
      <div data-theme={onLight ? 'light' : 'dark'} className={frame}>
        <SmartImage src={asset.preview} alt="" compact className="size-full" imgClassName={`size-full object-contain ${wide ? 'px-2 py-1' : 'p-2'}`} />
      </div>
    )
  }
  const font = asset.name.match(FONT)
  if (font) {
    const [, family, weight] = font
    return (
      <div className={frame} aria-hidden>
        <span className={`text-step-2 ${FONT_CLASS[family as keyof typeof FONT_CLASS]} ${family === 'metal' ? 'accent-word' : ''}`} style={{ fontWeight: Number(weight) }}>
          Aa
        </span>
      </div>
    )
  }
  const Icon = ICONS[asset.format] ?? (asset.format === 'TTF' || asset.format === 'WOFF2' ? TextAa : File)
  return (
    <div className={frame} aria-hidden>
      <Icon className="size-7 text-text-3" />
    </div>
  )
}
