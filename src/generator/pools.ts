/** Shared content pools for the case generator. All values uppercase A-Z. */

export const FIRST_NAMES = [
  'ADA', 'AGNES', 'ALVIN', 'AMOS', 'BETTY', 'BRUNO', 'CARL', 'CECIL', 'CLARA',
  'CORA', 'DELIA', 'DORIS', 'EDITH', 'EDMUND', 'ELSIE', 'EMMETT', 'ESSIE',
  'FELIX', 'FLORENCE', 'FRANK', 'FRED', 'GEORGE', 'GLADYS', 'GUS', 'HARRIET',
  'HATTIE', 'HENRY', 'HUGO', 'IDA', 'IRIS', 'IVY', 'JUDE', 'LEO', 'LEON',
  'LILLIAN', 'LOLA', 'LOU', 'MABEL', 'MARLOWE', 'MARTHA', 'MAUDE', 'MILES',
  'MORTON', 'NANCY', 'NELL', 'NINA', 'NORA', 'OLIVE', 'OPAL', 'OTIS', 'OTTO',
  'PEARL', 'RAY', 'ROSCOE', 'ROSE', 'RUBY', 'RUFUS', 'SADIE', 'SILAS', 'STELLA',
  'THEO', 'VERA', 'VERNON', 'VICTOR', 'VIOLA', 'WALTER', 'WILMA', 'ZELDA',
]

export const SURNAMES = [
  'ASHFORD', 'BLACKWOOD', 'BRIGGS', 'CARROW', 'CROWE', 'DELACROIX', 'DRAKE',
  'FENWICK', 'FINCH', 'GRAVES', 'HALLOWAY', 'HARLOW', 'HAWTHORNE', 'KESTREL',
  'LARKIN', 'LOCKE', 'MARSH', 'MERCER', 'MOORE', 'NIGHTINGALE', 'OSGOOD',
  'PALEY', 'QUILL', 'RAVENSCAR', 'ROOK', 'SINCLAIR', 'STERN', 'THORNE',
  'UNDERWOOD', 'VALE', 'VOSS', 'WEXLER', 'WHITLOCK', 'WREN', 'YORK',
]

/* Weapons and locations live per theme in themes.ts (rooms / weapons). */

export const MOTIVES = [
  'INHERITANCE', 'JEALOUSY', 'REVENGE', 'BLACKMAIL', 'RIVALRY', 'GREED',
  'LOVE', 'DEBT', 'SECRET', 'POWER', 'INSURANCE', 'BETRAYAL',
]

/** Generic crime words used to pad word banks. */
export const CRIME_FILLER = [
  'ALIBI', 'BLOOD', 'CLUE', 'CORPSE', 'CRIME', 'EVIDENCE', 'FELONY',
  'FOULPLAY', 'GUILT', 'MOTIVE', 'MURDER', 'RANSOM', 'SUSPECT', 'VICTIM',
  'WITNESS', 'DETECTIVE', 'INQUEST', 'POISON', 'DAGGER', 'NOTEBOOK',
]

/**
 * Theme-neutral in-world padding phrases (uppercase, spaces). Leftover
 * messages are padded to an exact length with the theme's own phrases first,
 * then these; the short ones (3–6 letters) let any remainder >= 3 be filled.
 * None may name a room, weapon, trait, or suspect role.
 */
export const PAD_PHRASES = [
  'SOMEONE LIED ABOUT THE TIME',
  'THE CLOCK WAS WRONG',
  'NOBODY LEFT THAT NIGHT',
  'THE LIGHTS WENT OUT',
  'CHECK THE ALIBIS',
  'FOLLOW THE MONEY',
  'THE WINDOW WAS OPEN',
  'SOMEONE SAW IT',
  'THE NOTE WAS FORGED',
  'NOTHING ADDS UP',
  'IT WAS NO ACCIDENT',
  'NEVER LOOK BACK',
  'NOT AN ACCIDENT',
  'SOMEONE KNOWS',
  'TRUST NO ONE',
  'SAY NOTHING',
  'CHECK AGAIN',
  'STAY QUIET',
  'ASK AROUND',
  'TELL NO ONE',
  'BURN THIS',
  'WHO KNEW',
  'LOOK CLOSER',
  'READ IT AGAIN',
  'KEEP DIGGING',
  'TOO LATE',
  'BEWARE',
  'LISTEN',
  'HURRY',
  'WAIT',
  'LOOK',
  'HUSH',
  'RUN',
]

