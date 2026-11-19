#!/usr/bin/env node
/**
 * Exports the copy bank (src/data/copy.ts) to public/kit/copy/one-agency_copy-bank.{md,json}.
 * Usage: node scripts/build-copy.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { COPY, COPY_GROUPS } from '../src/data/copy.ts'
import { VERSION_NOTE } from '../src/lib/kit.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/kit/copy')
const BASE = 'one-agency_copy-bank'

const md = [
  '# ONE Agency copy bank',
  '',
  `${VERSION_NOTE}. Every line is from the source pack; source and date follow each line.`,
  '',
  ...COPY_GROUPS.flatMap((g) => [
    `## ${g.label}`,
    '',
    ...COPY.filter((c) => c.group === g.id).flatMap((c) => [`- ${c.text}`, `  - Source: ${c.source}, ${c.date}${c.note ? `. ${c.note}` : ''}`]),
    '',
  ]),
].join('\n')

const json = {
  title: 'ONE Agency copy bank',
  version: VERSION_NOTE,
  groups: COPY_GROUPS.map((g) => ({ ...g, lines: COPY.filter((c) => c.group === g.id).map(({ group: _group, ...line }) => line) })),
}

mkdirSync(OUT, { recursive: true })
writeFileSync(resolve(OUT, `${BASE}.md`), md)
writeFileSync(resolve(OUT, `${BASE}.json`), `${JSON.stringify(json, null, 2)}\n`)
console.log(`copy: ${COPY.length} lines to public/kit/copy/${BASE}.{md,json}`)
