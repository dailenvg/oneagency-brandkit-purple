import { IconContext } from '@phosphor-icons/react'
import { MotionConfig, MotionGlobalConfig } from 'motion/react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { CreativeAd } from './components/ads/creative/CreativeAd'
import { creativeConcept, creativeSize, type CreativeAdSize } from './data/ad-creative'
import './styles/fonts.css'
import './index.css'

/**
 * Render entry for scripts/export-creative-ads.mjs (render-ad.html): one creative ad at true size, in its final state.
 * Every animation jumps to its end, so the export is the still the hub settles on.
 */
MotionGlobalConfig.skipAnimations = true

declare global {
  interface Window {
    /** Renders one ad and resolves once fonts, images and fitted visuals have settled. */
    renderAd: (concept: string, format: string) => Promise<CreativeAdSize>
  }
}

const root = createRoot(document.getElementById('root')!)
const frame = () => new Promise((ok) => requestAnimationFrame(ok))

async function settle() {
  await frame()
  await frame()
  await document.fonts.ready
  await Promise.all([...document.images].map((img) => img.decode().catch(() => undefined)))
  for (let i = 0; i < 4; i++) await frame()
}

window.renderAd = async (id, format) => {
  const concept = creativeConcept(id)
  const size = creativeSize(format)
  if (!concept || !size) throw new Error(`Unknown creative ad: ${id} ${format}`)
  flushSync(() =>
    root.render(
      <MotionConfig reducedMotion="never">
        <IconContext.Provider value={{ weight: 'bold' }}>
          <CreativeAd key={`${id}-${format}`} concept={concept} size={size} />
        </IconContext.Provider>
      </MotionConfig>,
    ),
  )
  await settle()
  return size
}

const params = new URLSearchParams(location.search)
if (params.has('concept')) window.renderAd(params.get('concept')!, params.get('format') ?? 'square')
