import { createContext, useContext } from 'react'

export interface ToastApi {
  /** Shows a short confirmation, announced politely to screen readers. */
  notify(message: string, tone?: 'ok' | 'error'): void
}

export const ToastContext = createContext<ToastApi>({ notify: () => {} })

export const useToast = () => useContext(ToastContext)

/** Copies text and reports the result through the toast. Resolves true when the text reached the clipboard. */
export function useCopy() {
  const { notify } = useToast()
  return async (value: string, label = value): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(value)
      notify(`Copied ${label}`)
      return true
    } catch {
      notify('Copy failed. Select the text and copy it by hand.', 'error')
      return false
    }
  }
}
