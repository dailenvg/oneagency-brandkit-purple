import type { CSSProperties } from 'react'
import type { MisuseId } from '../../data/logo-rules'

const STACKED_DARK = '/kit/logos/stacked/one-agency_logo_stacked-on-dark.svg'
const ICON_WHITE = '/kit/logos/icon/one-agency_logo_icon-white.svg'

/** Off-palette effects, on purpose: these are the mistakes. Built from tokens so they still render consistently. */
const EFFECTS: CSSProperties = { filter: 'drop-shadow(6px 8px 0 var(--rose)) drop-shadow(0 0 18px var(--lilac))' }
const RECOLOUR: CSSProperties = {
  maskImage: `url(${ICON_WHITE})`,
  WebkitMaskImage: `url(${ICON_WHITE})`,
  maskSize: 'contain',
  WebkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  WebkitMaskPosition: 'center',
}

const logo = (className: string, style?: CSSProperties) => <img src={STACKED_DARK} alt="" width={906} height={349} loading="lazy" className={`h-auto ${className}`} style={style} />

/** The logo used wrongly, rendered for real. Decorative: the caption carries the meaning. */
export function MisuseExample({ id }: { id: MisuseId }) {
  switch (id) {
    case 'stretch':
      return <div className="grid h-full place-items-center bg-ground">{logo('w-1/2 scale-x-150 scale-y-75')}</div>
    case 'recolour':
      return (
        <div className="grid h-full place-items-center bg-ground">
          <div className="aspect-[906/230] w-3/5 bg-lime-400" style={RECOLOUR} />
        </div>
      )
    case 'effects':
      return <div className="grid h-full place-items-center bg-ground">{logo('w-3/5', EFFECTS)}</div>
    case 'busy':
      return <div className="busy-field grid h-full place-items-center">{logo('w-3/5')}</div>
    case 'rotate':
      return <div className="grid h-full place-items-center bg-ground">{logo('w-3/5 -rotate-12')}</div>
    case 'wrong-ground':
      return <div className="grid h-full place-items-center bg-paper">{logo('w-3/5')}</div>
    case 'crop':
      return <div className="relative h-full overflow-hidden bg-ground">{logo('absolute top-1/2 -left-1/4 w-[140%] max-w-none -translate-y-1/2')}</div>
  }
}
