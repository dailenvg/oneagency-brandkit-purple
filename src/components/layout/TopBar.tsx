import { List } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { KIT } from '../../lib/kit'
import { press } from '../../lib/motion'
import { viewHref } from '../../lib/views'
import { iconButtonClass } from '../ui/button-styles'
import { BrandLogo } from './BrandLogo'
import { ThemeToggle } from './ThemeToggle'

interface TopBarProps {
  menuOpen: boolean
  onMenu: () => void
  /** Name of the current view, shown next to the logo so phones always say where you are. */
  current: string
}

/** Phones and tablets: menu button (opens the drawer), logo, current view and the theme switch. */
export function TopBar({ menuOpen, onMenu, current }: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-edge-soft bg-ground/85 backdrop-blur-md lg:hidden">
      <div className="flex h-nav items-center gap-2 px-3 sm:px-5">
        <motion.button
          type="button"
          onClick={onMenu}
          aria-expanded={menuOpen}
          aria-controls="nav-drawer"
          aria-label="Menu"
          className={iconButtonClass('ghost')}
          {...press}
        >
          <List aria-hidden />
        </motion.button>
        <a href={viewHref('overview')} aria-label="ONE Agency brand kit, overview" className="flex min-h-touch min-w-0 items-center gap-3 rounded-site-sm">
          <BrandLogo lockup="horizontal" alt="" eager className="h-5 w-auto shrink-0" />
          <span className="hidden rounded-full border border-edge px-2 py-0.5 font-num text-step-small text-text-3 sm:inline">v{KIT.version}</span>
        </a>
        <span aria-hidden className="ml-1 hidden min-w-0 truncate border-l border-edge pl-3 text-step-small font-semibold text-text-2 min-[400px]:block">
          {current}
        </span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
