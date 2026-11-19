import type { CreativeFormat } from '../../../data/ad-creative'
import { adText } from './ad-type'

/** The site eyebrow in an ad: rose, tracked caps. */
export function AdEyebrow({ text, format }: { text: string; format: CreativeFormat }) {
  return <p style={adText('eyebrow', format)}>{text}</p>
}
