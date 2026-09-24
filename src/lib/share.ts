import type { CaseFile } from '../generator/types'
import { fmtTime } from './format'

export function shareText(c: CaseFile, seconds: number, hints: number, wrong: number): string {
  const chal = seconds <= 120 ? ' ⚡2-min challenge' : ''
  return (
    `DEAD LETTERS — Case No. ${c.id} "${c.title}"\n` +
    `Solved in ${fmtTime(seconds)} · ${c.words.length}/${c.words.length} words · ` +
    `${hints} hint${hints === 1 ? '' : 's'} · ${wrong} false accusation${wrong === 1 ? '' : 's'}${chal}\n` +
    `Can you crack it faster?`
  )
}

export async function shareCase(c: CaseFile, seconds: number, hints: number, wrong: number): Promise<boolean> {
  const text = shareText(c, seconds, hints, wrong)
  try {
    if (navigator.share) {
      await navigator.share({ text })
      return true
    }
  } catch {
    /* user cancelled or unsupported — fall through to clipboard */
  }
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
