const W = 800
const H = 300

/** Diagonal hairlines rising to the right: deterministic, so every render matches. */
const STREAKS = Array.from({ length: 14 }, (_, i) => {
  const x = 440 + i * 26
  return { x1: x - 110, y1: H + 20, x2: x + 150, y2: -20, width: 0.5 + (i % 3) * 0.4, opacity: 0.12 + ((i * 7) % 5) * 0.06, tone: i % 3 === 0 ? 'b' : 'a' }
})

/** Hairline streaks for the violet ground (highlight reference). Crisp lines only, no blur or glow. Decorative. */
export function LightStreaks({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMid slice" className={`pointer-events-none absolute inset-0 size-full ${className ?? ''}`}>
      {STREAKS.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} strokeWidth={s.width} opacity={s.opacity} stroke={s.tone === 'a' ? 'var(--glass-streak-a)' : 'var(--glass-streak-b)'} />
      ))}
    </svg>
  )
}
