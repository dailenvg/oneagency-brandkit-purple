import { motion } from 'motion/react'
import { FAVICONS, SOCIAL_IMAGES, type IconFile } from '../../data/logos'
import { fileFormat, formatSize } from '../../lib/format'
import { reveal } from '../../lib/motion'
import { DownloadLink } from '../ui/DownloadLink'
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

function IconTile({ file }: { file: IconFile }) {
  const size = file.width ? Math.min(file.width, PREVIEW_MAX) : PREVIEW_MAX
  const dims = formatSize(file.width, file.height)
  return (
    <motion.li variants={reveal} className="flex flex-col gap-3 rounded-site border border-edge bg-surface p-4">
      <div data-theme="dark" className="grid h-28 place-items-center rounded-site-sm bg-ground">
        <SmartImage src={file.url} alt={`${KIND_LABEL[file.kind]}${dims ? `, ${dims}` : ''}`} width={size} height={size} style={{ width: size, height: size }} imgClassName="size-full" />
      </div>
      <p className="text-step-small">
        <span className="font-semibold text-text">{KIND_LABEL[file.kind]}</span>
        <span className="block font-num text-text-3">{dims ?? 'Any size'}</span>
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
        <span className="block font-num text-text-3">{formatSize(file.width, file.height)}</span>
      </p>
      <DownloadLink url={file.url} label="PNG" bytes={file.bytes} className="mt-auto self-start" />
    </motion.li>
  )
}

/** Favicons (the O crop, after the live site's favicon), app icons, social avatar and link preview. */
export function FaviconSet() {
  return (
    <div className="flex flex-col gap-4">
      <Reveal as="ul" stagger className="grid gap-4 min-[360px]:grid-cols-2 sm:grid-cols-4">
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
