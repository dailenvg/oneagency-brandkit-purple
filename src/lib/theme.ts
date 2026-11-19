import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'

/** Also read by the inline script in index.html, which sets the theme before first paint. Keep the two in step. */
export const THEME_STORAGE_KEY = 'oa-kit-theme'

const root = () => document.documentElement
const system = () => matchMedia('(prefers-color-scheme: light)')
const listeners = new Set<() => void>()

function stored(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export const getTheme = (): Theme => (root().dataset.theme === 'light' ? 'light' : 'dark')

/** Puts the theme on <html>, the browser chrome colour and the controls; listeners re-render. */
function apply(theme: Theme) {
  root().dataset.theme = theme
  root().style.colorScheme = theme
  const ground = getComputedStyle(root()).getPropertyValue('--ui-ground').trim()
  if (ground) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', ground)
  listeners.forEach((listener) => listener())
}

/** A choice made in the hub: applied and remembered (when storage is available). */
export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Private mode or blocked storage: the choice holds for this visit only.
  }
  apply(theme)
}

/** Until someone picks a theme, the hub follows the system setting live. */
function onSystemChange(e: MediaQueryListEvent) {
  if (!stored()) apply(e.matches ? 'light' : 'dark')
}

function subscribe(listener: () => void) {
  if (!listeners.size) system().addEventListener('change', onSystemChange)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (!listeners.size) system().removeEventListener('change', onSystemChange)
  }
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme)
}
