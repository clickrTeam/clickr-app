// Utility functions for VisualKeyboard
import { Layer } from '../../../models/Layer'
import { keyShortLabels } from './VisualKeyboard/VisualKeyboardLayout'

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

// Helper to get colors for a key's bindings
export const getKeyBindingColors = (key: string, layer: Layer): string[] => {
  const palette = [
    '#60a5fa', // blue-400
    '#f87171', // red-400
    '#34d399', // green-400
    '#fbbf24', // yellow-400
    '#a78bfa', // purple-400
    '#f472b6', // pink-400
    '#38bdf8', // sky-400
    '#fb7185', // rose-400
    '#facc15', // amber-400
    '#4ade80' // emerald-400
  ]
  const binds = Array.from(layer.remappings.entries())
    .filter(([trigger]) => {
      // Only match triggers with a .value property (KeyPress, KeyRelease, Hold, AppFocus, etc.)
      // @ts-expect-error: value is not in base Trigger, but is in subclasses
      return typeof trigger.value === 'string' && trigger.value === key
    })
    .map(([, bind]) => bind)
  return binds.length > 0 ? binds.map((_, i) => palette[i % palette.length]) : []
}

// Helper to get the background style for a key
export const getKeyBackground = (key: string | undefined, layer: Layer): string => {
  if (!key) return 'transparent'
  const bindingColors = getKeyBindingColors(key, layer)
  if (bindingColors.length === 0) {
    return '#d1d5db' // Tailwind gray-300, more visible than neutral-100
  } else if (bindingColors.length === 1) {
    return bindingColors[0]
  } else {
    const stops = bindingColors.map((color, i) => {
      const percent = Math.round((i / bindingColors.length) * 100)
      return `${color} ${percent}%`
    })
    return `linear-gradient(135deg, ${stops.join(', ')})`
  }
}

// Helper to get the className for a key
export const getKeyClass = (
  key: string | undefined,
  pressedKeys: string[],
  clickedKeys: string[]
): string => {
  return [
    'transition-all',
    'border',
    'rounded',
    'font-mono',
    'h-10',
    key && key.length >= 4 ? 'text-xs' : key && key.length >= 2 ? 'text-sm' : '',
    key && pressedKeys.includes(key) ? 'border-blue-600' : '',
    key && clickedKeys.includes(key) ? 'border-green-600' : '',
    key && !pressedKeys.includes(key) && !clickedKeys.includes(key) ? 'border-gray-300' : '',
    !key ? 'border-none cursor-default' : ''
  ].join(' ')
}
