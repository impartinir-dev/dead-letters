import { readFileSync } from 'node:fs'
import type { CaseFile } from '../src/generator/types.ts'

const all: CaseFile[] = [1, 2, 3].flatMap((v) =>
  JSON.parse(readFileSync(`src/data/cases-v${v}.json`, 'utf8')),
)
if (process.argv.includes('--stats')) {
  const count = (keys: string[]) => keys.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map<string, number>())
  const names = all.flatMap((c) => [c.victim, ...c.suspects.map((s) => s.name)])
  const surnames = count(names.map((n) => n.split(' ').slice(1).join(' ')))
  const firsts = count(names.map((n) => n.split(' ')[0]))
  const intros = count(all.map((c) => c.flavor.replaceAll(c.victim, '{victim}').replaceAll(c.victim.split(' ')[0], '{first}')))
  const hist = count([...surnames.values()].map(String))
  console.log(`surnames: ${surnames.size} distinct, uses histogram ${JSON.stringify(Object.fromEntries(hist))}`)
  console.log(`first names: ${firsts.size} distinct, max ${Math.max(...firsts.values())} uses`)
  console.log(`intros: ${intros.size} distinct, max ${Math.max(...intros.values())} uses`)
  process.exit(0)
}

const ids = process.argv.slice(2).map(Number).filter(Boolean)
for (const c of ids.length ? ids.map((id) => all[id - 1]) : all) {
  const p = c.payload as { message?: string; phrase?: string }
  console.log(
    `#${c.id} [${c.themeId}] ${c.title} | ${c.killer} · ${c.weapon} · ${c.location} | ${c.mechanic}` +
      (p.message ?? p.phrase ? ` | ${p.message ?? p.phrase}` : ''),
  )
}
