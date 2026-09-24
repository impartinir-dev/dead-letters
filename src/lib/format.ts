export function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export const MECHANIC_LABEL: Record<string, string> = {
  leftovers: 'DEAD LETTER',
  lineup: 'SUSPECT LINEUP',
  elimination: 'DEDUCTION',
  anagram: 'CONFESSION',
}

export const MECHANIC_HELP: Record<string, string> = {
  leftovers:
    'Find every word in the bank. The letters left over in the grid — read top to bottom — spell out the solution. Fill in the case-file blanks.',
  lineup:
    'Find every word. The leftover letters spell a clue about the killer. Pick the matching suspect from the lineup.',
  elimination:
    'Each word you find uncovers evidence that clears a suspect, weapon, or location. When the dust settles, one of each remains — lock in your accusation.',
  anagram:
    'Find every word. The leftover letters form a scrambled confession — rearrange the tiles to reveal it.',
}
