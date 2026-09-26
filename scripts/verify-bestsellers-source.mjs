import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

import {
  OUTPUT_FILE,
  SOURCE_FILE,
  SOURCE_HASH,
  transformTemplate,
} from './personalize-bestsellers-source.mjs'

const source = await readFile(SOURCE_FILE)
const actualSourceHash = createHash('sha256').update(source).digest('hex')

if (actualSourceHash !== SOURCE_HASH) {
  throw new Error(`ThreeUI source hash mismatch: expected ${SOURCE_HASH}, received ${actualSourceHash}`)
}

const expectedOutput = transformTemplate(source.toString('utf8'))
const actualOutput = await readFile(OUTPUT_FILE, 'utf8')

if (actualOutput !== expectedOutput) {
  throw new Error('Personalized Bestsellers page does not match the deterministic résumé transformation')
}

const outputHash = createHash('sha256').update(actualOutput).digest('hex')
console.log(`Verified ThreeUI template: ${actualSourceHash}`)
console.log(`Verified personalized résumé page: ${outputHash}`)
