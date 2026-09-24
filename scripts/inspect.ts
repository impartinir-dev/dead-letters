import { readFileSync } from 'node:fs'
import type { CaseFile } from '../src/generator/types.ts'

const all: CaseFile[] = [1, 2, 3].flatMap((v) =>
  JSON.parse(readFileSync(`src/data/cases-v${v}.json`, 'utf8')),
)
const l3 = all.filter((c) => c.payload.kind === 'leftovers' && c.payload.blanks.length === 3)[0]
console.log('3-blank:', l3.id, '|', l3.title, '|', (l3.payload as any).message)
console.log('anagrams:', all.filter((c) => c.mechanic === 'anagram').slice(0, 4).map((c) => (c.payload as any).phrase))
console.log('clues:', all.filter((c) => c.mechanic === 'lineup').slice(0, 4).map((c) => (c.payload as any).clueText))
console.log('leftover msgs sample:', all.filter((c) => c.mechanic === 'leftovers').slice(0, 6).map((c) => (c.payload as any).message))
console.log('sizes histogram:', all.reduce((m, c) => ((m[c.rows] = (m[c.rows] ?? 0) + 1), m), {} as Record<number, number>))
