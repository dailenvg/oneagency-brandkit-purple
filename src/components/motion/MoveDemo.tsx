import type { MoveId } from '../../data/motion-moves'
import { GradientBar } from '../../kit/motion/GradientBar'
import { GradientWipe } from '../../kit/motion/GradientWipe'
import { Halo } from '../../kit/motion/Halo'
import { LetterHop } from '../../kit/motion/LetterHop'
import { LineDraw } from '../../kit/motion/LineDraw'
import { Pop } from '../../kit/motion/Pop'
import { WordRise } from '../../kit/motion/WordRise'
import { distance, duration, overshoot } from '../../lib/motion'
import { OutDemo } from './OutDemo'

const LOGO = '/kit/logos/stacked/one-agency_logo_stacked-on-dark.svg'
const PILL = 'inline-flex items-center rounded-full bg-rose px-6 py-3 font-semibold text-on-accent'
const LINE = [
  [20, 150],
  [130, 128],
  [240, 100],
  [350, 70],
  [460, 30],
] as const

/** Live demo of one move, built from the kit components with the film's copy. Decorative: the card text explains it. */
export function MoveDemo({ id }: { id: MoveId }) {
  switch (id) {
    case 'word-rise':
      return <WordRise text="Find and close the holes in your business" accent={[4]} className="text-center text-step-2 font-bold tracking-tight text-balance" />
    case 'letter-hop':
      return <LetterHop text="Winner" className="text-step-3 font-bold tracking-tight" />
    case 'pop':
      return (
        <Pop>
          <span className={PILL}>Run My Free Audit</span>
        </Pop>
      )
    case 'logo-in':
      return (
        <Pop from={distance.logoFrom} blur={distance.logoBlur} length={duration.logo} bounce={overshoot.logo}>
          <img src={LOGO} alt="" width={906} height={349} className="h-auto w-48" />
        </Pop>
      )
    case 'out':
      return <OutDemo />
    case 'line-draw':
      return <LineDraw points={LINE} width={480} height={170} className="h-auto w-full max-w-sm" />
    case 'halo':
      return (
        <>
          <Halo className="absolute top-1/2 left-1/2 aspect-square h-[140%] -translate-1/2" />
          <img src={LOGO} alt="" width={906} height={349} className="relative h-auto w-40" />
        </>
      )
    case 'bar':
      return <GradientBar className="h-2 w-3/4" />
    case 'wipe':
      return (
        <GradientWipe>
          <p className="text-step-1 font-bold">Awarded to ConversionIQ.ai</p>
        </GradientWipe>
      )
    case 'hold':
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-step-1 font-bold">Results in 5 minutes. Yours to keep.</p>
          <span className={PILL}>Start My 5-Minute Audit</span>
        </div>
      )
  }
}
