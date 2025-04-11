import { Key } from './Key'

export const defaultQwertyLayout: Key[][] = [
  // Row 1
  [
    { label: 'Esc', physical_key: 'Escape' },
    { label: 'F1', physical_key: 'F1' },
    { label: 'F2', physical_key: 'F2' },
    { label: 'F3', physical_key: 'F3' },
    { label: 'F4', physical_key: 'F4' },
    { label: 'F5', physical_key: 'F5' },
    { label: 'F6', physical_key: 'F6' },
    { label: 'F7', physical_key: 'F7' },
    { label: 'F8', physical_key: 'F8' },
    { label: 'F9', physical_key: 'F9' },
    { label: 'F10', physical_key: 'F10' },
    { label: 'F11', physical_key: 'F11' },
    { label: 'F12', physical_key: 'F12' }
  ],
  // Row 2
  [
    { label: '`', physical_key: 'Backquote' },
    { label: '1', physical_key: 'Digit1' },
    { label: '2', physical_key: 'Digit2' },
    { label: '3', physical_key: 'Digit3' },
    { label: '4', physical_key: 'Digit4' },
    { label: '5', physical_key: 'Digit5' },
    { label: '6', physical_key: 'Digit6' },
    { label: '7', physical_key: 'Digit7' },
    { label: '8', physical_key: 'Digit8' },
    { label: '9', physical_key: 'Digit9' },
    { label: '0', physical_key: 'Digit0' },
    { label: '-', physical_key: 'Minus' },
    { label: '=', physical_key: 'Equal' },
    { label: 'Backspace', physical_key: 'Backspace' }
  ],
  // Row 3
  [
    { label: 'Tab', physical_key: 'Tab' },
    { label: 'Q', physical_key: 'KeyQ' },
    { label: 'W', physical_key: 'KeyW' },
    { label: 'E', physical_key: 'KeyE' },
    { label: 'R', physical_key: 'KeyR' },
    { label: 'T', physical_key: 'KeyT' },
    { label: 'Y', physical_key: 'KeyY' },
    { label: 'U', physical_key: 'KeyU' },
    { label: 'I', physical_key: 'KeyI' },
    { label: 'O', physical_key: 'KeyO' },
    { label: 'P', physical_key: 'KeyP' },
    { label: '[', physical_key: 'BracketLeft' },
    { label: ']', physical_key: 'BracketRight' },
    { label: '\\', physical_key: 'Backslash' }
  ],
  // Row 4
  [
    { label: 'Caps', physical_key: 'CapsLock' },
    { label: 'A', physical_key: 'KeyA' },
    { label: 'S', physical_key: 'KeyS' },
    { label: 'D', physical_key: 'KeyD' },
    { label: 'F', physical_key: 'KeyF' },
    { label: 'G', physical_key: 'KeyG' },
    { label: 'H', physical_key: 'KeyH' },
    { label: 'J', physical_key: 'KeyJ' },
    { label: 'K', physical_key: 'KeyK' },
    { label: 'L', physical_key: 'KeyL' },
    { label: ';', physical_key: 'Semicolon' },
    { label: "'", physical_key: 'Quote' },
    { label: 'Enter', physical_key: 'Enter' }
  ],
  // Row 5
  [
    { label: 'Shift', physical_key: 'ShiftLeft' },
    { label: 'Z', physical_key: 'KeyZ' },
    { label: 'X', physical_key: 'KeyX' },
    { label: 'C', physical_key: 'KeyC' },
    { label: 'V', physical_key: 'KeyV' },
    { label: 'B', physical_key: 'KeyB' },
    { label: 'N', physical_key: 'KeyN' },
    { label: 'M', physical_key: 'KeyM' },
    { label: ',', physical_key: 'Comma' },
    { label: '.', physical_key: 'Period' },
    { label: '/', physical_key: 'Slash' },
    { label: 'Shift', physical_key: 'ShiftRight' }
  ],
  // Row 6
  [
    { label: 'Ctrl', physical_key: 'ControlLeft' },
    { label: 'Win', physical_key: 'MetaLeft' },
    { label: 'Alt', physical_key: 'AltLeft' },
    { label: 'Space', physical_key: 'Space' },
    { label: 'Alt', physical_key: 'AltRight' },
    { label: 'Menu', physical_key: 'ContextMenu' },
    { label: 'Ctrl', physical_key: 'ControlRight' }
  ],
  // Numpad (optional row grouping)
  [
    { label: 'Num Lock', physical_key: 'NumLock' },
    { label: '/', physical_key: 'NumpadDivide' },
    { label: '*', physical_key: 'NumpadMultiply' },
    { label: '-', physical_key: 'NumpadSubtract' },
    { label: '7', physical_key: 'Numpad7' },
    { label: '8', physical_key: 'Numpad8' },
    { label: '9', physical_key: 'Numpad9' },
    { label: '+', physical_key: 'NumpadAdd' },
    { label: '4', physical_key: 'Numpad4' },
    { label: '5', physical_key: 'Numpad5' },
    { label: '6', physical_key: 'Numpad6' },
    { label: '1', physical_key: 'Numpad1' },
    { label: '2', physical_key: 'Numpad2' },
    { label: '3', physical_key: 'Numpad3' },
    { label: 'Enter', physical_key: 'NumpadEnter' },
    { label: '0', physical_key: 'Numpad0' },
    { label: '.', physical_key: 'NumpadDecimal' }
  ]
]
