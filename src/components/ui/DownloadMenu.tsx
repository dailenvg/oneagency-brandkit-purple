import { Check, DownloadSimple } from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { assetFor } from '../../lib/assets'
import { fileName, formatBytes, formatSize } from '../../lib/format'
import { fade, iconSwap, popover, press } from '../../lib/motion'
import { iconButtonClass } from './button-styles'

export interface DownloadFile {
  url: string
  /** Short format label, e.g. "SVG", "PNG 2x" or "JPG". */
  label: string
  /** Falls back to the asset manifest. */
  bytes?: number | null
  /**
   * Rows: files that share a group (e.g. the "9:16" crop) sit on one row with a button per format. Leave unset for
   * one row per file.
   */
  group?: string
}

interface DownloadMenuProps {
  /** What the files are, e.g. "Stacked, On dark". Names the button and heads the menu. */
  title: string
  files: DownloadFile[]
  className?: string
}

/** Space kept between the button and the menu, and between the menu and the window edge. */
const GAP = 8
const GUTTER = 16

type Placement = { left: number; top?: number; bottom?: number; maxHeight: number; up: boolean }

const ITEM_FOCUS = 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent'

const metaFor = (file: DownloadFile) => {
  const asset = assetFor(file.url)
  const bytes = file.bytes ?? asset?.bytes
  return { dims: formatSize(asset?.width ?? null, asset?.height ?? null), size: bytes ? formatBytes(bytes) : null }
}

/**
 * One download button per asset. Several files open a small menu beside the button, one row per format (or per crop
 * with a button per format); a single file downloads straight away. The menu is portalled so card clipping never
 * cuts it, flips above the button when there is no room below, and follows the WAI-ARIA menu button pattern.
 */
