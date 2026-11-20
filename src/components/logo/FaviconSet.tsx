import { motion } from 'motion/react'
import { APP_TILES, FAVICONS, SOCIAL_IMAGES, type AppTile, type IconFile } from '../../data/logos'
import { fileFormat, formatSize } from '../../lib/format'
import { reveal } from '../../lib/motion'
import { DownloadLink } from '../ui/DownloadLink'
import { DownloadMenu } from '../ui/DownloadMenu'
import { Reveal } from '../ui/Reveal'
import { SmartImage } from '../ui/SmartImage'

const KIND_LABEL: Record<string, string> = {
  svg: 'Favicon, vector',
  png: 'Favicon',
  ico: 'Favicon, multi-size .ico',
  'apple-touch-icon': 'Apple touch icon',
  'app-icon': 'App icon',
  avatar: 'Social avatar',
  og: 'Link preview (Open Graph)',
}

/** Shown at true size up to 96 px, so the small favicons read as they will in a browser tab. */
const PREVIEW_MAX = 96

/** An app tile from the board, on a neutral stage so the Sky and Mint tiles keep their edge. */
function AppTileCard({ tile }: { tile: AppTile }) {
  return (
    <motion.li variants={reveal} className="flex flex-col gap-3 rounded-site border border-edge bg-surface p-4">
      <div data-theme="light" className="grid h-40 place-items-center rounded-site-sm bg-mist">
        <SmartImage src={tile.svg.url} alt={`${tile.label}: the ONE mark on an app icon tile`} width={112} height={112} style={{ width: 112, height: 112 }} imgClassName="size-full" />
      </div>
      <div className="flex items-start justify-between gap-3">
        <p className="text-step-small">
          <span className="font-semibold text-text">{tile.label}</span>
          <span className="block text-text-3">{tile.note}</span>
        </p>
        <DownloadMenu
          title={tile.label}
          files={[{ url: tile.svg.url, label: 'SVG', bytes: tile.svg.bytes }, ...tile.pngs.map((png) => ({ url: png.url, label: `PNG ${png.width} px`, bytes: png.bytes }))]}
        />
      </div>
    </motion.li>
  )
}

function IconTile({ file }: { file: IconFile }) {
  const size = file.width ? Math.min(file.width, PREVIEW_MAX) : PREVIEW_MAX
  const dims = formatSize(file.width, file.height)
  return (
    <motion.li variants={reveal} className="flex flex-col gap-3 rounded-site border border-edge bg-surface p-4">
      {/* Mist, like the app tiles: the favicons are navy tiles, so a navy stage would hide their edge and corners. */}
      <div data-theme="light" className="grid h-28 place-items-center rounded-site-sm bg-mist">
        <SmartImage src={file.url} alt={`${KIND_LABEL[file.kind]}${dims ? `, ${dims}` : ''}`} width={size} height={size} style={{ width: size, height: size }} imgClassName="size-full" />
      </div>
      <p className="text-step-small">
        <span className="font-semibold text-text">{KIND_LABEL[file.kind]}</span>
        <span className="block text-text-3 tabular-nums">{dims ?? 'Any size'}</span>
      </p>
      <DownloadLink url={file.url} label={fileFormat(file.url)} bytes={file.bytes} className="mt-auto self-start" />
    </motion.li>
  )
}

function SocialTile({ file }: { file: IconFile }) {
  const wide = (file.width ?? 0) > (file.height ?? 0)
  return (
    <motion.li variants={reveal} className={`flex flex-col gap-3 rounded-site border border-edge bg-surface p-4 ${wide ? 'sm:col-span-2' : ''}`}>
      <SmartImage
        src={file.url}
        alt={KIND_LABEL[file.kind]}
        width={file.width ?? undefined}
        height={file.height ?? undefined}
        // Holds the image's shape while loading and if it fails, so the error state has room for Retry.
        style={file.width && file.height ? { aspectRatio: `${file.width} / ${file.height}` } : undefined}
        className="rounded-site-sm bg-ground"
        imgClassName="size-full"
      />
      <p className="text-step-small">
        <span className="font-semibold text-text">{KIND_LABEL[file.kind]}</span>
        <span className="block text-text-3 tabular-nums">{formatSize(file.width, file.height)}</span>
      </p>
      <DownloadLink url={file.url} label="PNG" bytes={file.bytes} className="mt-auto self-start" />
    </motion.li>
  )
}

/** App tiles from the board, favicons (the navy tile), app icons, social avatar and link preview. */
export function FaviconSet() {
  return (
    <div className="flex flex-col gap-4">
      <Reveal as="ul" stagger className="grid gap-4 sm:grid-cols-3">
        {APP_TILES.map((t) => (
          <AppTileCard key={t.id} tile={t} />
        ))}
      </Reveal>
      {/* Four across only from xl: below that a column is too narrow for the "PNG 1.0 KB" chip and it spills past the card. */}
      <Reveal as="ul" stagger className="grid gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {FAVICONS.map((f) => (
          <IconTile key={f.url} file={f} />
        ))}
      </Reveal>
      <Reveal as="ul" stagger className="grid gap-4 sm:grid-cols-3">
        {SOCIAL_IMAGES.map((f) => (
          <SocialTile key={f.url} file={f} />
        ))}
      </Reveal>
    </div>
  )
}
