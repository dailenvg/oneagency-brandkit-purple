import type { CreativeFormat } from '../../../data/ad-creative'
import { adText } from './ad-type'

interface AdCtaProps {
  label: string
  format: CreativeFormat
  /** Full-width rose bar (the reference ads) instead of a pill. */
  block?: boolean
  /** Multiplier on the CTA size (long labels in narrow columns). */
  scale?: number
}

/** The one rose CTA, dark text, with the rose glow beneath it. Drawn, not interactive: it is part of the artwork. */
export function AdCta({ label, format, block = false, scale = 1 }: AdCtaProps) {
  return (
    <p
      className={`flex items-center justify-center bg-rose text-center shadow-[0_10px_36px_-10px_color-mix(in_srgb,var(--rose)_75%,transparent)] ${block ? 'w-full rounded-[18px]' : 'self-start rounded-full whitespace-nowrap'}`}
      style={{ ...adText('cta', format, scale), padding: block ? '0.62em 1em' : '0.55em 1.25em' }}
    >
      {label}
    </p>
  )
}
