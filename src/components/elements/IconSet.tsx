import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  ChartLineUp,
  ChatCircleDots,
  CheckCircle,
  Clock,
  EnvelopeSimple,
  Globe,
  MagnifyingGlass,
  Megaphone,
  Phone,
  ShieldCheck,
  Storefront,
  Target,
  Trophy,
  Users,
  type Icon,
} from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { AD_ICONS, iconUrl } from '../../data/elements'
import { pressCard, reveal } from '../../lib/motion'
import { Reveal } from '../ui/Reveal'

const COMPONENTS: Record<string, Icon> = {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  ChartLineUp,
  ChatCircleDots,
  CheckCircle,
  Clock,
  EnvelopeSimple,
  Globe,
  MagnifyingGlass,
  Megaphone,
  Phone,
  ShieldCheck,
  Storefront,
  Target,
  Trophy,
  Users,
}

/** The Phosphor bold subset used in ads. Each tile downloads its SVG. */
export function IconSet() {
  return (
    <Reveal as="ul" stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
      {AD_ICONS.map((icon) => {
        const Component = COMPONENTS[icon.name]
        return (
          <motion.li key={icon.name} variants={reveal}>
            <motion.a
              href={iconUrl(icon.file)}
              download
              aria-label={`Download ${icon.name} icon (SVG)`}
              className="group flex min-h-touch flex-col items-start gap-3 rounded-site border border-edge bg-surface p-4 transition-colors hover:border-accent"
              {...pressCard}
            >
              {Component && <Component className="size-8 text-text transition-colors group-hover:text-accent" aria-hidden />}
              <span>
                <span className="block text-step-small font-semibold text-text">{icon.name}</span>
                <span className="block text-step-small text-text-3">{icon.use}</span>
              </span>
            </motion.a>
          </motion.li>
        )
      })}
    </Reveal>
  )
}
