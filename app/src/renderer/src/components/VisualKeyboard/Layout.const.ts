// Contains layout and label data for VisualKeyboard

type KeyLayoutKey = {
  key: string
  width?: number
  gapAfter?: boolean
  gridRowSpan?: number
}

export const mainRows: KeyLayoutKey[][] = [
  [
    { key: 'Esc', gapAfter: true },
    { key: 'F1' },
    { key: 'F2' },
    { key: 'F3' },
    { key: 'F4', gapAfter: true },
    { key: 'F5' },
    { key: 'F6' },
    { key: 'F7' },
    { key: 'F8', gapAfter: true },
    { key: 'F9' },
    { key: 'F10' },
    { key: 'F11' },
    { key: 'F12' }
  ],
  [
    { key: '`' },
    { key: '1' },
    { key: '2' },
    { key: '3' },
    { key: '4' },
    { key: '5' },
    { key: '6' },
    { key: '7' },
    { key: '8' },
    { key: '9' },
    { key: '0' },
    { key: '-' },
    { key: '=' },
    { key: 'Backspace', width: 5 }
  ],
  [
    { key: 'Tab', width: 3.75 },
    { key: 'Q' },
    { key: 'W' },
    { key: 'E' },
    { key: 'R' },
    { key: 'T' },
    { key: 'Y' },
    { key: 'U' },
    { key: 'I' },
    { key: 'O' },
    { key: 'P' },
    { key: '[' },
    { key: ']' },
    { key: '\\', width: 3.5 }
  ],
  [
    { key: 'CapsLock', width: 4.5 },
    { key: 'A' },
    { key: 'S' },
    { key: 'D' },
    { key: 'F' },
    { key: 'G' },
    { key: 'H' },
    { key: 'J' },
    { key: 'K' },
    { key: 'L' },
    { key: ';' },
    { key: "'" },
    { key: 'Enter', width: 5.25 }
  ],
  [
    { key: 'ShiftLeft', width: 5.75 },
    { key: 'Z' },
    { key: 'X' },
    { key: 'C' },
    { key: 'V' },
    { key: 'B' },
    { key: 'N' },
    { key: 'M' },
    { key: ',' },
    { key: '.' },
    { key: '/' },
    { key: 'ShiftRight', width: 6.5 }
  ],
  [
    { key: 'CtrlLeft', width: 3 },
    { key: 'Win', width: 3 },
    { key: 'AltLeft', width: 3 },
    { key: 'Space', width: 14.75 },
    { key: 'AltRight', width: 3 },
    { key: 'Fn', width: 3 },
    { key: 'Menu', width: 3 },
    { key: 'CtrlRight', width: 3 }
  ]
]

export const specialtyRows: KeyLayoutKey[][] = [
  [{ key: 'PrintScreen' }, { key: 'ScrollLock' }, { key: 'Pause' }],
  [{ key: 'Insert' }, { key: 'Home' }, { key: 'PageUp' }],
  [{ key: 'Delete' }, { key: 'End' }, { key: 'PageDown' }],
  [{ key: '' }],
  [{ key: '' }, { key: 'Up' }, { key: '' }],
  [{ key: 'Left' }, { key: 'Down' }, { key: 'Right' }]
]

export const numpadRows: KeyLayoutKey[][] = [
  [{ key: '' }],
  [
    { key: 'NumLock' },
    { key: 'NumpadDivide' },
    { key: 'NumpadMultiply' },
    { key: 'NumpadSubtract' }
  ],
  [{ key: 'Numpad7' }, { key: 'Numpad8' }, { key: 'Numpad9' }, { key: 'NumpadAdd', gridRowSpan: 2 }],
  [{ key: 'Numpad4' }, { key: 'Numpad5' }, { key: 'Numpad6' }],
  [{ key: 'Numpad1' }, { key: 'Numpad2' }, { key: 'Numpad3' }, { key: 'NumpadEnter', gridRowSpan: 2 }],
  [{ key: 'Numpad0', width: 4.75 }, { key: 'NumpadDecimal' }]
]

export const keyShortLabels: Record<string, string> = {
  PrintScreen: 'PrtSc',
  ScrollLock: 'ScrLk',
  Pause: 'Pause',
  Insert: 'Ins',
  Delete: 'Del',
  Home: 'Home',
  End: 'End',
  PageUp: 'PgUp',
  PageDown: 'PgDn',
  CapsLock: 'Caps',
  Backspace: 'Bksp',
  ShiftLeft: 'Shift',
  ShiftRight: 'Shift',
  CtrlLeft: 'Ctrl',
  CtrlRight: 'Ctrl',
  AltLeft: 'Alt',
  AltRight: 'Alt',
  NumLock: 'Num',
  NumpadDivide: '/',
  NumpadMultiply: '*',
  NumpadSubtract: '-',
  NumpadAdd: '+',
  NumpadEnter: 'Ent',
  NumpadDecimal: '.',
  Numpad0: '0',
  Numpad1: '1',
  Numpad2: '2',
  Numpad3: '3',
  Numpad4: '4',
  Numpad5: '5',
  Numpad6: '6',
  Numpad7: '7',
  Numpad8: '8',
  Numpad9: '9',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  Win: 'Win',
  Menu: 'Menu',
  Fn: 'Fn',
  Space: 'Space',
  Tab: 'Tab',
  Enter: 'Enter',
  Esc: 'Esc',
  Bksp: 'Bksp',
  PgUp: 'PgUp',
  PgDn: 'PgDn',
  Del: 'Del',
  Ins: 'Ins'
}

export const KEYBOARD_100 = [...mainRows.flat(), ...specialtyRows.flat(), ...numpadRows.flat()]
export const REPRESENTED_KEYS = KEYBOARD_100.map((k) => k.key).filter((k) => k !== '')
