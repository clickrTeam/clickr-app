// export const keys: string[] = [
//   // Letters
//   'A',
//   'B',
//   'C',
//   'D',
//   'E',
//   'F',
//   'G',
//   'H',
//   'I',
//   'J',
//   'K',
//   'L',
//   'M',
//   'N',
//   'O',
//   'P',
//   'Q',
//   'R',
//   'S',
//   'T',
//   'U',
//   'V',
//   'W',
//   'X',
//   'Y',
//   'Z',
//   // Digits
//   '0',
//   '1',
//   '2',
//   '3',
//   '4',
//   '5',
//   '6',
//   '7',
//   '8',
//   '9',
//   // Special Characters
//   'Space',
//   'Enter',
//   'Esc',
//   'Escape',
//   'Tab',
//   'Backspace',
//   'Pause',
//   'CapsLock',
//   // Special Characters with directions.
//   'Shift',
//   'ShiftLeft',
//   'ShiftRight',
//   'Ctrl',
//   'CtrlLeft',
//   'CtrlRight',
//   'Alt',
//   'AltLeft',
//   'AltRight',
//   // Function Keys
//   'F1',
//   'F2',
//   'F3',
//   'F4',
//   'F5',
//   'F6',
//   'F7',
//   'F8',
//   'F9',
//   'F10',
//   'F11',
//   'F12',
//   // Special Symbols
//   '~',
//   '`',
//   '-',
//   '=',
//   '[',
//   ']',
//   '\\',
//   ';',
//   "'",
//   ',',
//   '.',
//   '/',
//   // Arrow Keys
//   'Up',
//   'Down',
//   'Left',
//   'Right',
//   // Other special keys
//   'Insert',
//   'Delete',
//   'Home',
//   'End',
//   'PageUp',
//   'PageDown',
//   'Cmd'
// ]
export enum Key {
  // Letters
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
  Z = 'Z',

  // Digits
  Digit0 = '0',
  Digit1 = '1',
  Digit2 = '2',
  Digit3 = '3',
  Digit4 = '4',
  Digit5 = '5',
  Digit6 = '6',
  Digit7 = '7',
  Digit8 = '8',
  Digit9 = '9',

  // Whitespace / editing
  Enter = 'Enter',
  Tab = 'Tab',
  Backspace = 'Backspace',
  Escape = 'Escape',
  Space = 'Space',
  Delete = 'Delete',
  Insert = 'Insert',

  // Navigation
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  Home = 'Home',
  End = 'End',
  PageUp = 'PageUp',
  PageDown = 'PageDown',

  // Function keys
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
  // extended function keys
  F13 = 'F13',
  F14 = 'F14',
  F15 = 'F15',
  F16 = 'F16',
  F17 = 'F17',
  F18 = 'F18',
  F19 = 'F19',
  F20 = 'F20',

  // Numpad (logical names)
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

  NumpadAdd = 'NumpadAdd', // +
  NumpadSubtract = 'NumpadSubtract', // -
  NumpadMultiply = 'NumpadMultiply', // *
  NumpadDivide = 'NumpadDivide', // /
  NumpadDecimal = 'NumpadDecimal', // .
  NumpadEnter = 'NumpadEnter', // Enter key on numpad

  NumpadEqual = 'NumpadEqual', // = (rare, some layouts)
  NumpadComma = 'NumpadComma', // , (rare, some layouts)
  NumpadParenLeft = 'NumpadParenLeft', // ( (rare)
  NumpadParenRight = 'NumpadParenRight', // ) (rare)

  // Symbols / punctuation (common set)
  Minus = 'Minus',
  Equal = 'Equal',
  Backquote = 'Backquote',
  BracketLeft = 'BracketLeft',
  BracketRight = 'BracketRight',
  Backslash = 'Backslash',
  Semicolon = 'Semicolon',
  Quote = 'Quote',
  Comma = 'Comma',
  Period = 'Period',
  Slash = 'Slash',

  // Misc
  CapsLock = 'CapsLock',
  NumLock = 'NumLock',
  ScrollLock = 'ScrollLock',
  Pause = 'Pause',
  PrintScreen = 'PrintScreen'
}

export enum Modifier {
  Shift = 'Shift',
  Control = 'Control', // Ctrl on Windows/Linux, Control on macOS (separate key exists)
  Alt = 'Alt', // Alt on Windows/Linux, Option on macOS (mapping layer)
  Meta = 'Meta', // Windows key or Command key; platform dependent
  ShiftLeft = 'ShiftLeft',
  ShiftRight = 'ShiftRight',
  ControlLeft = 'ControlLeft',
  ControlRight = 'ControlRight',
  AltLeft = 'AltLeft',
  AltRight = 'AltRight',
  MetaLeft = 'MetaLeft',
  MetaRight = 'MetaRight',
  Fn = 'Fn' // hardware function modifier (macbooks, many laptops)
}

export enum MacKey {
  Command = 'Command', // ⌘ (maps to Meta)
  Option = 'Option', // ⌥ (maps to Alt)
  Control = 'Control', // ^ (mac Control key exists)
  Fn = 'Fn',
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
  Win = 'Win', // Windows / Super / Meta
  Menu = 'Menu', // Application key (context menu)
  PrintScreen = 'PrintScreen',
  PauseBreak = 'PauseBreak',
  Insert = 'Insert',
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
  Super = 'Super', // often the Windows key
  Compose = 'Compose',
  SysReq = 'SysReq', // may overlap with PrintScreen
  // Common X11 extras
  XF86AudioPlay = 'XF86AudioPlay',
  XF86AudioNext = 'XF86AudioNext',
  XF86AudioPrev = 'XF86AudioPrev',
  XF86AudioMute = 'XF86AudioMute',
  XF86AudioRaiseVolume = 'XF86AudioRaiseVolume',
  XF86AudioLowerVolume = 'XF86AudioLowerVolume',
  XF86HomePage = 'XF86HomePage',
  XF86Search = 'XF86Search'
  // You can add any XF86* keys supported by your environment
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

  // Browser & Tabs
  NewTab = 'NewTab', // mac: ⌘+T, win/linux: Ctrl+T
  CloseTab = 'CloseTab', // mac: ⌘+W, win/linux: Ctrl+W
  ReopenTab = 'ReopenTab', // mac: ⌘+Shift+T, win/linux: Ctrl+Shift+T
  Refresh = 'Refresh', // mac: ⌘+R, win/linux: Ctrl+R or F5
  OpenDevTools = 'OpenDevTools', // mac: ⌘+Option+I, win/linux: Ctrl+Shift+I
  FocusAddressBar = 'FocusAddressBar' // mac: ⌘+L, win/linux: Ctrl+L
}

