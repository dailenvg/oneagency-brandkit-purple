import { LOGOS, type LogoLockup } from '../../data/logos'
import { useTheme } from '../../lib/theme'

interface BrandLogoProps {
  lockup: Exclude<LogoLockup, 'icon'>
  className?: string
  /** Empty when a parent link already names it. */
  alt?: string
  eager?: boolean
}

/** The hub's own logo: the on-dark master in dark mode, the on-light variant in light mode. */
export function BrandLogo({ lockup, className, alt = 'ONE Agency', eager }: BrandLogoProps) {
  const theme = useTheme()
  const variant = theme === 'light' ? 'on-light' : 'on-dark'
  const { svg } = LOGOS.find((l) => l.lockup === lockup && l.variant === variant)!
  return (
    <img
      src={svg.url}
      alt={alt}
      width={Math.round(svg.width)}
      height={Math.round(svg.height)}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      className={className}
    />
  )
}
