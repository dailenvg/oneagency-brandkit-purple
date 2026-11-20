import { CLEAR_SPACE_O, O_HEIGHT } from '../../data/logo-rules'
import { LOGOS } from '../../data/logos'

const HORIZONTAL = LOGOS.find((l) => l.lockup === 'horizontal' && l.variant === 'on-navy')!

/** Clear-space diagram in master units: the O height is the unit; the zone is half an O on every side. */
export function ClearSpace() {
  const o = O_HEIGHT
  const pad = o * CLEAR_SPACE_O
  const { width: w, height: h } = HORIZONTAL.svg
  const vw = w + pad * 2
  const vh = h + pad * 2
  const corners: [number, number][] = [
    [0, 0],
    [vw - pad, 0],
    [0, vh - pad],
    [vw - pad, vh - pad],
  ]

  return (
    <figure className="flex flex-col gap-4">
      <div data-theme="dark" className="rounded-site border border-edge bg-ground p-6 sm:p-10">
        <svg viewBox={`${-pad * 0.9} ${-pad * 0.2} ${vw + pad * 1.1} ${vh + pad * 0.6}`} className="h-auto w-full" role="img" aria-label="Clear space: half the height of the O on every side of the logo.">
          <rect x={0} y={0} width={vw} height={vh} fill="none" strokeDasharray="20 16" strokeWidth={4} style={{ stroke: 'var(--violet-light)' }} />
          {corners.map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <rect x={x} y={y} width={pad} height={pad} style={{ fill: 'color-mix(in srgb, var(--violet-light) 22%, transparent)' }} />
              <text x={x + pad / 2} y={y + pad / 2} textAnchor="middle" dominantBaseline="central" fontSize={84} fontWeight={600} style={{ fill: 'var(--violet-light)', fontFamily: 'var(--font-sans)' }}>
                ½ O
              </text>
            </g>
          ))}
          <rect x={pad} y={pad} width={w} height={h} fill="none" strokeWidth={3} style={{ stroke: 'var(--edge-strong)' }} />
          <image href={HORIZONTAL.svg.url} x={pad} y={pad} width={w} height={h} />
          <g style={{ stroke: 'var(--mint)' }} strokeWidth={6}>
            <line x1={-pad * 0.4} x2={-pad * 0.4} y1={pad} y2={pad + o} />
            <line x1={-pad * 0.6} x2={-pad * 0.2} y1={pad} y2={pad} />
            <line x1={-pad * 0.6} x2={-pad * 0.2} y1={pad + o} y2={pad + o} />
          </g>
          <text x={-pad * 0.4} y={pad + o + 80} textAnchor="middle" fontSize={64} fontWeight={700} style={{ fill: 'var(--mint)', fontFamily: 'var(--font-sans)' }}>
            O
          </text>
        </svg>
      </div>
      <figcaption className="text-step--1 text-text-2">
        <strong className="text-text">The unit is the height of the O</strong> (the full height of ONE). Keep half an O clear on every side, in every lockup. Nothing else
        enters the dashed zone: no type, edges or other logos.
      </figcaption>
    </figure>
  )
}
