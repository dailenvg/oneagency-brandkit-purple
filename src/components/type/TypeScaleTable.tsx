import { TYPE_SCALE } from '../../data/type'
import { clampPx } from '../../lib/format'

const VIEWPORTS = [375, 1440] as const

/** The site's fluid scale with its px value at a phone and a desktop width, each row set in its own step. */
export function TypeScaleTable() {
  return (
    <div className="scroll-strip overflow-x-auto rounded-site border border-edge" tabIndex={0} role="region" aria-label="Type scale, scrolls sideways">
      <table className="w-full border-collapse text-left text-step-small">
        <caption className="sr-only">Type scale tokens with px values at 375 and 1440 px wide.</caption>
        <thead className="bg-surface text-text-2">
          <tr>
            <th scope="col" className="p-3 font-semibold">Token</th>
            <th scope="col" className="p-3 font-semibold">Sample</th>
            {VIEWPORTS.map((v) => (
              <th key={v} scope="col" className="p-3 font-semibold whitespace-nowrap">
                @{v}
              </th>
            ))}
            <th scope="col" className="p-3 font-semibold">Use</th>
          </tr>
        </thead>
        <tbody>
          {TYPE_SCALE.map((step) => (
            <tr key={step.token} className="border-t border-edge align-middle">
              <th scope="row" className="p-3 font-code font-medium whitespace-nowrap text-text-2">
                {step.token}
              </th>
              <td className={`p-3 font-semibold whitespace-nowrap text-text ${step.className} ${step.token === '--step-num' ? 'stat-num' : ''}`}>
                {step.token === '--step-num' ? '450K+' : 'Ag'}
              </td>
              {VIEWPORTS.map((v) => (
                <td key={v} className="p-3 font-num whitespace-nowrap text-text">
                  {Math.round(clampPx(step.value, v) * 10) / 10} px
                </td>
              ))}
              <td className="min-w-40 p-3 text-text-3">{step.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
