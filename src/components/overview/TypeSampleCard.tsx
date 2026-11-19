import { DashboardCard } from './DashboardCard'

/** The three faces, each doing its one job. */
export function TypeSampleCard({ className }: { className?: string }) {
  return (
    <DashboardCard title="Type" view="type" linkLabel="Type rules" className={className}>
      <dl className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4 border-b border-edge pb-3">
          <dt className="order-last text-step-small text-text-3">Words</dt>
          <dd className="text-step-3 leading-none font-bold tracking-tight">Aa Geist</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-b border-edge pb-3">
          <dt className="order-last text-step-small text-text-3">Numbers, Lato</dt>
          <dd className="stat-num text-step-3 leading-none">10M+</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="order-last text-step-small text-text-3">Accent words, Metal</dt>
          <dd className="text-step-2 leading-none font-bold tracking-tight">
            One <span className="accent-word">accent</span>
          </dd>
        </div>
      </dl>
    </DashboardCard>
  )
}
