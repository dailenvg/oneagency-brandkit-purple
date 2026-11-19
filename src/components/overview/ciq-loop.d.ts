import type { HTMLAttributes, Ref } from 'react'

/** ConversionIQ's <ciq-loop> web component (public/vendor/ciq/ciq-loop.js), attributes as its README documents them. */
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
