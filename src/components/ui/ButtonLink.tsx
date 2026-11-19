import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { press } from '../../lib/motion'
import { buttonClass, type ButtonSize, type ButtonVariant } from './button-styles'

interface ButtonLinkProps {
  href: string
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  /** Set for files: the browser saves instead of navigating. `true` keeps the file's own name. */
  download?: boolean | string
  external?: boolean
  /** Renders a non-interactive, dimmed pill (e.g. a ZIP not built yet). */
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

/** A pill-shaped link styled as a button (downloads, anchors, outbound links). */
export function ButtonLink({ href, children, variant, size, download, external, disabled, className, ...rest }: ButtonLinkProps) {
  const cls = buttonClass(variant, size, className)
  if (disabled) {
    return (
      <span role="link" aria-disabled="true" className={cls} aria-label={rest['aria-label']}>
        {children}
      </span>
    )
  }
  return (
    <motion.a
      href={href}
      className={cls}
      download={download === true ? '' : download || undefined}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={rest['aria-label']}
      {...press}
    >
      {children}
      {external && !rest['aria-label'] && <span className="sr-only"> (opens in a new tab)</span>}
    </motion.a>
  )
}
