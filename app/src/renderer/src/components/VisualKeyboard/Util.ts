// Utility functions for VisualKeyboard
import log from 'electron-log'
import { keyShortLabels } from './Layout.const'
import { Modifier, Navigation } from '../../../../models/Keys.enum'

// Helper to get short label or icon
export const getShortLabel = (key: string): string => {
  if (keyShortLabels[key]) return keyShortLabels[key]
  if (/^F\d{1,2}$/.test(key)) return key // F1-F12
  if (key.length > 5) return key.slice(0, 5)
  return key
}

// Utility to normalize key names from KeyboardEvent to our key names
export const normalizeKey = (event: KeyboardEvent): string => {
  if (event.code.startsWith('Numpad')) return event.code
  if (event.code === 'ShiftLeft') return Modifier.LeftShift
  if (event.code === 'ShiftRight') return Modifier.RightShift
  if (event.code === 'ControlLeft') return Modifier.LeftControl
  if (event.code === 'ControlRight') return Modifier.RightControl
  if (event.code === 'AltLeft') return Modifier.LeftAlt
  if (event.code === 'AltRight') return Modifier.RightAlt
  if (event.code === 'MetaLeft' || event.code === 'MetaRight') return 'Command' // Todo deal with command
  const key = event.key
  if (key === ' ') return Navigation.Space
  if (key === 'Control') return Modifier.LeftControl
  if (key === 'Alt') return Modifier.LeftAlt
  if (key === 'Meta') return 'Command'
  if (key === 'OS') return 'Command'
  if (key === 'ArrowUp') return Navigation.ArrowUp
  if (key === 'ArrowDown') return Navigation.ArrowDown
  if (key === 'ArrowLeft') return Navigation.ArrowLeft
  if (key === 'ArrowRight') return Navigation.ArrowRight
  if (key === 'CapsLock') return Navigation.CapsLock
  if (key === 'Shift') return Modifier.LeftShift
  if (key === 'Enter') return Navigation.Enter
  if (key === 'Tab') return Navigation.Tab
  if (key === 'Esc') return Navigation.Escape
  if (key === 'PrintScreen') return Navigation.PrintScreen
  if (key === 'ScrollLock') return Navigation.ScrollLock
  if (key === 'Pause') return Navigation.Pause
  if (key === '`') return 'Grave'
  if (key === '-') return 'Minus'
  if (key === 'Equal') return 'Equals'
  if (key === '[') return 'LeftBracket'
  if (key === ']') return 'RightBracket'
  if (key === '\\') return 'Backslash'
  if (key === ';') return 'Semicolon'
  if (key === "'") return 'Apostrophe'
  if (key === ',') return 'Comma'
  if (key === '.') return 'Period'
  if (key === '/') return 'Slash'

  if (key === '') {
    log.error('Received empty key from KeyboardEvent')
    return 'UNDEFINED'
  }
  if (key.trim() === '') {
    log.error('Received trimmed empty key from KeyboardEvent')
    return 'UNDEFINED-WHITESPACE'
  }

  return key.length === 1 ? key.toUpperCase() : key
}
