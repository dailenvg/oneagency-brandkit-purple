import { motion } from 'motion/react'
import type { ColourToken } from '../../data/tokens'
import { reveal } from '../../lib/motion'
import { CopyButton } from '../ui/CopyButton'

/** A system token, compact: chip, name and click-to-copy HEX and RGB (or the CSS value for gradients and alphas). */
export function Swatch({ token }: { token: ColourToken }) {
  const solid = token.hex !== null && token.alpha === 1
  const name = token.label ?? token.name
  return (
    <motion.li variants={reveal} className="flex flex-col overflow-hidden rounded-site border border-edge-soft bg-surface shadow-card">
      <div className={`relative h-20 border-b border-edge-soft sm:h-24 ${token.alpha < 1 ? 'checker' : ''}`}>
        <div className="absolute inset-0" style={{ background: token.cssVar }} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <h3 className="truncate font-code text-step--1 font-semibold text-text">{name}</h3>
        <div className="mt-auto flex flex-col gap-1.5">
          {solid ? (
            <>
              <CopyButton value={token.hex!.toUpperCase()} description={`HEX for ${name}`} />
              <CopyButton value={token.rgb!} description={`RGB for ${name}`} />
            </>
          ) : (
            <CopyButton value={token.value} label={token.value} description={`CSS value of ${name}`} />
          )}
        </div>
      </div>
    </motion.li>
  )
}