export function DownloadMenu({ title, files, className = '' }: DownloadMenuProps) {
  const [open, setOpen] = useState(false)
  const [place, setPlace] = useState<Placement | null>(null)
  const [done, setDone] = useState<ReadonlySet<string>>(new Set())
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const menuId = useId()

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) buttonRef.current?.focus()
  }

  // Position against the button, before paint; again on scroll and resize while open.
  useLayoutEffect(() => {
    if (!open) return
    const measure = () => {
      const button = buttonRef.current?.getBoundingClientRect()
      const menu = menuRef.current
      if (!button || !menu) return
      const below = window.innerHeight - button.bottom - GAP - GUTTER
      const above = button.top - GAP - GUTTER
      const up = menu.scrollHeight > below && above > below
      const left = Math.min(Math.max(button.right - menu.offsetWidth, GUTTER), window.innerWidth - menu.offsetWidth - GUTTER)
      setPlace(
        up
          ? { left, bottom: window.innerHeight - button.top + GAP, maxHeight: above, up }
          : { left, top: button.bottom + GAP, maxHeight: below, up },
      )
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [open])

  // Focus the first item on open; a press anywhere outside closes without stealing focus back.
  useEffect(() => {
    if (!open) return
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) close(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  if (files.length === 0) return null

  if (files.length === 1) {
    const [file] = files
    return (
      <motion.a href={file.url} download aria-label={`Download ${title}, ${file.label}`} title={`Download ${file.label}`} className={iconButtonClass('quiet', className)} {...press}>
        <DownloadSimple aria-hidden />
      </motion.a>
    )
  }

  const onButtonKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
    }
  }

  const onMenuKeyDown = (e: KeyboardEvent) => {
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLElement)
    const go = (n: number) => {
      e.preventDefault()
      items[(n + items.length) % items.length]?.focus()
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') go(i + 1)
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') go(i - 1)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(items.length - 1)
    else if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault()
      close()
    }
  }

  const markDone = (url: string) => setDone((prev) => new Set(prev).add(url))

  const doneIcon = (url: string, idle: string) =>
    done.has(url) ? (
      <motion.span key="done" variants={reduced ? fade : iconSwap} initial="hidden" animate="show" className="grid text-accent">
        <Check weight="bold" aria-hidden />
      </motion.span>
    ) : (
      <DownloadSimple className={idle} aria-hidden />
    )

  // Group order follows the files; ungrouped files are rows of their own.
  const groups = files.some((f) => f.group) ? [...new Set(files.map((f) => f.group ?? f.label))] : null

  const style: CSSProperties | undefined = place
    ? { left: place.left, top: place.top, bottom: place.bottom, maxHeight: place.maxHeight, transformOrigin: place.up ? 'bottom right' : 'top right' }
    : { left: -9999, top: 0 }

  return (
    <>
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={onButtonKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Download ${title}, ${files.length} files`}
        title="Download"
        className={iconButtonClass('quiet', `${open ? 'border-accent text-accent' : ''} ${className}`)}
        {...press}
      >
        <DownloadSimple aria-hidden />
      </motion.button>
      {createPortal(
        <AnimatePresence onExitComplete={() => setPlace(null)}>
          {open && (
            <motion.div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={`Download ${title}`}
              onKeyDown={onMenuKeyDown}
              variants={reduced ? fade : popover}
              initial="hidden"
              animate="show"
              exit="exit"
              style={style}
              className={`scroll-strip fixed z-90 flex ${groups ? 'w-80' : 'w-72'} max-w-[calc(100vw-2rem)] flex-col overflow-y-auto rounded-site-sm border border-edge bg-surface p-1.5 shadow-card`}
            >
              <p className="truncate px-3 pt-1.5 pb-1 text-step-small font-semibold text-text-3" aria-hidden>
                {title}
              </p>
              {groups
                ? groups.map((group) => {
                    const row = files.filter((f) => (f.group ?? f.label) === group)
                    const { dims } = metaFor(row[0])
                    return (
                      <div key={group} role="group" aria-label={group} className="flex items-center gap-2 rounded-site-sm py-1 pr-1 pl-3">
                        <span className="flex min-w-0 flex-1 flex-col leading-tight">
                          <span className="truncate font-semibold text-text">{group}</span>
                          {dims && <span className="font-num text-step-small text-text-3">{dims}</span>}
                        </span>
                        {row.map((file) => {
                          const { size } = metaFor(file)
                          return (
                            <a
                              key={file.url}
                              role="menuitem"
                              href={file.url}
                              download
                              onClick={() => markDone(file.url)}
                              title={size ? `${file.label}, ${size}` : file.label}
                              aria-label={`${group}, ${file.label}${size ? `, ${size}` : ''}, download ${fileName(file.url)}`}
                              className={`inline-flex h-touch shrink-0 items-center gap-1.5 rounded-full border border-edge px-3 text-step-small font-semibold text-text transition-colors hover:border-accent hover:text-accent active:bg-surface-2 [&_svg]:size-4 ${ITEM_FOCUS}`}
                            >
                              {doneIcon(file.url, 'text-text-3')}
                              {file.label}
                            </a>
                          )
                        })}
                      </div>
                    )
                  })
                : files.map((file) => {
                    const { dims, size } = metaFor(file)
                    const meta = [dims, size].filter(Boolean).join(' · ')
                    return (
                      <a
                        key={file.url}
                        role="menuitem"
                        href={file.url}
                        download
                        onClick={() => markDone(file.url)}
                        aria-label={`${file.label}${meta ? `, ${meta}` : ''}, download ${fileName(file.url)}`}
                        className={`group flex h-touch shrink-0 items-center gap-3 rounded-site-sm px-3 transition-colors hover:bg-surface-2 active:bg-surface-2 [&_svg]:size-5 ${ITEM_FOCUS}`}
                      >
                        <span className="font-semibold whitespace-nowrap text-text">{file.label}</span>
                        <span className="ml-auto truncate font-num text-step-small text-text-3">{meta}</span>
                        {doneIcon(file.url, 'shrink-0 text-text-2 transition-colors group-hover:text-accent')}
                      </a>
                    )
                  })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
