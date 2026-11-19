import { stagger as staggerDelay, useAnimate, useInView, useReducedMotion, type AnimationSequence } from 'motion/react'
import { useEffect, useLayoutEffect, type ReactNode } from 'react'
import { ANIM_ROLES, type AnimRole } from '../../kit/graphics/anim'
import { backOut, distance, duration, ease, easeOutCubic, overshoot, stagger, viewport } from '../../lib/motion'

/** What each role targets: strokes draw along their path; everything else fades or pops as a whole. */
const SELECTOR: Record<AnimRole, string> = {
  structure: '[data-anim="structure"]',
  draw: 'path[data-anim="draw"], [data-anim="draw"] path',
  area: '[data-anim="area"]',
  node: '[data-anim="node"]',
  focal: '[data-anim="focal"]',
}

const HIDDEN: Record<AnimRole, Record<string, number>> = {
  structure: { opacity: 0 },
  draw: { pathLength: 0, opacity: 0 },
  area: { opacity: 0 },
  node: { opacity: 0, scale: distance.popFrom },
  focal: { opacity: 0, scale: distance.popFrom },
}

/**
 * The entrance, in the brand's order: the grid settles, the line draws left to right, the area fills, the stages land
 * one after another, and the result pops last.
 */
const SHOWN: Record<AnimRole, [Record<string, number>, Record<string, unknown>]> = {
  structure: [{ opacity: 1 }, { duration: duration.component, ease: ease.outCubic }],
  draw: [{ pathLength: 1, opacity: 1 }, { duration: duration.draw, ease: easeOutCubic, at: '-0.1' }],
  area: [{ opacity: 1 }, { duration: duration.component, ease: ease.outCubic, at: '-0.4' }],
  node: [{ opacity: 1, scale: 1 }, { duration: duration.move, ease: backOut(overshoot.dot), delay: staggerDelay(stagger.children), at: '-0.3' }],
  focal: [{ opacity: 1, scale: 1 }, { duration: duration.move, ease: backOut(overshoot.pop) }],
}

/**
 * Plays a kit graphic's entrance the first time it scrolls into view, by the roles its parts carry
 * (src/kit/graphics/anim.ts). Only transform, opacity and pathLength move. The downloads stay static: this layer is
 * the hub's alone. Remount to replay. Reduced motion: the graphic is simply there, inside its card's fade.
 */
export function GraphicMotion({ children, className }: { children: ReactNode; className?: string }) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const inView = useInView(scope, viewport)
  const reduced = useReducedMotion()

  // Before the first paint, so nothing flashes in its final state. Once per mount: a replay remounts.
  useLayoutEffect(() => {
    if (reduced) return
    for (const role of ANIM_ROLES) if (scope.current.querySelector(SELECTOR[role])) animate(SELECTOR[role], HIDDEN[role], { duration: 0 })
  }, [animate, reduced, scope])

  useEffect(() => {
    if (reduced || !inView) return
    const roles = ANIM_ROLES.filter((role) => scope.current.querySelector(SELECTOR[role]))
    animate(roles.map((role) => [SELECTOR[role], ...SHOWN[role]]) as AnimationSequence)
  }, [animate, inView, reduced, scope])

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  )
}
