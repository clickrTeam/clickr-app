import log from 'electron-log'
import { detectOS } from './Profile'

//#region keys

export enum Letters {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  I = 'I',
  J = 'J',
  K = 'K',
  L = 'L',
  M = 'M',
  N = 'N',
  O = 'O',
  P = 'P',
  Q = 'Q',
  R = 'R',
  S = 'S',
  T = 'T',
  U = 'U',
  V = 'V',
  W = 'W',
  X = 'X',
  Y = 'Y',
  Z = 'Z'
}

export enum Digits {
  Digit0 = '0',
  Digit1 = '1',
  Digit2 = '2',
  Digit3 = '3',
  Digit4 = '4',
  Digit5 = '5',
  Digit6 = '6',
  Digit7 = '7',
  Digit8 = '8',
  Digit9 = '9'
}

export enum Numpad {
  Numpad0 = 'Numpad0',
  Numpad1 = 'Numpad1',
  Numpad2 = 'Numpad2',
  Numpad3 = 'Numpad3',
  Numpad4 = 'Numpad4',
  Numpad5 = 'Numpad5',
  Numpad6 = 'Numpad6',
  Numpad7 = 'Numpad7',
  Numpad8 = 'Numpad8',
  Numpad9 = 'Numpad9',
  NumpadAdd = 'NumpadAdd',
  NumpadSubtract = 'NumpadSubtract',
  NumpadMultiply = 'NumpadMultiply',
  NumpadDivide = 'NumpadDivide',
  NumpadDecimal = 'NumpadDecimal',
  NumpadEnter = 'NumpadEnter'
}

export enum Misc {
  CapsLock = 'CapsLock',
  NumLock = 'NumLock',
  ScrollLock = 'ScrollLock',
  Pause = 'Pause'
}

export enum Function {
  F1 = 'F1',
  F2 = 'F2',
  F3 = 'F3',
  F4 = 'F4',
  F5 = 'F5',
  F6 = 'F6',
  F7 = 'F7',
  F8 = 'F8',
  F9 = 'F9',
  F10 = 'F10',
  F11 = 'F11',
  F12 = 'F12',
  F13 = 'F13',
  F14 = 'F14',
  F15 = 'F15',
  F16 = 'F16',
  F17 = 'F17',
  F18 = 'F18',
  F19 = 'F19',
  F20 = 'F20'
}

export enum Navigation {
  Escape = 'Escape',
  Tab = 'Tab',
  Enter = 'Enter',
  Backspace = 'Backspace',
  Space = 'Space',
  Insert = 'Insert',
  Delete = 'Delete',
  Home = 'Home',
  End = 'End',
  PageUp = 'PageUp',
  PageDown = 'PageDown',
  PrintScreen = 'PrintScreen',
  Pause = 'Pause',
  Menu = 'Menu',
  CapsLock = 'CapsLock',
  NumLock = 'NumLock',
  ScrollLock = 'ScrollLock',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight'
}

export enum Modifier {
  LeftShift = 'LeftShift',
  RightShift = 'RightShift',
  LeftControl = 'LeftControl',
  RightControl = 'RightControl',
  LeftAlt = 'LeftAlt',
  RightAlt = 'RightAlt',
  LeftSuper = 'LeftSuper',
  RightSuper = 'RightSuper'
}

export enum KeyedSymbols {
  Grave = 'Grave', // AKA backtick
  Dash = 'Minus',
  Equal = 'Equals',
  BracketLeft = 'LeftBracket',
  BracketRight = 'RightBracket',
  Backslash = 'Backslash',
  Semicolon = 'Semicolon',
  Quote = 'Apostrophe',
  Comma = 'Comma',
  Period = 'Period',
  Slash = 'Slash'
}

export const ENSURE_KEYS: string[] = [
  Object.values(Letters),
  Object.values(Digits),
  Object.values(Numpad),
  Object.values(Misc),
  Object.values(Function),
  Object.values(Navigation),
  Object.values(Modifier),
  Object.values(KeyedSymbols)
].flat()

//#endregion

//#region keyless

export enum Symbols {
  Exclamation = '!',
  At = '@',
  Hash = '#',
  Dollar = '$',
  Percent = '%',
  Caret = '^',
  Ampersand = '&',
  Asterisk = '*',
  ParenLeft = '(',
  ParenRight = ')',
  Underscore = '_',
  Plus = '+',
  Tilde = '~',
  BraceLeft = '{',
  BraceRight = '}',
  Pipe = '|',
  Colon = ':',
  DoubleQuote = '"',
  LessThan = '<',
  GreaterThan = '>',
  Question = '?'
}

