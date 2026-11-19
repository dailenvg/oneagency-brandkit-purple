#!/usr/bin/env node
/**
 * Bundles the framework-free motion runtime (src/kit/motion/vanilla.ts) for HTML5 ads and other non-React pages:
 *   public/kit/motion/one-motion.js    IIFE, exposes window.OneMotion (drop into an ad with a <script> tag)
 *   public/kit/motion/one-motion.mjs   ES module
 * Same source as the kit site's motion tokens, so ads and site move identically.
 *
 * Usage: node scripts/build-motion.mjs
 */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

await build({
  root: ROOT,
  configFile: false,
  publicDir: false,
  logLevel: 'warn',
  build: {
    outDir: resolve(ROOT, 'public/kit/motion'),
    emptyOutDir: false,
    minify: false,
    lib: {
      entry: resolve(ROOT, 'src/kit/motion/vanilla.ts'),
      name: 'OneMotion',
      formats: ['iife', 'es'],
      fileName: (format) => (format === 'es' ? 'one-motion.mjs' : 'one-motion.js'),
    },
  },
})

console.log('motion: public/kit/motion/one-motion.js (window.OneMotion), public/kit/motion/one-motion.mjs')
