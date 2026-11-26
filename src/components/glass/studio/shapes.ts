import {
  CalendarCheck,
  ChartLineUp,
  ChatCircleDots,
  Globe,
  MagnifyingGlass,
  Megaphone,
  Phone,
  ShieldCheck,
  Target,
  Trophy,
  Users,
  type Icon,
} from '@phosphor-icons/react'
import { createElement } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import type { ShapeCanvas } from '../../../kit/glass3d/field'
import { ONE_MARK_PATH } from '../../../kit/glass3d/presets'

/**
 * Shapes the studio can turn into glass. The ONE mark comes from the logo masters; the icons are the kit's Phosphor ad
 * set (Elements → Icons) in the fill weight, because thin strokes don't survive extrusion into thick glass.
 */
export interface StudioShape {
  id: string
  label: string
  /** Small preview in the chip. */
  icon: Icon | 'mark'
  draw: (c: ShapeCanvas) => Promise<string | null> | string | null
}

/** The icon's SVG markup, rendered with the React DOM the app already loads (react-dom/server would add ~180 kB). */
function iconMarkup(IconComponent: Icon) {
  const host = document.createElement('div')
  const root = createRoot(host)
  flushSync(() => root.render(createElement(IconComponent, { weight: 'fill', size: 256, color: '#000' })))
  const markup = host.innerHTML
  root.unmount()
  return markup
}

const phosphor = (id: string, label: string, IconComponent: Icon): StudioShape => ({
  id,
  label,
  icon: IconComponent,
  draw: (c) => c.drawMarkup(iconMarkup(IconComponent)),
})

export const SHAPES: StudioShape[] = [
  {
    id: 'one-mark',
    label: 'ONE mark',
    icon: 'mark',
    draw: (c) => (c.drawPath(ONE_MARK_PATH, { evenOdd: true }) ? null : 'The ONE mark couldn’t be drawn.'),
  },
  phosphor('trophy', 'Trophy', Trophy),
  phosphor('target', 'Target', Target),
  phosphor('chart-line-up', 'Chart', ChartLineUp),
  phosphor('magnifying-glass', 'Search', MagnifyingGlass),
  phosphor('chat-circle-dots', 'Chat', ChatCircleDots),
  phosphor('phone', 'Phone', Phone),
  phosphor('megaphone', 'Megaphone', Megaphone),
  phosphor('globe', 'Globe', Globe),
  phosphor('shield-check', 'Shield', ShieldCheck),
  phosphor('calendar-check', 'Calendar', CalendarCheck),
  phosphor('users', 'Users', Users),
]

export const DISPLAY_FAMILY = '"Unbounded", "Geist", ui-sans-serif, system-ui, sans-serif'
