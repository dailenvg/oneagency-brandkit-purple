import type { CreativeFormat, CreativeStat } from '../../../data/ad-creative'
import { GlassCard } from '../../../kit/glass/GlassCard'
import { adText } from './ad-type'

interface AdStatsProps {
  stats: CreativeStat[]
  /** Client and date for all the stats. */
  source: string | null
  format: CreativeFormat
  align?: 'start' | 'center'
  /** Multiplier on the stat sizes. */
  scale?: number
  /** The rose-to-blue hairline above the row. */
  rule?: boolean
  /** Set the row on a glass card (over the Möbius loop, so small text never sits on the loop itself). */
  glass?: boolean
}

/**
 * Stat row: each column is at least as wide as its numeral (the gradient is clipped to the box, so an overflowing glyph
 * would vanish). Lato gradient numerals, labels in white, the site's gradient divider between them, source lines in grey.
 */
export function AdStats({ stats, source, format, align = 'start', scale = 1, rule = false, glass = false }: AdStatsProps) {
  const centre = align === 'center'
  const body = (
    <>
      {rule && !glass && <span aria-hidden className="h-px w-full" style={{ background: 'var(--v2-hairline)' }} />}
      <div className={`flex w-full ${centre ? 'justify-center' : ''}`}>
        {stats.map((s, i) => (
          <div key={s.value} className={`relative flex min-w-min flex-1 flex-col gap-1 ${i ? 'stat-divided pl-[6%]' : ''} ${i < stats.length - 1 ? 'pr-[6%]' : ''}`}>
            <span className="stat-num whitespace-nowrap" style={{ ...adText('stat', format, scale), lineHeight: 1.05 }}>
              {s.value}
            </span>
            <span style={adText('statLabel', format, scale)}>{s.label}</span>
            {s.source && <span style={adText('legal', format)}>{s.source}</span>}
          </div>
        ))}
      </div>
      {source && (
        <p className="text-balance" style={adText('legal', format)}>
          {source}
        </p>
      )}
    </>
  )
  const layout = `flex w-full flex-col gap-3 ${centre ? 'items-center text-center' : ''}`
  return glass ? (
    <GlassCard shape="tile" className={`${layout} px-[6%] py-[0.8em]`}>
      {body}
    </GlassCard>
  ) : (
    <div className={layout}>{body}</div>
  )
}
