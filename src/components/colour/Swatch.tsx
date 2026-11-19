import { motion } from 'motion/react'
import type { ColourToken } from '../../data/tokens'
import { reveal } from '../../lib/motion'
import { Badge } from '../ui/Badge'
import { CopyButton } from '../ui/CopyButton'

/** One live-site token: chip, role and click-to-copy HEX, RGB and CSS var (or the CSS value for gradients and alphas). */
export function Swatch({ token }: { token: ColourToken }) {
  const solid = token.hex !== null && token.alpha === 1
  return (
    <motion.li variants={reveal} className="flex flex-col overflow-hidden rounded-site border border-edge bg-surface">
      <div className={`relative h-16 sm:h-28 ${token.alpha < 1 ? 'checker' : ''}`}>
        <div className="absolute inset-0" style={{ background: token.cssVar }} />
        {token.siteMarkedDerived && (
          <span className="absolute top-2 left-2">
            <Badge>Site marks “derived”</Badge>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-code text-step--1 font-semibold text-text">{token.name}</h3>
          <p className="mt-1 text-step-small text-text-3">{token.role}</p>
        </div>
        <div className="mt-auto flex flex-col gap-1.5">
          {solid ? (
            <>
              <CopyButton value={token.hex!.toUpperCase()} description={`HEX for ${token.name}`} />
              <CopyButton value={token.rgb!} description={`RGB for ${token.name}`} />
            </>
          ) : (
            <CopyButton value={token.value} label={token.value} description={`CSS value of ${token.name}`} />
          )}
          <CopyButton value={token.cssVar} description={`CSS variable ${token.name}`} />
        </div>
        <p className="font-num text-step-small text-text-3">Used {token.usageCount}× on the live site</p>
      </div>
    </motion.li>
  )
}
