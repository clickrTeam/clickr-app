import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Layer } from '../../../models/Layer'

interface VisualKeyboardProps {
  layer: Layer
  maxLayer: number
  onUpdate: (updatedLayer: Layer) => void
}

// Main keyboard rows (with spacing for F keys)
const mainRows: { key: string; width?: number; gapAfter?: boolean }[][] = [
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

// Specialty keys above arrows (3x3 grid)
const specialtyRows: { key: string; width?: number }[][] = [
  [{ key: 'PrintScreen' }, { key: 'ScrollLock' }, { key: 'Pause' }],
  [{ key: 'Insert' }, { key: 'Home' }, { key: 'PageUp' }],
  [{ key: 'Delete' }, { key: 'End' }, { key: 'PageDown' }],
  [{ key: '' }], // Empty row for spacing
  [{ key: '' }, { key: 'Up' }, { key: '' }],
  [{ key: 'Left' }, { key: 'Down' }, { key: 'Right' }]
]

// Numpad section (with an empty row at the top)
const numpadRows: { key: string; width?: number }[][] = [
  [{ key: '' }], // Empty row for spacing
  [
    { key: 'NumLock' },
    { key: 'NumpadDivide' },
    { key: 'NumpadMultiply' },
    { key: 'NumpadSubtract' }
  ],
  [{ key: 'Numpad7' }, { key: 'Numpad8' }, { key: 'Numpad9' }, { key: 'NumpadAdd' }],
  [{ key: 'Numpad4' }, { key: 'Numpad5' }, { key: 'Numpad6' }, { key: 'NumpadAdd' }],
  [{ key: 'Numpad1' }, { key: 'Numpad2' }, { key: 'Numpad3' }, { key: 'NumpadEnter' }],
  [{ key: 'Numpad0', width: 4.75 }, { key: 'NumpadDecimal' }, { key: 'NumpadEnter' }]
]

// Map for short key labels (max 5 chars)
const keyShortLabels: Record<string, string> = {
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

// Helper to get short label or icon
const getShortLabel = (key: string): JSX.Element | string => {
  if (keyShortLabels[key]) return keyShortLabels[key]
  if (/^F\d{1,2}$/.test(key)) return key // F1-F12
  if (key.length > 5) return key.slice(0, 5)
  return key
}

// Utility to normalize key names from KeyboardEvent to our key names
const normalizeKey = (event: KeyboardEvent): string => {
  // Prefer location for Ctrl, Alt, Shift, Numpad
  if (event.code.startsWith('Numpad')) return event.code
  if (event.code === 'ShiftLeft') return 'ShiftLeft'
  if (event.code === 'ShiftRight') return 'ShiftRight'
  if (event.code === 'ControlLeft') return 'CtrlLeft'
  if (event.code === 'ControlRight') return 'CtrlRight'
  if (event.code === 'AltLeft') return 'AltLeft'
  if (event.code === 'AltRight') return 'AltRight'
  if (event.code === 'MetaLeft' || event.code === 'MetaRight') return 'Win'
  // Fallback for other keys
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

export const VisualKeyboard = ({ layer, maxLayer, onUpdate }: VisualKeyboardProps): JSX.Element => {
  const [pressedKeys, setPressedKeys] = useState<string[]>([])
  const [clickedKeys, setClickedKeys] = useState<string[]>([])

  // Track if Win key is pressed, and clear on blur (since OS may eat keyup)
  useEffect((): (() => void) => {
    const handleDown = (e: KeyboardEvent): void => {
      const norm = normalizeKey(e)
      setPressedKeys((prev: string[]) => (prev.includes(norm) ? prev : [...prev, norm]))
    }
    const handleUp = (e: KeyboardEvent): void => {
      const norm = normalizeKey(e)
      setPressedKeys((prev: string[]) => prev.filter((k) => k !== norm))
    }
    const handleBlur = (): void => {
      setPressedKeys((prev: string[]) => prev.filter((k) => k !== 'Win'))
    }
    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    window.addEventListener('blur', handleBlur)
    return (): void => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  const handleKeyClick = (key: string): void => {
    setClickedKeys((prev: string[]) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  // Helper to render a row of keys
  const renderRow = (
    row: { key: string; width?: number; gapAfter?: boolean }[],
    rowIdx: number
  ): JSX.Element => {
    return (
      <div key={rowIdx} className="flex flex-row mb-1" style={{ gap: '0.25rem' }}>
        {row.map(({ key, width, gapAfter }, idx) => (
          <span key={key || `empty-${idx}`} className="flex items-center">
            <button
              type="button"
              disabled={!key}
              className={`
              transition-all
              border
              rounded
              font-mono
              h-10
              ${key && key.length >= 4 ? 'text-xs' : key && key.length >= 2 ? 'text-sm' : ''}
              ${key && pressedKeys.includes(key) ? 'bg-blue-300 border-blue-600' : ''}
              ${key && clickedKeys.includes(key) ? 'bg-green-300 border-green-600' : ''}
              ${key && !pressedKeys.includes(key) && !clickedKeys.includes(key) ? 'bg-white border-gray-300' : ''}
              ${!key ? 'bg-transparent border-none cursor-default' : ''}
              `}
              style={{
                minWidth: `${width || 2.25}rem`
              }}
              onClick={key ? (): void => handleKeyClick(key) : undefined}
              tabIndex={key ? 0 : -1}
            >
              {key ? getShortLabel(key) : ''}
            </button>
            {gapAfter && (
              <span
                className="inline-block"
                style={{
                  minWidth: `${width || 0.25 + (2 * 2.25) / 3}rem`
                }}
              />
            )}
          </span>
        ))}
      </div>
    )
  }

  return (
    <Card className="p-4 bg-neutral-100 overflow-auto flex flex-row items-start">
      {/* Main keyboard */}
      <div className="flex flex-col">{mainRows.map(renderRow)}</div>
      {/* Specialty + Arrows */}
      <div className="flex flex-col">{specialtyRows.map(renderRow)}</div>
      {/* Numpad */}
      <div className="flex flex-col">{numpadRows.map(renderRow)}</div>
    </Card>
  )
}