export enum MacKey {
  CommandLeft = 'CommandLeft', // ⌘ (maps to Meta)
  CommandRight = 'CommandRight',
  OptionLeft = 'OptionLeft', // ⌥ (maps to Alt)
  OptionRight = 'OptionRight',
  Control = 'Control', // ^ (mac Control key exists)
  Eject = 'Eject',
  Spotlight = 'Spotlight', // (if keyboard has a key)
  Launchpad = 'Launchpad', // (if present)
  MissionControl = 'MissionControl', // (exposé key)
  MediaPlayPause = 'MediaPlayPause',
  MediaNext = 'MediaNext',
  MediaPrev = 'MediaPrev',
  VolumeMute = 'VolumeMute',
  VolumeUp = 'VolumeUp',
  VolumeDown = 'VolumeDown'
}

export enum WinKey {
  WinLeft = Modifier.LeftSuper, // Windows / Super / Meta
  WinRight = Modifier.RightSuper,
  LeftControl = 'LeftControl',
  RightControl = 'RightControl',
  LeftAlt = 'LeftAlt',
  RightAlt = 'RightAlt',
  Menu = 'Menu', // Application key (context menu)
  PauseBreak = 'PauseBreak',
  Insert = 'Insert',
  PrintScreen = 'PrintScreen',
  // OEM keys and extras (naming varies by layout)
  OEM1 = 'OEM1',
  OEM2 = 'OEM2',
  OEM3 = 'OEM3',
  OEM4 = 'OEM4',
  OEM5 = 'OEM5',
  OEM6 = 'OEM6',
  OEM7 = 'OEM7',
  BrowserBack = 'BrowserBack',
  BrowserForward = 'BrowserForward',
  BrowserRefresh = 'BrowserRefresh',
  BrowserStop = 'BrowserStop',
  BrowserSearch = 'BrowserSearch',
  BrowserFavorites = 'BrowserFavorites',
  LaunchMail = 'LaunchMail',
  LaunchApp1 = 'LaunchApp1',
  LaunchApp2 = 'LaunchApp2'
}

export enum LinuxKey {
  LeftSuper = 'LeftSuper',
  RightSuper = 'RightSuper',
  LeftControl = 'LeftControl',
  RightControl = 'RightControl',
  LeftAlt = 'LeftAlt',
  RightAlt = 'RightAlt',
  Compose = 'Compose',
  SysReq = 'SysReq',
  // Common X11 extras
  XF86AudioPlay = 'XF86AudioPlay',
  XF86AudioNext = 'XF86AudioNext',
  XF86AudioPrev = 'XF86AudioPrev',
  XF86AudioMute = 'XF86AudioMute',
  XF86AudioRaiseVolume = 'XF86AudioRaiseVolume',
  XF86AudioLowerVolume = 'XF86AudioLowerVolume',
  XF86HomePage = 'XF86HomePage',
  XF86Search = 'XF86Search'
}

// These are higher level actions that are mapped to different key combos on different OSes
// We will add these to the UI for users to configure shortcuts, and map them to actual key combinations per OS
export enum ShortcutAction {
  // Clipboard
  Copy = 'Copy', // mac: ⌘+C, win/linux: Ctrl+C
  Paste = 'Paste', // mac: ⌘+V, win/linux: Ctrl+V
  Cut = 'Cut', // mac: ⌘+X, win/linux: Ctrl+X
  Undo = 'Undo', // mac: ⌘+Z, win/linux: Ctrl+Z
  Redo = 'Redo', // mac: ⌘+Shift+Z, win/linux: Ctrl+Y or Ctrl+Shift+Z
  SelectAll = 'SelectAll', // mac: ⌘+A, win/linux: Ctrl+A
  DeleteLine = 'DeleteLine', // mac: ⌘+Shift+K, win/linux: Ctrl+Shift+K

  // Navigation
  Find = 'Find', // mac: ⌘+F, win/linux: Ctrl+F
  FindNext = 'FindNext', // mac: ⌘+G, win/linux: F3 or Ctrl+G
  Replace = 'Replace', // mac: ⌘+Shift+H, win/linux: Ctrl+H
  GoToLine = 'GoToLine', // mac: ⌘+L, win/linux: Ctrl+G
  MoveToLineStart = 'MoveToLineStart', // mac: ⌘+←, win/linux: Home
  MoveToLineEnd = 'MoveToLineEnd', // mac: ⌘+→, win/linux: End
  MoveWordLeft = 'MoveWordLeft', // mac: Option+←, win/linux: Ctrl+←
  MoveWordRight = 'MoveWordRight', // mac: Option+→, win/linux: Ctrl+→

