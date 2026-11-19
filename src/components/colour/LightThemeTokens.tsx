import { motion } from 'motion/react'
import { reveal } from '../../lib/motion'
import { CopyButton } from '../ui/CopyButton'
import { Reveal } from '../ui/Reveal'

/** How the hub's light theme maps each role (src/styles/theme.css): the live dark token, and the paper-and-ink one used on light. */
const ROLES = [
  { role: 'Ground', dark: '--ground', light: '--paper-2' },
  { role: 'Surface', dark: '--surface', light: '--paper' },
  { role: 'Raised surface', dark: '--surface-2', light: '--lavender' },
  { role: 'Text', dark: '--text', light: '--ink' },
  { role: 'Secondary text', dark: '--text-2', light: '--ink-2' },
  { role: 'Muted text', dark: '--text-3', light: '--ink-3' },
  { role: 'Accent text and focus ring', dark: '--rose', light: '--kit-rose-700' },
  { role: 'Info', dark: '--lilac', light: '--kit-lilac-700' },
]

function Chip({ token }: { token: string }) {
  return <span aria-hidden className="size-8 shrink-0 rounded-full border border-edge" style={{ background: `var(${token})` }} />
}

/** The light theme's role map: dark token beside its light replacement, each light token one tap to copy. */
export function LightThemeTokens() {
  return (
    <Reveal as="ul" stagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {ROLES.map((r) => (
        <motion.li key={r.role} variants={reveal} className="flex flex-col gap-3 rounded-site border border-edge bg-surface p-4">
          <p className="font-semibold text-text">{r.role}</p>
          <div className="flex items-center gap-2">
            <Chip token={r.dark} />
            <Chip token={r.light} />
            <span className="sr-only">
              Dark {r.dark}, light {r.light}
            </span>
            <span aria-hidden className="font-code text-step-small text-text-3">
              {r.dark} → {r.light}
            </span>
          </div>
          <CopyButton value={`var(${r.light})`} description={`light theme ${r.role.toLowerCase()} token`} />
        </motion.li>
      ))}
    </Reveal>
  )
}
