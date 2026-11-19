import { ArrowClockwise } from '@phosphor-icons/react'
import type { ButtonVariant } from './button-styles'
import { Button } from './Button'

/** Reloads the page: the recovery action for anything that failed to load. */
export function ReloadButton({ variant = 'secondary' }: { variant?: ButtonVariant }) {
  return (
    <Button variant={variant} onClick={() => window.location.reload()}>
      <ArrowClockwise className="size-5" aria-hidden />
      Reload
    </Button>
  )
}
