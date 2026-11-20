import type { CreativeFormat } from '../../../data/ad-creative'
import { adText } from './ad-type'

interface AdCtaProps {
  label: string
  format: CreativeFormat
  /** Full-width Mint bar (the reference ads) instead of a pill. */
  block?: boolean
  /** Multiplier on the CTA size (long labels in narrow columns). */
  scale?: number
}

/** The one Mint CTA, Navy text, flat. Drawn, not interactive: it is part of the artwork. */
export function AdCta({ label, format, block = false, scale = 1 }: AdCtaProps) {
  return (
    <p
      className={`flex items-center justify-center bg-mint text-center ${block ? 'w-full rounded-[18px]' : 'self-start rounded-full whitespace-nowrap'}`}
      style={{ ...adText('cta', format, scale), padding: block ? '0.62em 1em' : '0.55em 1.25em' }}
    >
      {label}
    </p>
  )
}
