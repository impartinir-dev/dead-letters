import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ADS } from '../src/config.ts'
import { adsAllowed, interstitialDue } from '../src/lib/adsPolicy.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = (p: string) => readFileSync(join(root, 'src', p), 'utf8')

describe('ads', () => {
  it('ship switched off', () => {
    expect(ADS.enabled).toBe(false)
  })

  it('need both the master switch and explicit consent', () => {
    expect(adsAllowed(false, 'granted')).toBe(false)
    expect(adsAllowed(true, 'unknown')).toBe(false)
    expect(adsAllowed(true, 'denied')).toBe(false)
    expect(adsAllowed(true, 'granted')).toBe(true)
  })

  it('interstitial comes every Nth solve, never when N is 0', () => {
    expect([1, 2, 3, 4, 5, 6].map((n) => interstitialDue(n, 3))).toEqual([false, false, true, false, false, true])
    expect(interstitialDue(3, 0)).toBe(false)
    expect(interstitialDue(0, 3)).toBe(false)
  })

  it('never appear on or beside the grid', () => {
    for (const f of ['components/WordGrid.tsx', 'components/WordBank.tsx', 'components/modes/WordSearchMode.tsx', 'components/CaseScreen.tsx'])
      expect(src(f), f).not.toMatch(/AdSlot|Interstitial|from '\.\.?\/(components\/)?Ads'/)
  })
})
