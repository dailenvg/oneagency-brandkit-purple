import { motion } from 'motion/react'
import type { LogoAsset } from '../../data/logos'
import { reveal } from '../../lib/motion'
import { DownloadMenu } from '../ui/DownloadMenu'
import { SmartImage } from '../ui/SmartImage'

const onLight = (logo: LogoAsset) => logo.ground === '--paper'

/** One lockup in one colour variant, on the ground it is made for, with every file. */
export function LogoVariantCard({ logo }: { logo: LogoAsset }) {
  const { svg } = logo
  return (
    <motion.li variants={reveal} className="flex flex-col overflow-hidden rounded-site border border-edge bg-surface">
      <div data-theme={onLight(logo) ? 'light' : 'dark'} className={`grid aspect-video place-items-center p-8 ${onLight(logo) ? 'bg-paper' : 'bg-ground'}`}>
        <SmartImage
          src={svg.url}
          alt={`${logo.lockupLabel}, ${logo.label}`}
          width={Math.round(svg.width)}
          height={Math.round(svg.height)}
          style={{ aspectRatio: `${svg.width} / ${svg.height}` }}
          className="w-4/5"
          imgClassName="size-full"
        />
      </div>
      <div className="flex flex-1 items-start justify-between gap-3 p-5">
        <div>
          {/* h2: these cards sit straight under the view's h1. */}
          <h2 className="font-semibold text-text">{logo.label}</h2>
          <p className="mt-1 text-step-small text-text-3">{logo.note}</p>
        </div>
        <DownloadMenu
          // "Stacked, On dark": the lockup's short name, without its "(primary, master layout)" aside.
          title={`${logo.lockupLabel.replace(/\s*\(.*\)$/, '')}, ${logo.label}`}
          files={[
            { url: svg.url, label: 'SVG', bytes: svg.bytes },
            ...logo.pngs.map((png) => ({ url: png.url, label: `PNG ${png.scale}x`, bytes: png.bytes })),
          ]}
        />
      </div>
    </motion.li>
  )
}
