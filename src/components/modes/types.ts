import type { CaseFile } from '../../generator/types'

/** Contract between CaseScreen (chrome: header/timer/hints/overlay) and a mode body. */
export interface ModeProps {
  c: CaseFile
  /** increments each time the player spends a hint */
  hintToken: number
  /** footer status text (e.g. "7/12 words") */
  setStatus: (s: string) => void
  /** transient message toast */
  notify: (msg: string) => void
  onSolved: () => void
  onWrong: () => void
}
