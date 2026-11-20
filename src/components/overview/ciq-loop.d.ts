import type { HTMLAttributes, Ref } from 'react'

/**
 * ConversionIQ's <ciq-loop> web component, attributes as its README documents them. The hub loads the ONE Agency recolour
 * (public/vendor/ciq/ciq-loop.one-agency.js, Mint for pink, no glow); the original is public/vendor/ciq/ciq-loop.js.
 */
interface CiqLoopAttributes extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>
  look?: 'mesh' | 'strings' | 'energy' | 'flight'
  shape?: 'mobius' | 'trefoil' | 'ring' | 'teardrop'
  theme?: 'dark' | 'light'
  background?: 'none'
  place?: 'center' | 'right'
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ciq-loop': CiqLoopAttributes
    }
  }
}
