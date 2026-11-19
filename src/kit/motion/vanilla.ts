/**
 * ONE Agency motion, framework-free. The same moves as the React components in this folder, written as pure functions
 * of time so HTML5 ads render frame-exact: call a move with the current time `t` and its start time `t0` (seconds) and
 * it writes that frame's styles. Seeking to any `t` always gives the same frame, which is what video and GIF export
 * need. Ported from the film's `UI.rise / UI.hop / UI.pop / UI.out / UI.draw`.
 *
 * Built to public/kit/motion/one-motion.js (global `OneMotion`) and one-motion.mjs by scripts/build-motion.mjs.
 */
import {
  backOut,
  clamp01,
  distance,
  duration,
  easeInOutCubic,
  easeInQuad,
  easeOutCubic,
  overshoot,
  stagger,
} from '../../lib/motion'

export { backOut, clamp01, distance, duration, easeInOutCubic, easeInQuad, easeOutCubic, overshoot, stagger }

/** Progress of `t` through the window [a, b], clamped to 0..1 (film `seg`). */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k

const fixed = (n: number, digits = 3) => n.toFixed(digits)
const translateY = (y: number) => (Math.abs(y) < 0.01 ? 'none' : `translateY(${fixed(y, 2)}px)`)

type Styled = HTMLElement | SVGElement

const wordCache = new WeakMap<Element, HTMLElement[]>()
const letterCache = new WeakMap<Element, HTMLElement[]>()

/** Splits an element's text into inline-block word spans once. Words at `accent` indices get `accentClass`. */
export function splitWords(el: HTMLElement, accent: number[] = [], accentClass = 'acc'): HTMLElement[] {
  const cached = wordCache.get(el)
  if (cached) return cached
  const words = (el.textContent ?? '').trim().split(/\s+/)
  el.setAttribute('aria-label', words.join(' '))
  el.textContent = ''
  const spans = words.map((word, i) => {
    const span = document.createElement('span')
    span.textContent = word
    span.style.display = 'inline-block'
    span.setAttribute('aria-hidden', 'true')
    if (accent.includes(i)) span.className = accentClass
    el.append(span)
    if (i < words.length - 1) el.append(' ')
    return span
  })
  wordCache.set(el, spans)
  return spans
}

/** Splits an element's text into inline-block letter spans once, keeping each word unbreakable. */
export function splitLetters(el: HTMLElement): HTMLElement[] {
  const cached = letterCache.get(el)
  if (cached) return cached
  const words = (el.textContent ?? '').trim().split(/\s+/)
  el.setAttribute('aria-label', words.join(' '))
  el.textContent = ''
  const letters: HTMLElement[] = []
  words.forEach((word, wi) => {
    const wrap = document.createElement('span')
    wrap.style.display = 'inline-block'
    wrap.style.whiteSpace = 'nowrap'
    wrap.setAttribute('aria-hidden', 'true')
    for (const ch of word) {
      const span = document.createElement('span')
      span.textContent = ch
      span.style.display = 'inline-block'
      wrap.append(span)
      letters.push(span)
    }
    el.append(wrap)
    if (wi < words.length - 1) el.append(' ')
  })
  letterCache.set(el, letters)
  return letters
}

export interface RiseOptions {
  /** Start of the word-by-word exit, if the line leaves. */
  out?: number
  /** Word indices set as accent words (Metal, gradient fill). */
  accent?: number[]
  /** Seconds between words. */
  stagger?: number
}

/** Word rise: each word blurs and rises 34px in over 0.5s, ease-out cubic, 70ms apart. */
export function rise(el: HTMLElement, t: number, t0: number, options: RiseOptions = {}) {
  const step = options.stagger ?? stagger.word
  splitWords(el, options.accent).forEach((span, i) => {
    const e = easeOutCubic(seg(t, t0 + i * step, t0 + i * step + duration.move))
    let opacity = e
    let y = distance.riseY * (1 - e)
    if (options.out != null) {
      const q = seg(t, options.out + i * stagger.wordOut, options.out + i * stagger.wordOut + duration.wordOut)
      opacity *= 1 - q
      y -= distance.wordOutY * q * q
    }
    span.style.opacity = fixed(opacity)
    span.style.transform = translateY(y)
    span.style.filter = e > 0.995 ? 'none' : `blur(${fixed(distance.riseBlur * (1 - e), 1)}px)`
  })
}

