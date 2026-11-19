const LAUREL = '/kit/elements/one-agency_element_laurel.svg'

/**
 * The live site's award banner as a reusable badge. The award belongs to ConversionIQ.ai, and the badge always says so.
 */
export function AwardBadge() {
  return (
    <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-site bg-void px-6 py-8 text-center md:flex-row md:gap-0 md:px-0 md:text-left">
      <span aria-hidden className="absolute inset-x-0 top-0 h-px opacity-70" style={{ background: 'var(--bar)' }} />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px opacity-70" style={{ background: 'var(--bar)' }} />
      <div className="relative grid size-28 shrink-0 place-items-center md:mx-8">
        <img src={LAUREL} alt="" width={240} height={240} className="absolute inset-0 size-full opacity-90" loading="lazy" />
        <span className="relative font-num text-step-1 font-bold tracking-wide">2026</span>
      </div>
      <div className="flex flex-col items-center gap-3 border-edge md:items-start md:border-l md:px-8">
        <span className="border border-text/70 px-2.5 py-1 text-step-small leading-none font-bold tracking-tag uppercase">Winner</span>
        <p className="text-step-3 leading-none font-bold tracking-tight">Best AI Product</p>
        <p className="text-step-small font-semibold tracking-caps text-form-copy uppercase">2026 ARDY Awards · American Resort Development Association</p>
      </div>
      <p className="flex flex-col gap-1.5 border-edge md:border-l md:px-8">
        <span className="text-step-small font-bold tracking-label text-form-copy uppercase">Awarded to</span>
        <span className="text-step-1 font-bold">ConversionIQ.ai</span>
      </p>
    </div>
  )
}
