import { AD_TEXT_STYLES, type AdTextStyle } from '../../data/ad-styles'

const FACE_CLASS = { Geist: 'font-sans', Lato: 'font-num', Metal: 'font-accent' } as const

/** Sample in the style, at banner size so the row stays compact. */
function Sample({ s }: { s: AdTextStyle }) {
  const filled = s.colour === '--accent-fill'
  const cta = s.id === 'cta'
  const text = { eyebrow: 'Free AI Growth Audit', headline: 'Best AI Product', accent: 'holes', subhead: 'Yours to keep.', body: 'Results in 5 minutes.', stat: '10M+', statLabel: 'Qualified leads generated', cta: 'Run My Free Audit', legal: 'Figures as published on oneagency.com, November 2026.' }[s.id]
  return (
    <span
      className={`${FACE_CLASS[s.face]} ${filled ? (s.id === 'stat' ? 'stat-num' : 'accent-word') : ''} ${cta ? 'inline-block rounded-full bg-rose px-3 py-1.5' : ''} ${s.uppercase ? 'uppercase' : ''}`}
      style={{
        fontWeight: s.weight,
        fontSize: s.banner * 1.5,
        lineHeight: s.lineHeight,
        letterSpacing: `${s.tracking}em`,
        color: filled ? undefined : `var(${s.colour})`,
      }}
    >
      {text}
    </span>
  )
}

/** Ad text styles with px for 1080-wide social and for 300x250 banners. */
export function AdTextStyles() {
  return (
    <div className="scroll-strip overflow-x-auto rounded-site border border-edge" tabIndex={0} role="region" aria-label="Ad text styles, scrolls sideways">
      <table className="w-full border-collapse text-left text-step-small">
        <caption className="sr-only">Ad text styles: face, weight, size at 1080 social and at 300x250, line height, tracking and colour.</caption>
        <thead className="bg-surface text-text-2">
          <tr>
            {['Style', 'Sample (300x250 size, shown at 1.5x)', 'Face', '1080 social', '300x250', 'Line', 'Tracking', 'Colour'].map((h) => (
              <th key={h} scope="col" className="p-3 font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {AD_TEXT_STYLES.map((s) => (
            <tr key={s.id} className="border-t border-edge align-middle">
              <th scope="row" className="p-3 align-top">
                <span className="block font-semibold text-text">{s.label}</span>
                <span className="mt-1 block min-w-48 font-normal text-text-3">{s.note}</span>
              </th>
              <td data-theme="dark" className="min-w-56 bg-ground p-3">
                <Sample s={s} />
              </td>
              <td className="p-3 whitespace-nowrap text-text-2">
                {s.face} {s.weight}
              </td>
              <td className="p-3 font-num text-step-0 whitespace-nowrap text-text">{s.social} px</td>
              <td className="p-3 font-num text-step-0 whitespace-nowrap text-text">{s.banner} px</td>
              <td className="p-3 font-num whitespace-nowrap text-text-2">{s.lineHeight}</td>
              <td className="p-3 font-num whitespace-nowrap text-text-2">{s.tracking} em</td>
              <td className="p-3 font-code whitespace-nowrap text-text-2">{s.colour}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