/** Letter hop: letters land with a back-out overshoot from alternating 50/80px lifts and -5/7 degree tilts. */
export function hop(el: HTMLElement, t: number, t0: number, step: number = stagger.letter) {
  const ease = backOut(overshoot.hop)
  splitLetters(el).forEach((span, i) => {
    const p = seg(t, t0 + i * step, t0 + i * step + duration.move)
    const e = ease(p)
    const y = (1 - e) * distance.hopY[i % 2]
    const r = (1 - e) * distance.hopRotate[i % 2]
    span.style.opacity = fixed(clamp01(p * 4))
    span.style.transform = Math.abs(y) < 0.01 ? 'none' : `translateY(${fixed(y, 2)}px) rotate(${fixed(r, 2)}deg)`
  })
}

export interface PopOptions {
  duration?: number
  /** Starting scale. 0.6 for chips and icons, 0.8 for the logo. */
  from?: number
  /** Starting blur in px (the logo scale-in uses 10). */
  blur?: number
  overshoot?: number
}

/** Pop: scale in with a back-out overshoot; opacity lands in the first third. */
export function pop(el: Styled, t: number, t0: number, options: PopOptions = {}) {
  const d = options.duration ?? duration.move
  const from = options.from ?? distance.popFrom
  const p = seg(t, t0, t0 + d)
  const e = backOut(options.overshoot ?? overshoot.pop)(p)
  el.style.opacity = fixed(clamp01(p * 3))
  el.style.transform = p >= 1 ? 'none' : `scale(${fixed(lerp(from, 1, e), 4)})`
  if (options.blur) el.style.filter = p >= 1 ? 'none' : `blur(${fixed(options.blur * (1 - easeOutCubic(p)), 1)}px)`
}

/** Logo scale-in: from 80% and 10px blur, settling with a gentle overshoot over 1.1s. */
export function logoIn(el: Styled, t: number, t0: number) {
  pop(el, t, t0, { duration: duration.logo, from: distance.logoFrom, blur: distance.logoBlur, overshoot: overshoot.logo })
}

/** Exit: rises 30px and fades over 0.35s, accelerating. Call after the element's entrance move for the same frame. */
export function out(el: Styled, t: number, t0: number) {
  const p = seg(t, t0, t0 + duration.out)
  if (p <= 0) return
  const e = easeInQuad(p)
  const current = el.style.transform === 'none' ? '' : el.style.transform
  el.style.opacity = fixed((1 - e) * parseFloat(el.style.opacity || '1'))
  el.style.transform = `${current} translateY(${fixed(distance.outY * e, 2)}px)`.trim()
}

/** Line draw: strokes a path from start to end between a and b. The path needs pathLength="1". */
export function draw(path: SVGGeometryElement, t: number, a: number, b: number) {
  const p = seg(t, a, b)
  path.style.strokeDasharray = '1'
  path.style.strokeDashoffset = fixed(1 - easeOutCubic(p), 4)
  path.style.opacity = p > 0 ? '1' : '0'
}

export interface LineParts {
  path: SVGGeometryElement
  /** The result dot at the end of the line; set transform-box: fill-box and transform-origin: center. */
  dot: SVGElement
  /** A ring the same size as the dot that pulses out once it lands. */
  ring: SVGElement
}