  // File & App Control
  NewFile = 'NewFile', // mac: ⌘+N, win/linux: Ctrl+N
  OpenFile = 'OpenFile', // mac: ⌘+O, win/linux: Ctrl+O
  Save = 'Save', // mac: ⌘+S, win/linux: Ctrl+S
  SaveAs = 'SaveAs', // mac: ⌘+Shift+S, win/linux: Ctrl+Shift+S
  Print = 'Print', // mac: ⌘+P, win/linux: Ctrl+P
  CloseWindow = 'CloseWindow', // mac: ⌘+W, win/linux: Alt+F4 or Ctrl+W
  QuitApp = 'QuitApp', // mac: ⌘+Q, win/linux: Ctrl+Q
  PrintScreen = 'PrintScreen', // mac: Shift+⌘+3, win: PrintScreen, linux: PrintScreen (sysreq)

  // Browser & Tabs
  NewTab = 'NewTab', // mac: ⌘+T, win/linux: Ctrl+T
  CloseTab = 'CloseTab', // mac: ⌘+W, win/linux: Ctrl+W
  ReopenTab = 'ReopenTab', // mac: ⌘+Shift+T, win/linux: Ctrl+Shift+T
  Refresh = 'Refresh', // mac: ⌘+R, win/linux: Ctrl+R or F5
  OpenDevTools = 'OpenDevTools', // mac: ⌘+Option+I, win/linux: Ctrl+Shift+I
  FocusAddressBar = 'FocusAddressBar' // mac: ⌘+L, win/linux: Ctrl+L
}
const current_os = detectOS()
export let os_keys: string[] = []

if (current_os === 'macOS') {
  // macOS specific settings or exports can go here
  os_keys = Object.values(MacKey)
} else if (current_os === 'Windows') {
  // Windows specific settings or exports can go here
  os_keys = Object.values(WinKey)
} else if (current_os === 'Linux') {
  // Linux specific settings or exports can go here
  os_keys = Object.values(LinuxKey)
} else {
  // Other OSes
  log.warn('Unsupported OS for specific key mappings')
}

export const keys: string[] = [
  Object.values(Letters),
  Object.values(Digits),
  Object.values(Modifier),
  Object.values(KeyedSymbols),
  Object.values(Numpad),
  Object.values(Misc),
  Object.values(Function),
  Object.values(Navigation),
  Object.values(Modifier),
  os_keys
].flat()

/**
 * Maps enum values to the actual KeyboardEvent.key string
 * that TypeScript key listeners will receive.
 */
export function mapEnumToKey(enumValue: string): string {
  const keyMap: Record<string, string> = {
    // KeyedSymbols
    Grave: '`',
    Minus: '-',
    Equals: '=',
    LeftBracket: '[',
    RightBracket: ']',
    Backslash: '\\',
    Semicolon: ';',
    Apostrophe: "'",
    Comma: ',',
    Period: '.',
    Slash: '/',

    // Digits
    '0': '0',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',

    // Letters
    A: 'a',
    B: 'b',
    C: 'c',
    D: 'd',
    E: 'e',
    F: 'f',
    G: 'g',
    H: 'h',
    I: 'i',
    J: 'j',
    K: 'k',
    L: 'l',
    M: 'm',
    N: 'n',
    O: 'o',
    P: 'p',
    Q: 'q',
    R: 'r',
    S: 's',
    T: 't',
    U: 'u',
    V: 'v',
    W: 'w',
    X: 'x',
    Y: 'y',
    Z: 'z',

    // Navigation
    Escape: 'Escape',
    Tab: 'Tab',
    Enter: 'Enter',
    Backspace: 'Backspace',
    Space: ' ',
    Insert: 'Insert',
    Delete: 'Delete',
    Home: 'Home',
    End: 'End',
    PageUp: 'PageUp',
    PageDown: 'PageDown',
    PrintScreen: 'PrintScreen',
    Pause: 'Pause',
    Menu: 'ContextMenu',
    CapsLock: 'CapsLock',
    NumLock: 'NumLock',
    ScrollLock: 'ScrollLock',
    ArrowUp: 'ArrowUp',
    ArrowDown: 'ArrowDown',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',

    // Function keys
    F1: 'F1',
    F2: 'F2',
    F3: 'F3',
    F4: 'F4',
    F5: 'F5',
    F6: 'F6',
    F7: 'F7',
    F8: 'F8',
    F9: 'F9',
    F10: 'F10',
    F11: 'F11',
    F12: 'F12',
    F13: 'F13',
    F14: 'F14',
    F15: 'F15',
    F16: 'F16',
    F17: 'F17',
    F18: 'F18',
    F19: 'F19',
    F20: 'F20',

    // Numpad
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
    NumpadAdd: '+',
    NumpadSubtract: '-',
    NumpadMultiply: '*',
    NumpadDivide: '/',
    NumpadDecimal: '.',
    NumpadEnter: 'Enter'
  }

  return keyMap[enumValue] ?? enumValue
}
