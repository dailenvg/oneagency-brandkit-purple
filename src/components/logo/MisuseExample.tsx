import type { CSSProperties } from 'react'
import type { MisuseId } from '../../data/logo-rules'

const ON_NAVY = '/kit/logos/horizontal/one-agency_logo_horizontal-on-navy.svg'
const MARK_WHITE = '/kit/logos/mark/one-agency_logo_mark-white.svg'

/** Off-palette effects, on purpose: these are the mistakes. Built from tokens so they still render consistently. */
const EFFECTS: CSSProperties = { filter: 'drop-shadow(6px 8px 0 var(--violet)) drop-shadow(0 0 18px var(--sky))' }
const RECOLOUR: CSSProperties = {
  maskImage: `url(${MARK_WHITE})`,
  WebkitMaskImage: `url(${MARK_WHITE})`,
  maskSize: 'contain',
  WebkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  WebkitMaskPosition: 'center',
}

const logo = (className: string, style?: CSSProperties) => <img src={ON_NAVY} alt="" width={2957} height={330} loading="lazy" className={`h-auto ${className}`} style={style} />

/** The logo used wrongly, rendered for real. Decorative: the caption carries the meaning. */
export function MisuseExample({ id }: { id: MisuseId }) {
  switch (id) {
    case 'stretch':
      return <div className="grid h-full place-items-center bg-navy">{logo('w-3/5 scale-x-125 scale-y-[2]')}</div>
    case 'recolour':
      return (
        <div className="grid h-full place-items-center bg-navy">
          <div className="aspect-[492/330] w-1/4 bg-orange-500" style={RECOLOUR} />
        </div>
      )
    case 'effects':
      return <div className="grid h-full place-items-center bg-navy">{logo('w-3/5', EFFECTS)}</div>
    case 'busy':
      return <div className="busy-field grid h-full place-items-center">{logo('w-4/5')}</div>
    case 'rotate':
      return <div className="grid h-full place-items-center bg-navy">{logo('w-4/5 -rotate-12')}</div>
    case 'wrong-ground':
      return <div className="grid h-full place-items-center bg-paper">{logo('w-4/5')}</div>
    case 'crop':
      return <div className="relative h-full overflow-hidden bg-navy">{logo('absolute top-1/2 -left-1/3 w-[180%] max-w-none -translate-y-1/2')}</div>
  }
}