/**
 * Confession cores for the anagram mechanic (word arrays). Every one names
 * the killer or their role. {KILLER} {ROLE} {VICTIMFIRST} fill per case.
 */
export const CONFESSIONS: string[][] = [
  ['I', 'KILLED', '{VICTIMFIRST}', 'SIGNED', '{KILLER}'],
  ['I', 'AM', 'THE', '{ROLE}', 'AND', 'I', 'DID', 'IT'],
  ['GUILTY', 'AS', 'CHARGED', 'YOURS', 'TRULY', '{KILLER}'],
  ['IT', 'WAS', 'ME', '{KILLER}'],
  ['YOU', 'CAUGHT', 'ME', 'I', 'AM', 'THE', '{ROLE}'],
  ['{KILLER}', 'CONFESSES', 'TO', 'MURDER'],
  ['NOBODY', 'SUSPECTED', 'THE', '{ROLE}'],
  ['THE', '{ROLE}', 'DID', 'IT', 'I', 'CONFESS'],
]

/** Padding for anagram phrases (word arrays), used alongside theme phrases. */
export const CONFESSION_PADS: string[][] = [
  ['FORGIVE', 'ME'],
  ['I', 'AM', 'SORRY'],
  ['NO', 'REGRETS'],
  ['AND', 'I', 'WOULD', 'DO', 'IT', 'AGAIN'],
  ['IN', 'THE', '{LOCATION}'],
  ['WITH', 'THE', '{WEAPON}'],
  ['THEY', 'HAD', 'IT', 'COMING'],
  ['I', 'HAD', 'NO', 'CHOICE'],
  ['IT', 'HAD', 'TO', 'BE', 'DONE'],
  ['TELL', 'NO', 'ONE'],
  ['LET', 'ME', 'EXPLAIN'],
  ['IT', 'IS', 'DONE'],
  ['AT', 'LAST'],
  ['SO', 'BE', 'IT'],
  ['NO', 'MORE'],
  ['I', 'LIED'],
  ['ALAS'],
  ['ADIEU'],
]

/** Trait dimensions for the suspect-lineup mechanic. */
export const TRAIT_VALUES = {
  hair: ['RED', 'BLACK', 'BLONDE', 'GREY', 'BALD'],
  hand: ['LEFT', 'RIGHT'],
  accessory: ['GLASSES', 'CANE', 'TATTOO', 'SCAR', 'PEARLS'],
  habit: ['SMOKER', 'TEETOTAL', 'GAMBLER', 'SLEEPWALKER'],
} as const

export type TraitDim = keyof typeof TRAIT_VALUES

export const TRAIT_LABEL: Record<TraitDim, Record<string, string>> = {
  hair: { RED: 'Red hair', BLACK: 'Black hair', BLONDE: 'Blonde hair', GREY: 'Grey hair', BALD: 'Bald' },
  hand: { LEFT: 'Left-handed', RIGHT: 'Right-handed' },
  accessory: {
    GLASSES: 'Wears glasses', CANE: 'Carries a cane', TATTOO: 'Has a tattoo',
    SCAR: 'Has a scar', PEARLS: 'Wears pearls',
  },
  habit: {
    SMOKER: 'Smokes', TEETOTAL: 'Never drinks', GAMBLER: 'Gambles', SLEEPWALKER: 'Sleepwalks',
  },
}

/**
 * Squashed clue messages per dim+value (go into leftover cells) plus a
 * readable clue shown in the lineup panel.
 */
