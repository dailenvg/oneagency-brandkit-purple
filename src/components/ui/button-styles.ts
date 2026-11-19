/**
 * The hub's control system. Every pill button, chip, text link pill and icon button is exactly one height,
 * --spacing-touch (44px), so controls line up wherever they sit side by side (sidebar footer, view headers, card
 * footers). Sizes only change horizontal padding; the type size (step -1, semibold) and the icon size (18px in pills,
 * 20px in icon buttons) are the same everywhere. Labels never wrap, so the height never grows.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'on-light' | 'quiet' | 'ghost' | 'link'
export type ButtonSize = 'md' | 'sm'
export type IconButtonVariant = 'quiet' | 'ghost'

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-3'

const BASE = `inline-flex h-touch items-center justify-center gap-2 rounded-full border text-center text-step--1 font-semibold leading-none whitespace-nowrap transition-colors duration-200 select-none [&_svg]:size-4.5 [&_svg]:shrink-0 ${FOCUS} aria-disabled:pointer-events-none aria-disabled:opacity-45 disabled:pointer-events-none disabled:opacity-45`

/**
 * The live site's .btn-primary / .btn-ghost colour states, plus the pressed step (--rose-deep, "pressed or hover step
 * of rose") and a proposed on-light pill (ink on paper). Quiet is the soft chip for single files; ghost and link have
 * no outline (menus, toggles, "Open" links) and only show their pill on hover.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'border-rose bg-rose text-on-accent hover:bg-transparent hover:text-lavender-text active:border-rose-deep active:bg-rose-deep active:text-on-accent focus-visible:outline-text',
  secondary:
    'border-text bg-transparent text-text hover:bg-text hover:text-on-text active:border-text-2 active:bg-text-2 active:text-on-text focus-visible:outline-text',
  'on-light':
    'border-ink bg-ink text-paper hover:bg-transparent hover:text-ink active:border-ink-2 active:bg-ink-2 active:text-paper focus-visible:outline-ink',
  quiet: 'border-edge bg-surface text-text hover:border-accent hover:text-accent active:bg-surface-2 focus-visible:outline-accent',
  ghost: 'border-transparent bg-transparent text-text hover:bg-surface-2 active:bg-surface-2 focus-visible:outline-accent',
  link: 'border-transparent bg-transparent text-accent hover:bg-surface-2 hover:text-text active:bg-surface-2 focus-visible:outline-accent',
}

const SIZES: Record<ButtonSize, string> = {
  md: 'px-6 sm:px-7',
  sm: 'px-4',
}

export const buttonClass = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = '') =>
  `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`

const ICON_BASE = `grid size-touch shrink-0 place-items-center rounded-full border transition-colors duration-200 [&_svg]:size-5 ${FOCUS} focus-visible:outline-accent`

const ICON_VARIANTS: Record<IconButtonVariant, string> = {
  quiet: 'border-edge bg-surface text-text hover:border-accent hover:text-accent active:bg-surface-2',
  ghost: 'border-transparent text-text-2 hover:bg-surface-2 hover:text-text active:bg-surface-2',
}

/** Round, icon-only button: the same 44px as every pill. */
export const iconButtonClass = (variant: IconButtonVariant = 'quiet', extra = '') => `${ICON_BASE} ${ICON_VARIANTS[variant]} ${extra}`
