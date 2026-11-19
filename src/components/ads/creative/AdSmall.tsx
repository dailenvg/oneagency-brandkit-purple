import type { CreativeFormat } from '../../../data/ad-creative'
import { adText } from './ad-type'

/** Secondary or legal line under the CTA or the proof it qualifies. */
export function AdSmall({ text, format, className }: { text: string; format: CreativeFormat; className?: string }) {
  return (
    <p className={`text-balance ${className ?? ''}`} style={adText('legal', format)}>
      {text}
    </p>
  )
}
