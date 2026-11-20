import { DashboardCard } from './DashboardCard'

/** The two faces, each doing its job: Unbounded for display, Geist for words. */
export function TypeSampleCard({ className }: { className?: string }) {
  return (
    <DashboardCard title="Type" view="type" linkLabel="Type rules" className={className}>
      <dl className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4 border-b border-edge pb-3">
          <dt className="order-last text-step-small text-text-3">Display, Unbounded</dt>
          <dd className="display text-step-3 leading-none">Aa</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-b border-edge pb-3">
          <dt className="order-last text-step-small text-text-3">Numbers, Unbounded</dt>
          <dd className="stat-num text-step-3 leading-none">10M+</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="order-last text-step-small text-text-3">Words, Geist</dt>
          <dd className="text-step-2 leading-none font-semibold">
            Aa Geist
          </dd>
        </div>
      </dl>
    </DashboardCard>
  )
}
