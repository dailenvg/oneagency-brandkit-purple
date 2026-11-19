import type { Transition, Variants } from 'motion/react'

/**
 * ONE Agency motion tokens, taken from the film "ONE Agency: The Free Business Audit" (modules/shared.js and the scene
 * files). Quick and confident, left-to-right and upward, plays once and holds on the result.
 *
 * Framework-free on purpose (type-only import above): src/kit/motion/vanilla.ts imports these for the HTML5 ad runtime.
 */

/* ---------------------------------------------------------------- easing functions (exact film curves) */

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/** Film `eo`: ease-out cubic. Word rise, line draw, bar grow. */
export const easeOutCubic = (p: number) => 1 - (1 - p) ** 3

/** Film `eio`: ease-in-out cubic. The gradient wipe sweep. */
export const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2)

/** Film `out`: quadratic ease-in for exits. */
export const easeInQuad = (p: number) => p * p

/**
 * Film `eob(p, s)`: back-out with overshoot `s` (1.6 letter hop and logo, 1.7 pop, 1.8 to 1.9 dots and checks).
 * Returns a plain easing function so it can be passed to motion/react as `ease`.
 */
export const backOut =
  (overshoot = 1.7) =>
  (p: number) => {
    const x = p - 1
    return 1 + (overshoot + 1) * x ** 3 + overshoot * x ** 2
  }

/* ---------------------------------------------------------------- tokens */

/** Seconds. Micro 150 to 250 ms, component 250 to 400 ms, page 300 to 600 ms; film moves noted. */
export const duration = {
  micro: 0.2,
  component: 0.32,
  page: 0.5,
  /** Word rise, letter hop and pop: each element's own move. */
  move: 0.5,
  /** Exit: rise up and fade. */
  out: 0.35,
  /** Word exit inside a line that leaves word by word. */
  wordOut: 0.3,
  /** Gradient bar grow under the logo. */
  bar: 0.6,
  /** Gradient wipe sweep into the next line. */
  wipe: 0.65,
  /** Line draw across the chart, before the dot lands. */
  draw: 1.1,
  /** Logo scale-in with blur. */
  logo: 1.1,
  /** End-dot pop and ring pulse. */
  dot: 0.35,
  ring: 0.65,
  /** Halo swell: opacity settles first, scale keeps growing. */
  haloFade: 1.7,
  haloScale: 3.5,
  /** Final still: the last beat of an ad holds dead still this long. */
  hold: 4,
  /** Particle stream drift: one cycle when it first comes into view, then it holds (brand rule: play once, then hold). */
  drift: 4.8,
  /** A staggered set: the last child has landed by this point, however many children there are. */
  cascade: 0.8,
} as const

/** Cubic-bezier fallbacks for CSS and for tweens where a function ease is not accepted. */
export const ease = {
  outCubic: [0.33, 1, 0.68, 1],
  inOutCubic: [0.65, 0, 0.35, 1],
  inQuad: [0.11, 0, 0.5, 0],
  backOut: [0.34, 1.56, 0.64, 1],
  /** The live site's --v2-ease. */
  site: [0.2, 0.7, 0.2, 1],
} as const

/** Back-out overshoot amounts used across the film. */
export const overshoot = { hop: 1.6, logo: 1.6, pop: 1.7, dot: 1.8, check: 1.9 } as const

/** Seconds between siblings. */
export const stagger = {
  word: 0.07,
  /** Looser word step for short accent lines. */
  wordLoose: 0.1,
  letter: 0.035,
  wordOut: 0.03,
  /** The live site's --v2-stagger (cards, list items). */
  children: 0.1,
} as const

/**
 * Seconds between `count` staggered children (each moving for duration.component), so the last one lands within
 * duration.cascade: the site's --v2-stagger for short sets, tighter for long ones.
 */
export const cappedStagger = (count: number) => (count > 1 ? Math.min(stagger.children, (duration.cascade - duration.component) / (count - 1)) : stagger.children)

/** Pixels, degrees and scales the moves travel. */
export const distance = {
  riseY: 34,
  riseBlur: 8,
  wordOutY: 40,
  outY: -30,
  hopY: [50, 80],
  hopRotate: [-5, 7],
  popFrom: 0.6,
  logoFrom: 0.8,
  logoBlur: 10,
  ringScale: 3.2,
  haloScale: [0.85, 1.05],
  haloOpacity: [0.55, 0.9],
} as const

/** Spring presets for UI elements (buttons, toggles, layout). */
export const spring = {
  snappy: { type: 'spring', stiffness: 300, damping: 28 },
  soft: { type: 'spring', stiffness: 200, damping: 26 },
  layout: { type: 'spring', stiffness: 260, damping: 30 },
} satisfies Record<string, Transition>

/** Scroll reveal: play once, when a tenth of the element is in view. */
export const viewport = { once: true, margin: '-10%' } as const

export const press = { whileHover: { scale: 1.03 }, whileTap: { scale: 0.97 } }

/** Cards and tiles: a gentler lift than buttons. */
export const pressCard = { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } }

