/** Film grain over a composition (fills its positioned parent). Overlay on dark, multiply on light. Decorative. */
export function Grain({ className }: { className?: string }) {
  return <div aria-hidden className={`grain absolute inset-0 ${className ?? ''}`} />
}
