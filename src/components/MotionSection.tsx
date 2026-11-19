import { motion } from 'motion/react'
import { MOVES, PRINCIPLES } from '../data/motion-moves'
import { assetFor } from '../lib/assets'
import { reveal } from '../lib/motion'
import { Section } from './layout/Section'
import { SubHeading } from './layout/SubHeading'
import { MoveCard } from './motion/MoveCard'
import { DownloadLink } from './ui/DownloadLink'
import { Reveal } from './ui/Reveal'
import { SourceNote } from './ui/SourceNote'

const RUNTIME = '/kit/motion/one-motion.js'
const RUNTIME_ESM = '/kit/motion/one-motion.mjs'

/** Motion: the film's principles, each move live with replay and its exact values, and the ad runtime. */
export function MotionSection() {
  return (
    <Section
      id="motion"
      eyebrow="Motion"
      title="Quick, confident, and it ends on a result"
      accent={[7]}
      lede="Every move comes from the film “ONE Agency: The Free Business Audit”. The same values drive this site, the React components and the HTML5 ad runtime."
      actions={
        <>
          <DownloadLink url={RUNTIME} label="one-motion.js" bytes={assetFor(RUNTIME)?.bytes} />
          <DownloadLink url={RUNTIME_ESM} label="one-motion.mjs" bytes={assetFor(RUNTIME_ESM)?.bytes} />
        </>
      }
    >
      <div className="flex flex-col gap-section">
        <Reveal as="ol" stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {PRINCIPLES.map((p, i) => (
            <motion.li key={p.title} variants={reveal} className="flex flex-col gap-2 rounded-site border border-edge bg-surface p-5">
              <span className="font-num text-step-small text-accent">0{i + 1}</span>
              <span className="font-semibold text-text">{p.title}</span>
              <span className="text-step-small text-text-2">{p.body}</span>
            </motion.li>
          ))}
        </Reveal>

        <div>
          <SubHeading title="The moves">
            Each one plays live; replay it to see it again. With reduced motion on, word rise and letter hop show their final frame straight away, and the other moves fade in.
          </SubHeading>
          <Reveal stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {MOVES.map((move) => (
              <MoveCard key={move.id} move={move} />
            ))}
          </Reveal>
        </div>

        <SourceNote title="For HTML5 ads">
          <code className="font-code">one-motion.js</code> runs the same moves without a framework, as pure functions of time: <code className="font-code">ad.seek(t)</code> renders
          any frame exactly, which is how the animated ads below are exported. Under prefers-reduced-motion the player shows the final frame.
        </SourceNote>
      </div>
    </Section>
  )
}
