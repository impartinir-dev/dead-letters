import { readFileSync } from 'node:fs'
import type { CaseFile } from '../src/generator/types.ts'

const all: CaseFile[] = [1, 2, 3].flatMap((v) =>
  JSON.parse(readFileSync(`src/data/cases-v${v}.json`, 'utf8')),
)
const ids = process.argv.slice(2).map(Number).filter(Boolean)
for (const c of ids.length ? ids.map((id) => all[id - 1]) : all) {
  const p = c.payload as { message?: string; phrase?: string }
  console.log(
    `#${c.id} [${c.themeId}] ${c.title} | ${c.killer} · ${c.weapon} · ${c.location} | ${c.mechanic}` +
      (p.message ?? p.phrase ? ` | ${p.message ?? p.phrase}` : ''),
  )
}
