import type { CaseFile, CaseIndexEntry } from '../generator/types'
import indexJson from '../data/index.json'

export const CASE_INDEX = indexJson as CaseIndexEntry[]

const loaders = {
  1: () => import('../data/cases-v1.json'),
  2: () => import('../data/cases-v2.json'),
  3: () => import('../data/cases-v3.json'),
} as const

const cache = new Map<number, Promise<CaseFile[]>>()

export function volumeOf(id: number): 1 | 2 | 3 {
  return id <= 50 ? 1 : id <= 100 ? 2 : 3
}

export function loadVolume(v: 1 | 2 | 3): Promise<CaseFile[]> {
  let p = cache.get(v)
  if (!p) {
    p = loaders[v]().then((m) => m.default as unknown as CaseFile[])
    cache.set(v, p)
  }
  return p
}

export async function loadCase(id: number): Promise<CaseFile> {
  const vol = volumeOf(id)
  const list = await loadVolume(vol)
  return list[id - (vol - 1) * 50 - 1]
}
