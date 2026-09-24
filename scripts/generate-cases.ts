import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateAll } from '../src/generator/index.ts'
import type { CaseFile, CaseIndexEntry } from '../src/generator/types.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'src', 'data')
mkdirSync(outDir, { recursive: true })

const { cases, index } = generateAll(150)

const byVolume: Record<number, CaseFile[]> = { 1: [], 2: [], 3: [] }
for (const c of cases) byVolume[c.volume].push(c)

for (const vol of [1, 2, 3]) {
  writeFileSync(join(outDir, `cases-v${vol}.json`), JSON.stringify(byVolume[vol]))
}
writeFileSync(join(outDir, 'index.json'), JSON.stringify(index satisfies CaseIndexEntry[]))

const mech = { leftovers: 0, lineup: 0, elimination: 0, anagram: 0 }
for (const c of cases) mech[c.mechanic]++
const kb = (cases.length ? JSON.stringify(cases).length / 1024 : 0).toFixed(0)
console.log(`generated ${cases.length} cases (${kb} KB) → src/data/`)
console.log('mechanics:', mech)
