// Utility functions for VisualKeyboard
import { keyShortLabels } from './Layout.const'

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
  if (event.code === 'ShiftLeft') return 'ShiftLeft'
  if (event.code === 'ShiftRight') return 'ShiftRight'
  if (event.code === 'ControlLeft') return 'CtrlLeft'
  if (event.code === 'ControlRight') return 'CtrlRight'
  if (event.code === 'AltLeft') return 'AltLeft'
  if (event.code === 'AltRight') return 'AltRight'
  if (event.code === 'MetaLeft' || event.code === 'MetaRight') return 'Win'
  const key = event.key
  if (key === ' ') return 'Space'
  if (key === 'Control') return 'CtrlLeft'
  if (key === 'Alt') return 'AltLeft'
  if (key === 'Meta') return 'Win'
  if (key === 'OS') return 'Win'
  if (key === 'ArrowUp') return 'Up'
  if (key === 'ArrowDown') return 'Down'
  if (key === 'ArrowLeft') return 'Left'
  if (key === 'ArrowRight') return 'Right'
  if (key === 'CapsLock') return 'CapsLock'
  if (key === 'Shift') return 'ShiftLeft'
  if (key === 'Enter') return 'Enter'
  if (key === 'Tab') return 'Tab'
  if (key === 'Escape') return 'Esc'
  if (key === 'PrintScreen') return 'PrintScreen'
  if (key === 'ScrollLock') return 'ScrollLock'
  if (key === 'Pause') return 'Pause'
  return key.length === 1 ? key.toUpperCase() : key
}
