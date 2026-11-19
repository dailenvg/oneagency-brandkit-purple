import { distance, duration, ease, overshoot, stagger } from '../lib/motion'

/** Each move from the film, with its values read from src/lib/motion.ts so the page never drifts from the code. */

export type MoveId = 'word-rise' | 'letter-hop' | 'pop' | 'logo-in' | 'out' | 'line-draw' | 'halo' | 'bar' | 'wipe' | 'hold'

export interface Move {
  id: MoveId
  name: string
  /** Function in one-motion.js (OneMotion.*) or component in src/kit/motion. */
  api: string
  values: [string, string][]
  use: string
}

const s = (n: number) => `${n} s`
const ms = (n: number) => `${Math.round(n * 1000)} ms`
const bezier = (b: readonly number[]) => `cubic-bezier(${b.join(', ')})`

export const MOVES: Move[] = [
  {
    id: 'word-rise',
    name: 'Word rise',
    api: 'OneMotion.rise · <WordRise>',
    values: [
      ['Duration', `${s(duration.move)} per word`],
      ['Ease', `ease-out cubic, ${bezier(ease.outCubic)}`],
      ['Travel', `${distance.riseY} px up, blur ${distance.riseBlur} px to 0`],
      ['Stagger', `${ms(stagger.word)} between words`],
    ],
    use: 'Headlines and sublines coming in. The default way text arrives.',
  },
  {
    id: 'letter-hop',
    name: 'Letter hop',
    api: 'OneMotion.hop · <LetterHop>',
    values: [
      ['Duration', `${s(duration.move)} per letter`],
      ['Ease', `back-out, overshoot ${overshoot.hop}`],
      ['Travel', `${distance.hopY.join(' / ')} px lift, ${distance.hopRotate.join(' / ')}° tilt, alternating`],
      ['Stagger', `${ms(stagger.letter)} between letters`],
    ],
    use: 'One short word that deserves a beat: a tag like "Winner". Never a whole sentence.',
  },
  {
    id: 'pop',
    name: 'Pop',
    api: 'OneMotion.pop · <Pop>',
    values: [
      ['Duration', s(duration.move)],
      ['Ease', `back-out, overshoot ${overshoot.pop}`],
      ['Scale', `${distance.popFrom} to 1; opacity lands in the first third`],
    ],
    use: 'CTAs, chips, icons and stats landing. The CTA pops last.',
  },
  {
    id: 'logo-in',
    name: 'Logo scale-in',
    api: 'OneMotion.logoIn · <Pop from blur>',
    values: [
      ['Duration', s(duration.logo)],
      ['Ease', `back-out, overshoot ${overshoot.logo}`],
      ['Scale', `${distance.logoFrom} to 1, blur ${distance.logoBlur} px to 0`],
    ],
    use: 'The logo at the open or close of a piece. Once.',
  },
  {
    id: 'out',
    name: 'Out',
    api: 'OneMotion.out · variants.out',
    values: [
      ['Duration', s(duration.out)],
      ['Ease', `ease-in quad, ${bezier(ease.inQuad)}`],
      ['Travel', `${Math.abs(distance.outY)} px up, fade to 0`],
    ],
    use: 'A line leaving before the next arrives. Exits go up, like everything else.',
  },
  {
    id: 'line-draw',
    name: 'Line draw',
    api: 'OneMotion.lineDraw · <LineDraw>',
    values: [
      ['Draw', `${s(duration.draw)}, ease-out cubic`],
      ['End dot', `${s(duration.dot)}, back-out ${overshoot.dot}`],
      ['Ring', `${s(duration.ring)}, scales to ${distance.ringScale}x, once`],
    ],
    use: 'Connects steps, left to right and upward, and always ends on a result.',
  },
  {
    id: 'halo',
    name: 'Halo',
    api: 'OneMotion.halo · <Halo>',
    values: [
      ['Fade', `${s(duration.haloFade)}, opacity ${distance.haloOpacity.join(' to ')}`],
      ['Swell', `${s(duration.haloScale)}, scale ${distance.haloScale.join(' to ')}`],
    ],
    use: 'Behind the logo or one hero number. Swells once and holds; never loops.',
  },
  {
    id: 'bar',
    name: 'Gradient bar',
    api: 'OneMotion.bar · <GradientBar>',
    values: [
      ['Duration', s(duration.bar)],
      ['Ease', 'ease-out cubic'],
      ['Origin', 'grows from the left'],
    ],
    use: 'Under the logo or a headline, as the single gradient accent in the frame.',
  },
  {
    id: 'wipe',
    name: 'Gradient wipe',
    api: 'OneMotion.wipe · <GradientWipe>',
    values: [
      ['Duration', s(duration.wipe)],
      ['Ease', `ease-in-out cubic, ${bezier(ease.inOutCubic)}`],
      ['Direction', 'left to right'],
    ],
    use: 'Bringing in the next line or the attribution, as a reveal.',
  },
  {
    id: 'hold',
    name: 'Final hold',
    api: 'OneMotion.player (plays once, holds)',
    values: [
      ['Hold', `${s(duration.hold)} dead still`],
      ['Loop', 'never'],
    ],
    use: 'Every piece ends on the result with the CTA, and stays there.',
  },
]

/** Creative Direction v2.1 motion principles, plus the film's hold rule. */
export const PRINCIPLES: { title: string; body: string }[] = [
  { title: 'Quick and confident', body: 'Not floaty. Each word, letter and CTA lands in half a second; exits take less.' },
  { title: 'Left to right and upward', body: "Movement follows the customer's path." },
  { title: 'Ends on a result', body: 'Every animation lands on a number, a CTA or the logo.' },
  { title: 'Play once, then hold', body: 'No loops. The last frame holds still.' },
  { title: 'Reduced-motion fallback', body: 'With reduced motion on, everything fades in or shows the final frame.' },
]
