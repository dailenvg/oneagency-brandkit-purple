import { ArrowUpRight } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import type { Face } from '../../data/type'
import { reveal } from '../../lib/motion'
import { DownloadMenu } from '../ui/DownloadMenu'

const WEIGHT_NAMES: Record<number, string> = { 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold' }

/** A face: specimen per weight, its job, file downloads and licence links. */
export function FaceSpecimen({ face }: { face: Face }) {
  return (
    <motion.article variants={reveal} className="flex flex-col gap-6 rounded-site border border-edge bg-surface p-6 sm:p-8">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className={`text-step-3 ${face.id === 'metal' ? 'accent-word' : 'font-bold'} ${face.className}`}>{face.family}</h2>
        <code className="font-code text-step-small text-text-3">{face.cssVar}</code>
      </header>
      <p className="text-step--1 text-text-2">{face.role}</p>
      <ul className="flex flex-col gap-3 border-y border-edge py-5">
        {face.weights.map((w) => (
          <li key={w} className="flex flex-col gap-1">
            <span className="text-step-small text-text-3">
              {WEIGHT_NAMES[w]} {w}
            </span>
            <span className={`text-step-2 leading-tight text-balance ${face.className} ${face.id === 'metal' ? 'accent-word' : ''}`} style={{ fontWeight: w }}>
              {face.specimen}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-4">
        <p className="flex flex-wrap gap-x-4 gap-y-2 text-step-small">
          <a href={face.page} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-touch items-center gap-1 font-semibold text-accent hover:text-text">
            {face.family} on Google Fonts <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
          <a href={face.licence} className="inline-flex min-h-touch items-center gap-1 font-semibold text-accent hover:text-text">
            SIL Open Font License 1.1 (TXT)
          </a>
        </p>
        <DownloadMenu title={`${face.family} font files`} files={face.files.map((f) => ({ url: f.url, label: f.label }))} />
      </div>
    </motion.article>
  )
}
