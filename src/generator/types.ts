export type Mechanic =
  | 'leftovers'
  | 'lineup'
  | 'elimination'
  | 'anagram'
  | 'cryptogram'
  | 'deduction'
  | 'interrogation'
  | 'timeline'

/** Mechanics that play out on the word-search grid. */
export const WORD_SEARCH_MECHANICS: Mechanic[] = ['leftovers', 'lineup', 'elimination', 'anagram']

export interface Placement {
  word: string
  r: number
  c: number
  /** direction name, e.g. 'E' | 'SE' | 'NW' */
  d: string
}

export interface LeftoverPayload {
  kind: 'leftovers'
  /** full leftover text in row-major order (core message + padding tail), uppercase, no spaces */
  message: string
  /** the clue part of `message` — names the killer's role, never their name */
  core: string
  /** which case-file blanks the player must fill */
  blanks: Array<'killer' | 'weapon' | 'location'>
  /** cell indices (r*cols+c) of all leftover cells, row-major */
  messageCells: number[]
}

export interface Suspect {
  name: string
  traits: { hair: string; hand: string; accessory: string; habit: string }
}

export interface LineupPayload {
  kind: 'lineup'
  /** leftover message, e.g. THEKILLERHASREDHAIR + padding */
  message: string
  /** human-readable clue, e.g. "The killer has red hair." */
  clueText: string
  clueDim: keyof Suspect['traits']
  clueValue: string
  /** exactly one suspect has clueDim === clueValue */
  suspects: Suspect[]
  messageCells: number[]
}

export interface ElimItem {
  name: string
  cleared: boolean
  /** evidence note shown when cleared; empty for the true answer */
  note: string
}

export interface EliminationPayload {
  kind: 'elimination'
  suspects: ElimItem[]
  weapons: ElimItem[]
  locations: ElimItem[]
  /** ordered drip: eliminations[i] is revealed when the i-th word (bank order) is found */
  eliminations: Array<{
    word: string
    kind: 'suspect' | 'weapon' | 'location'
    item: string
    note: string
  }>
  /** leftover flavor message */
  message: string
  messageCells: number[]
}

export interface AnagramPayload {
  kind: 'anagram'
  /** the confession with spaces, e.g. "I DID IT FORGIVE ME" */
  phrase: string
  /** scrambled tile letters (no spaces), same multiset as phrase */
  tiles: string
  messageCells: number[]
}

export interface CryptogramPayload {
  kind: 'cryptogram'
  /** plaintext note (uppercase, spaces) */
  phrase: string
  /** encoded text — same length, letters substituted, spaces kept */
  cipher: string
  /** cipher letter -> plaintext letter revealed to the player */
  givens: Record<string, string>
  /** full cipher -> plain mapping (for validation) */
  mapping: Record<string, string>
}

export interface DeductionClue {
  text: string
  kind:
    | 'has-weapon' | 'not-weapon'
    | 'at-location' | 'not-location'
    | 'killer-weapon' | 'killer-not-weapon'
    | 'killer-location' | 'killer-not-location'
    | 'loc-weapon' | 'loc-not-weapon'
    | 'innocent'
  a: string
  b?: string
}

export interface DeductionPayload {
  kind: 'deduction'
  suspects: string[]
  weapons: string[]
  locations: string[]
  clues: DeductionClue[]
  /** full world (bijections + guilty flag) — the truth table */
  assignments: Array<{ suspect: string; weapon: string; location: string; guilty: boolean }>
}

export interface Statement {
  speaker: string
  text: string
  kind: 'innocent-self' | 'guilty-other' | 'innocent-other' | 'with-other' | 'other-alone'
  /** subject of the statement for *-other kinds */
  x?: string
}

export interface InterrogationPayload {
  kind: 'interrogation'
  suspects: Statement[]
  /** alibi pairings (objective fact used by with/alone statements) */
  pairings: [string, string][]
}

export interface TimeClue {
  text: string
  kind: 'before' | 'after' | 'first' | 'last' | 'immediately-after' | 'between'
  /** event indices this clue constrains */
  ids: number[]
}

export interface TimelinePayload {
  kind: 'timeline'
  /** event labels in display order (shuffled) */
  events: string[]
  /** chronological order as indices into `events` — order[0] = first event */
  order: number[]
  clues: TimeClue[]
}

export type Payload =
  | LeftoverPayload
  | LineupPayload
  | EliminationPayload
  | AnagramPayload
  | CryptogramPayload
  | DeductionPayload
  | InterrogationPayload
  | TimelinePayload

/** A member of the case's cast, introduced before the puzzle starts. */
export interface CaseSuspect {
  name: string
  /** lowercase role clues refer to, e.g. "sommelier" */
  role: string
  /** one-line hook shown on the case screen */
  hook: string
}

export interface CaseFile {
  id: number
  volume: 1 | 2 | 3
  title: string
  themeId: string
  mechanic: Mechanic
  /** grid dims — 0 for non-word-search cases */
  rows: number
  cols: number
  /** row strings of uppercase letters — empty for non-word-search cases */
  grid: string[]
  words: string[]
  victim: string
  /** 4 suspects in display order; the killer is always one of them */
  suspects: CaseSuspect[]
  killer: string
  weapon: string
  location: string
  motive: string
  flavor: string
  parSeconds: number
  placements: Placement[]
  payload: Payload
}

export interface CaseIndexEntry {
  id: number
  volume: 1 | 2 | 3
  title: string
  mechanic: Mechanic
  rows: number
  wordCount: number
}
