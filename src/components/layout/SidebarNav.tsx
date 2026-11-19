import { CaretDown } from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState, type MouseEvent } from 'react'
import { collapse, fade, spring } from '../../lib/motion'
import { NAV_GROUPS, subHref, subsectionsFor, viewFor, viewHref, type ViewId } from '../../lib/views'
import { useActiveSubsection } from './use-active-subsection'
import { scrollToSubsection } from './view-focus'
import { preloadView } from './view-loaders'

interface SidebarNavProps {
  current: ViewId | null
  /** Unique per instance (sidebar, drawer): the active pill and the subsection marker slide with these layoutIds. */
  layoutId: string
  onNavigate?: () => void
}

/**
 * Views grouped as in the brief (Identity, System, Content, Production), each group opened by a line, its name and a
 * line. A view with subsections has a dropdown: the view name stays a link, a separate caret button (disclosure,
 * aria-expanded) shows or hides its subsections. One dropdown is open at a time: the current view's opens on arrival,
 * and opening another closes it. The subsection being read is marked as you scroll.
 */
export function SidebarNav({ current, layoutId, onNavigate }: SidebarNavProps) {
  const prefix = useId()
  const reduced = useReducedMotion()
  const activeSub = useActiveSubsection(current)
  // Accordion: one dropdown open at a time, so opening one closes the rest.
  const [open, setOpen] = useState<ViewId | null>(current)
  // Derived state: arriving on a view opens its dropdown and closes any other (the reader can still close it).
  const [openedFor, setOpenedFor] = useState(current)
  if (current !== openedFor) {
    setOpenedFor(current)
    setOpen(current)
  }

  const toggle = (id: ViewId) => setOpen((prev) => (prev === id ? null : id))

  // The address does not change when the link already is the address, so scroll by hand.
  const onSubClick = (e: MouseEvent, view: ViewId, sub: string) => {
    if (window.location.hash === subHref(view, sub)) {
      e.preventDefault()
      scrollToSubsection(view, sub)
    }
    onNavigate?.()
  }

  return (
    <nav aria-label="Brand kit" className="flex flex-col gap-4">
      {NAV_GROUPS.map((group, g) => {
        const headingId = `${prefix}-group-${g}`
        return (
          <div key={group.label ?? 'start'}>
            {group.label && (
              // Separator: line, group name, line.
              <div className="mb-1 flex items-center gap-3 px-3 py-1">
                <span aria-hidden className="h-px flex-1 bg-edge" />
                <p id={headingId} className="text-step-micro font-semibold tracking-eyebrow text-text-3 uppercase">
                  {group.label}
                </p>
                <span aria-hidden className="h-px flex-1 bg-edge" />
              </div>
            )}
            <ul aria-labelledby={group.label ? headingId : undefined} className="flex flex-col gap-0.5">
              {group.views.map((id) => {
                const view = viewFor(id)
                const active = id === current
                const subs = subsectionsFor(id)
                const expanded = subs.length > 0 && open === id
                const listId = `${prefix}-${id}-sections`
                const IconComponent = view.icon
                return (
                  <li key={id}>
                    <div className="relative flex items-center">
                      {active && (
                        // The site blue (--lilac, #378DF0) in both themes, with near-black text: about 6.1:1 (white would be 3.4:1).
                        <motion.span layoutId={layoutId} transition={spring.layout} aria-hidden className="absolute inset-0 rounded-site-sm bg-lilac" />
                      )}
                      <a
                        href={viewHref(id)}
                        aria-current={active ? 'page' : undefined}
                        onClick={onNavigate}
                        onPointerEnter={() => preloadView(id)}
                        onFocus={() => preloadView(id)}
                        className={`relative flex min-h-touch flex-1 items-center gap-3 rounded-site-sm px-3 text-step--1 font-semibold transition-colors focus-visible:outline-offset-0 ${
                          active ? 'text-on-accent' : 'group text-text-2 hover:bg-nav-hover hover:text-text active:bg-surface-2'
                        }`}
                      >
                        <IconComponent className={`relative size-5 shrink-0 transition-colors ${active ? '' : 'group-hover:text-accent'}`} aria-hidden />
                        <span className="relative">{view.label}</span>
                      </a>
                      {subs.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggle(id)}
                          aria-expanded={expanded}
                          aria-controls={listId}
                          aria-label={`${view.label} sections`}
                          className={`relative grid size-touch shrink-0 place-items-center rounded-site-sm transition-colors focus-visible:outline-offset-0 ${
                            active ? 'text-on-accent hover:bg-on-accent/10 active:bg-on-accent/15' : 'text-text-3 hover:bg-nav-hover hover:text-text active:bg-surface-2'
                          }`}
                        >
                          <motion.span aria-hidden className="grid" animate={{ rotate: expanded ? 180 : 0 }} transition={spring.snappy}>
                            <CaretDown className="size-4" />
                          </motion.span>
                        </button>
                      )}
                    </div>
                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          key="sections"
                          id={listId}
                          variants={reduced ? fade : collapse}
                          initial="hidden"
                          animate="show"
                          exit="exit"
                          className="overflow-hidden"
                        >
                          {/* The rail lines up under the view icon; labels line up with the view names. */}
                          <ul aria-label={`${view.label} sections`} className="my-1 ml-5.5 flex flex-col border-l border-edge pl-2.5">
                            {subs.map((s) => {
                              const here = active && activeSub === s.id
                              return (
                                <li key={s.id} className="relative">
                                  {here && (
                                    <motion.span
                                      layoutId={`${layoutId}-sub`}
                                      transition={spring.layout}
                                      aria-hidden
                                      className="absolute top-2.5 bottom-2.5 -left-[11px] w-0.5 rounded-full bg-accent"
                                    />
                                  )}
                                  <a
                                    href={subHref(id, s.id)}
                                    aria-current={here ? 'location' : undefined}
                                    onClick={(e) => onSubClick(e, id, s.id)}
                                    onPointerEnter={() => preloadView(id)}
                                    onFocus={() => preloadView(id)}
                                    className={`flex min-h-touch items-center rounded-site-sm px-3 text-step-small transition-colors focus-visible:outline-offset-0 ${
                                      here ? 'font-semibold text-text' : 'text-text-2 hover:bg-nav-hover hover:text-text active:bg-surface-2'
                                    }`}
                                  >
                                    {s.label}
                                  </a>
                                </li>
                              )
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
