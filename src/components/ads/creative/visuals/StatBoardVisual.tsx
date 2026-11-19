import { GlassCard } from '../../../../kit/glass/GlassCard'
import { adText } from '../ad-type'
import { Backlight } from './Backlight'
import type { VisualProps } from './visual-props'

/** Space above the numerals and below the legal line: 20 ad px, 40 exported px. */
const BOARD_PAD = 20

/**
 * Results: the home page stat bar as a glass board, two by two, gradient dividers between the columns, with the line
 * that qualifies the figures under it. Unlike the other visuals it is not fitted (scaling would fight the text floors):
 * it is set at the ad's own text sizes, full width, at its natural height, centred in its slot (on the slot's bottom
 * margin in a square), on a soft under-glow that stays inside the slot.
 */
export function StatBoardVisual({ concept, format, className }: VisualProps) {
  const wide = format === 'landscape'
  return (
    // A square has the least height: the board sits on its slot's bottom margin, 24 px above the CTA.
    <div className={`relative flex min-h-0 ${format === 'square' ? 'items-end' : 'items-center'} ${className ?? ''}`}>
      <Backlight glow={{ width: 300, bottom: 50, left: '50%' }} />
      <GlassCard className={`relative grid w-full grid-cols-2 px-4 ${wide ? 'gap-y-3' : 'gap-y-4'}`} style={{ paddingBlock: BOARD_PAD }}>
        {concept.stats.map((s, i) => (
          <div key={s.value} className={`relative flex flex-col items-center gap-1 px-2 text-center ${i % 2 ? 'stat-divided' : ''}`}>
            <span className="stat-num" style={{ ...adText('stat', format, wide ? 0.86 : 0.8), lineHeight: 1.05 }}>
              {s.value}
            </span>
            <span style={adText('statLabel', format)}>{s.label}</span>
          </div>
        ))}
        {concept.small && (
          <p className="col-span-2 mt-1 px-2 text-center text-balance" style={adText('legal', format)}>
            {concept.small}
          </p>
        )}
      </GlassCard>
    </div>
  )
}