export const CLUE_TEXT: Record<TraitDim, Record<string, { msg: string; readable: string }>> = {
  hair: {
    RED: { msg: 'THEKILLERHASREDHAIR', readable: 'The killer has red hair.' },
    BLACK: { msg: 'THEKILLERHASBLACKHAIR', readable: 'The killer has black hair.' },
    BLONDE: { msg: 'THEKILLERHASBLONDEHAIR', readable: 'The killer has blonde hair.' },
    GREY: { msg: 'THEKILLERHASGREYHAIR', readable: 'The killer has grey hair.' },
    BALD: { msg: 'THEKILLERISBALD', readable: 'The killer is bald.' },
  },
  hand: {
    LEFT: { msg: 'THEKILLERISLEFTHANDED', readable: 'The killer is left-handed.' },
    RIGHT: { msg: 'THEKILLERISRIGHTHANDED', readable: 'The killer is right-handed.' },
  },
  accessory: {
    GLASSES: { msg: 'THEKILLERWEARSGLASSES', readable: 'The killer wears glasses.' },
    CANE: { msg: 'THEKILLERCARRIESACANE', readable: 'The killer carries a cane.' },
    TATTOO: { msg: 'THEKILLERHASATATTOO', readable: 'The killer has a tattoo.' },
    SCAR: { msg: 'THEKILLERHASASCAR', readable: 'The killer has a scar.' },
    PEARLS: { msg: 'THEKILLERWEARSPEARLS', readable: 'The killer wears pearls.' },
  },
  habit: {
    SMOKER: { msg: 'THEKILLERSMOKES', readable: 'The killer smokes.' },
    TEETOTAL: { msg: 'THEKILLERNEVERDRINKS', readable: 'The killer never drinks.' },
    GAMBLER: { msg: 'THEKILLERGAMBLES', readable: 'The killer gambles.' },
    SLEEPWALKER: { msg: 'THEKILLERISASLEEPWALKER', readable: 'The killer sleepwalks.' },
  },
}

/**
 * Cipher-case plaintext phrases — each points at the killer by {ROLE}, so the
 * decoded note leads to an accusation. {WEAPON} {LOCATION} {ROLE} fill with
 * case atoms (uppercase, spaces kept).
 */
export const CIPHER_PHRASES = [
  'ASK THE {ROLE} ABOUT THE {WEAPON}',
  'THE {ROLE} WAS IN THE {LOCATION} AT MIDNIGHT',
  'I SAW THE {ROLE} LEAVE THE {LOCATION}',
  'NEVER TRUST THE {ROLE}',
  'THE {ROLE} HID THE {WEAPON}',
  'FOLLOW THE {ROLE}',
  'THE {ROLE} LIED ABOUT THE TIME',
  'THE {WEAPON} BELONGS TO THE {ROLE}',
  'IT WAS THE {ROLE} ALL ALONG',
  'THE {ROLE} KNOWS WHAT HAPPENED IN THE {LOCATION}',
  'DO NOT LET THE {ROLE} NEAR THE {LOCATION} AGAIN',
  'THE {ROLE} HAD BLOOD ON THEIR SLEEVE',
]

/** Timeline-case events (lowercase clauses). */
export const TIMELINE_EVENTS = [
  'the lights went out',
  'a scream was heard',
  'the hall clock stopped',
  'a car sped away',
  'the telephone rang',
  'the front door slammed',
  'the dog started barking',
  'the alarm was tripped',
  'smoke filled the hall',
  'the piano stopped playing',
  'a shot rang out',
  'the window shattered',
  'the gate creaked open',
  'a candle blew out',
  'the record skipped',
  'someone knocked twice',
]

/** Evidence-note templates for elimination. {item} = cleared name. */
export const ELIM_NOTES = {
  suspect: [
    '{item} has an airtight alibi.',
    'Witnesses place {item} across town.',
    'Lab work clears {item}.',
    '{item} passed the polygraph.',
    'CCTV clears {item} completely.',
    '{item} was in custody that night.',
  ],
  weapon: [
    'No prints on the {item}.',
    'The {item} was ruled out by forensics.',
    'The wound does not match the {item}.',
    'The {item} was never at the scene.',
    'Not a drop of blood on the {item}.',
  ],
  location: [
    'The {loc} was locked all night.',
    'No trace evidence at the {loc}.',
    'The {loc} was full of witnesses.',
    'Dogs swept the {loc}; nothing.',
    'The {loc} lights were off all evening.',
  ],
}

/** Leftover flavor messages for elimination cases (before padding). */
export const ELIM_MESSAGES = [
  'THEEVIDENCENEVERLIES',
  'FOLLOWTHEEVIDENCE',
  'EVERYCLUECOUNTS',
  'TRUSTNOONE',
  'THETRUTHISINTHEGRID',
  'EVIDENCEISEVERYTHING',
]