/* ---------------------------------------------------------------- variants */

const fadeIn: Transition = { duration: duration.component, ease: ease.outCubic }

/** Parent of staggered children. */
export const sequence = (step: number = stagger.word, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
})

/** Word rise: per word, blur and rise in. */
export const wordRise: Variants = {
  hidden: { opacity: 0, y: distance.riseY, filter: `blur(${distance.riseBlur}px)` },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: duration.move, ease: easeOutCubic },
    // Once the word has landed it drops the filter (blur(0px) looks the same but isolates the word), so an accent
    // word's neon light and Add blend reach the ground behind the title.
    transitionEnd: { filter: 'none' },
  },
}

/** Letter hop: alternating lift and tilt, back-out landing. `custom` is the letter index. */
export const letterHop: Variants = {
  hidden: (i: number) => ({
    opacity: 0,
    y: distance.hopY[i % 2],
    rotate: distance.hopRotate[i % 2],
  }),
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: duration.move,
      ease: backOut(overshoot.hop),
      opacity: { duration: duration.move / 4, ease: 'linear' },
    },
  },
}

/** Pop: scale in from 60% with overshoot; opacity lands in the first third. */
export const pop: Variants = {
  hidden: { opacity: 0, scale: distance.popFrom },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.move, ease: backOut(overshoot.pop), opacity: { duration: duration.move / 3, ease: 'linear' } },
  },
}

/** Exit: rise up 30px and fade, accelerating. Use as `exit` under AnimatePresence. */
export const out: Variants = {
  exit: { opacity: 0, y: distance.outY, transition: { duration: duration.out, ease: easeInQuad } },
}

/** Reduced motion: every move collapses to this plain fade. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: fadeIn },
  exit: { opacity: 0, transition: { duration: duration.micro, ease: ease.outCubic } },
}

/** View transition for the hub (AnimatePresence mode="wait" around the routed view): the site's own curve. */
export const page: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: duration.page, ease: ease.site } },
  exit: { opacity: 0, y: -8, transition: { duration: duration.out, ease: ease.inQuad } },
}

/** Scroll reveal for section content: a short rise and fade, upward like the brand moves. */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: duration.component, ease: ease.outCubic } },
}

/** Tab and filter panels swapping under AnimatePresence (mode="wait" or "popLayout"). */
export const swap: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: duration.component, ease: ease.outCubic } },
  exit: { opacity: 0, y: -8, transition: { duration: duration.micro, ease: easeInQuad } },
}

/** Toasts: rise in with a spring, drop out quickly. */
export const toast: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: spring.snappy },
  exit: { opacity: 0, y: 8, scale: 0.98, transition: { duration: duration.micro, ease: easeInQuad } },
}

/** Overlay backdrop (lightbox). */
export const backdrop: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.component, ease: ease.outCubic } },
  exit: { opacity: 0, transition: { duration: duration.micro, ease: easeInQuad } },
}

/** Overlay panel (lightbox content): scales up from 96% with the UI spring. */
export const panel: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: spring.soft },
  exit: { opacity: 0, scale: 0.98, y: 8, transition: { duration: duration.micro, ease: easeInQuad } },
}

/** Dropdown menu (downloads): grows from its button on the snappy spring, leaves on a quick tween. */
export const popover: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  show: { opacity: 1, scale: 1, y: 0, transition: spring.snappy },
  exit: { opacity: 0, scale: 0.97, y: -4, transition: { duration: duration.micro, ease: easeInQuad } },
}

/** Navigation drawer (phones and tablets): slides in from the left on the layout spring, leaves on a quick tween. */
export const drawer: Variants = {
  hidden: { x: '-100%' },
  show: { x: 0, transition: spring.layout },
  exit: { x: '-100%', transition: { duration: duration.component, ease: ease.inOutCubic } },
}

/** Icon swap (theme switch): the outgoing icon turns away, the new one turns in on the snappy spring. */
export const iconSwap: Variants = {
  hidden: { opacity: 0, rotate: -90, scale: 0.6 },
  show: { opacity: 1, rotate: 0, scale: 1, transition: spring.snappy },
  exit: { opacity: 0, rotate: 90, scale: 0.6, transition: { duration: duration.micro, ease: easeInQuad } },
}

/** Accordion body: height on the soft spring, opacity on a short tween. */
export const collapse: Variants = {
  hidden: { height: 0, opacity: 0 },
  show: { height: 'auto', opacity: 1, transition: { height: spring.soft, opacity: { duration: duration.component, ease: ease.outCubic } } },
  exit: { height: 0, opacity: 0, transition: { duration: duration.micro, ease: easeInQuad } },
}

/** Highlight band wipe, left to right behind the words (the gradient wipe's curve and length). */
export const highlightWipe = { duration: duration.wipe, ease: ease.inOutCubic } as const

/**
 * Brand intro cues (seconds from start): the film's brand scene, compressed for the web. The logo scales in, the
 * gradient bar grows under it, then the line rises in.
 */
export const brandIntro = { logo: 0, bar: 0.6, line: 0.75 } as const
