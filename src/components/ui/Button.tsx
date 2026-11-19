import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { press } from '../../lib/motion'
import { buttonClass, type ButtonSize, type ButtonVariant } from './button-styles'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  className?: string
  'aria-label'?: string
  'aria-pressed'?: boolean
  'aria-expanded'?: boolean
  'aria-controls'?: string
  'aria-describedby'?: string
}

/** Pill button with the brand press feedback. */
export function Button({ children, onClick, variant, size, disabled, className, ...aria }: ButtonProps) {
  return (
    <motion.button type="button" onClick={onClick} disabled={disabled} className={buttonClass(variant, size, className)} {...(disabled ? {} : press)} {...aria}>
      {children}
    </motion.button>
  )
}
