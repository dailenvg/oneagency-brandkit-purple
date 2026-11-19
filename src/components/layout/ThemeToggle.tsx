import { Moon, Sun } from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { iconSwap, press, spring } from '../../lib/motion'
import { setTheme, useTheme } from '../../lib/theme'

/**
 * Dark mode switch: a 44px track (the same height as every button, see button-styles.ts) showing both ends (sun left,
 * moon right), with a rose thumb that covers the active one and carries it. role="switch" with a fixed name
 * ("Dark mode") and aria-checked for the state; the title says what a press does. Reduced motion: the thumb jumps and
 * the icon swaps with no turn, scale or fade.
 */
export function ThemeToggle() {
  const dark = useTheme() === 'dark'
  const next = dark ? 'light' : 'dark'
  const reduced = useReducedMotion()
  const icon = dark ? <Moon className="size-4.5" /> : <Sun className="size-4.5" />
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
      // Track outline on --edge-strong: the switch's shape keeps 3:1 against the ground in both themes (WCAG 1.4.11).
      className={`group relative flex h-touch w-20 shrink-0 items-center rounded-full border border-edge-strong bg-surface-2 p-[3px] transition-colors hover:border-text-2 focus-visible:outline-accent ${dark ? 'justify-end' : 'justify-start'}`}
      {...(reduced ? {} : press)}
    >
      {/* Both ends stay visible, centred under where the thumb sits (3px inset + 18px half thumb). */}
      <Sun aria-hidden className="absolute top-1/2 left-[13px] size-4 -translate-y-1/2 text-text-3 transition-colors group-hover:text-text-2" />
      <Moon aria-hidden className="absolute top-1/2 right-[13px] size-4 -translate-y-1/2 text-text-3 transition-colors group-hover:text-text-2" />
      {/* The ring in --ui-accent separates the rose thumb from the pale light-theme track (rose alone is under 3:1 there). */}
      <motion.span aria-hidden layout={!reduced} transition={spring.snappy} className="relative grid size-9 place-items-center rounded-full bg-rose text-on-accent ring-1 ring-accent">
        {reduced ? (
          icon
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={dark ? 'moon' : 'sun'} variants={iconSwap} initial="hidden" animate="show" exit="exit" className="grid place-items-center">
              {icon}
            </motion.span>
          </AnimatePresence>
        )}
      </motion.span>
    </motion.button>
  )
}