/** The full line move: draw over 1.1s, the end dot pops as the line arrives, then the ring pulses out once. */
export function lineDraw(parts: LineParts, t: number, t0: number) {
  draw(parts.path, t, t0, t0 + duration.draw)
  const dotStart = t0 + duration.draw - 0.15
  const d = seg(t, dotStart, dotStart + duration.dot)
  parts.dot.style.opacity = d > 0 ? '1' : '0'
  parts.dot.style.transform = `scale(${fixed(backOut(overshoot.dot)(d), 4)})`
  const r = seg(t, dotStart + 0.2, dotStart + 0.2 + duration.ring)
  parts.ring.style.opacity = fixed(r > 0 ? 1 - r : 0)
  parts.ring.style.transform = `scale(${fixed(1 + (distance.ringScale - 1) * easeOutCubic(r))})`
}

/** Halo: the soft glow behind the logo swells once (opacity 0.55 to 0.9, scale 0.85 to 1.05) and holds. */
export function halo(el: Styled, t: number, t0: number) {
  const [o0, o1] = distance.haloOpacity
  const [s0, s1] = distance.haloScale
  el.style.opacity = fixed(lerp(o0, o1, easeOutCubic(seg(t, t0, t0 + duration.haloFade))) * clamp01((t - t0) * 4))
  el.style.transform = `scale(${fixed(lerp(s0, s1, easeOutCubic(seg(t, t0, t0 + duration.haloScale))), 4)})`
}

/** Gradient bar: the --bar rule grows from the left. Set transform-origin: left center. */
export function bar(el: Styled, t: number, t0: number) {
  el.style.transform = `scaleX(${fixed(easeOutCubic(seg(t, t0, t0 + duration.bar)), 4)})`
}

export interface WipeParts {
  /** The vertical gradient bar that sweeps across. */
  sweep: HTMLElement
  /** What is on screen now; clipped away behind the bar. Optional. */
  from?: HTMLElement
  /** What the wipe reveals. */
  to: HTMLElement
  /** Width of the area being wiped, in px. */
  width: number
}

/** Gradient wipe: a bar sweeps left to right (ease-in-out, 0.65s), revealing `to` and clipping `from` behind it. */
export function wipe(parts: WipeParts, t: number, t0: number) {
  const x = easeInOutCubic(seg(t, t0, t0 + duration.wipe))
  const X = lerp(-20, parts.width + 20, x)
  parts.sweep.style.transform = `translateX(${fixed(X, 1)}px)`
  parts.sweep.style.opacity = x > 0 && x < 1 ? '1' : '0'
  if (parts.from) parts.from.style.clipPath = x <= 0 ? 'none' : `inset(0 0 0 ${fixed(X, 1)}px)`
  parts.to.style.clipPath = x >= 1 ? 'none' : `inset(0 ${fixed(Math.max(0, parts.width - X), 1)}px 0 0)`
}

export interface Player {
  play(): void
  pause(): void
  /** Render one exact frame. Use for export: seek(frame / fps). */
  seek(t: number): void
  readonly time: number
}

export interface PlayerOptions {
  /** Total length in seconds, including the final hold. */
  duration: number
  /** Start on creation. Default true. */
  autoplay?: boolean
}

/**
 * Drives a `render(t)` function in real time. Plays once and holds the last frame, per the brand's motion rule.
 * Under prefers-reduced-motion it renders the final frame straight away: the end state, no movement.
 */
export function player(render: (t: number) => void, options: PlayerOptions): Player {
  let time = 0
  let start = 0
  let frame = 0
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

  const seek = (t: number) => {
    time = Math.min(Math.max(0, t), options.duration)
    render(time)
  }
  const tick = (now: number) => {
    seek((now - start) / 1000)
    frame = time < options.duration ? requestAnimationFrame(tick) : 0
  }
  const play = () => {
    if (reduced) return seek(options.duration)
    cancelAnimationFrame(frame)
    start = performance.now() - time * 1000
    frame = requestAnimationFrame(tick)
  }
  const pause = () => {
    cancelAnimationFrame(frame)
    frame = 0
  }

  seek(0)
  if (options.autoplay !== false) play()
  return {
    play,
    pause,
    seek: (t) => {
      pause()
      seek(t)
    },
    get time() {
      return time
    },
  }
}
