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
    { key: 'Backspace', width: 2 }
  ],
  [
    { key: 'Tab', width: 1.5 },
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
    { key: '\\', width: 1.5 }
  ],
  [
    { key: 'CapsLock', width: 1.75 },
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
    { key: 'Enter', width: 2.25 }
  ],
  [
    { key: 'ShiftLeft', width: 2.25 },
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
    { key: 'ShiftRight', width: 2.75 }
  ],
  [
    { key: 'CtrlLeft', width: 1.25 },
    { key: 'Win', width: 1.25 },
    { key: 'AltLeft', width: 1.25 },
    { key: 'Space', width: 6.25 },
    { key: 'AltRight', width: 1.25 },
    { key: 'Fn', width: 1.25 },
    { key: 'Menu', width: 1.25 },
    { key: 'CtrlRight', width: 1.25 }
  ]
]

// Specialty keys above arrows (3x3 grid)
const specialtyRows: { key: string }[][] = [
  [{ key: 'PrintScreen' }, { key: 'ScrollLock' }, { key: 'Pause' }],
  [{ key: 'Insert' }, { key: 'Home' }, { key: 'PageUp' }],
  [{ key: 'Delete' }, { key: 'End' }, { key: 'PageDown' }]
]

// Arrow keys section (T-shaped)
const arrowRows: { key: string; width?: number }[][] = [
  [
    { key: '', width: 1 },
    { key: 'Up', width: 1 },
    { key: '', width: 1 }
  ],
  [
    { key: 'Left', width: 1 },
    { key: 'Down', width: 1 },
    { key: 'Right', width: 1 }
  ]
]

// Numpad section
const numpadRows: { key: string; width?: number }[][] = [
  [
    { key: 'NumLock' },
    { key: 'NumpadDivide' },
    { key: 'NumpadMultiply' },
    { key: 'NumpadSubtract' }
  ],
  [{ key: 'Numpad7' }, { key: 'Numpad8' }, { key: 'Numpad9' }, { key: 'NumpadAdd', width: 1 }],
  [{ key: 'Numpad4' }, { key: 'Numpad5' }, { key: 'Numpad6' }, { key: 'NumpadAdd', width: 1 }],
  [{ key: 'Numpad1' }, { key: 'Numpad2' }, { key: 'Numpad3' }, { key: 'NumpadEnter', width: 1 }],
  [{ key: 'Numpad0', width: 2 }, { key: 'NumpadDecimal' }, { key: 'NumpadEnter', width: 1 }]
]

// Utility to normalize key names from KeyboardEvent to our key names
const normalizeKey = (key: string) => {
  if (key === ' ') return 'Space'
  if (key === 'Control') return 'Ctrl'
  if (key === 'AltGraph') return 'AltRight'
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
  if (key.startsWith('NumPad')) return 'Numpad' + key.slice(6)
  return key.length === 1 ? key.toUpperCase() : key
}

export const VisualKeyboard = ({ layer, maxLayer, onUpdate }: VisualKeyboardProps): JSX.Element => {
  const [pressedKeys, setPressedKeys] = useState<string[]>([])
  const [clickedKeys, setClickedKeys] = useState<string[]>([])

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      const norm = normalizeKey(e.key)
      setPressedKeys((prev) => (prev.includes(norm) ? prev : [...prev, norm]))
    }
    const handleUp = (e: KeyboardEvent) => {
      const norm = normalizeKey(e.key)
      setPressedKeys((prev) => prev.filter((k) => k !== norm))
    }
    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
    }
  }, [])

  const handleKeyClick = (key: string) => {
    setClickedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  // Helper to render a row of keys
  const renderRow = (
    row: { key: string; width?: number; gapAfter?: boolean }[],
    rowIdx: number
  ) => (
    <div key={rowIdx} className="flex flex-row gap-1 mb-1">
      {row.map(({ key, width, gapAfter }, idx) => (
        <>
          <button
            key={key || `empty-${idx}`}
            type="button"
            disabled={!key}
            className={`
              transition-all
              border
              rounded
              text-xs
              font-mono
              h-10
              flex items-center justify-center
              select-none
              ${key && pressedKeys.includes(key) ? 'bg-blue-300 border-blue-600' : ''}
              ${key && clickedKeys.includes(key) ? 'bg-green-300 border-green-600' : ''}
              ${key && !pressedKeys.includes(key) && !clickedKeys.includes(key) ? 'bg-white border-gray-300' : ''}
              ${!key ? 'bg-transparent border-none cursor-default' : ''}
            `}
            style={{
              minWidth: `${(width || 1) * 2.5}rem`,
              maxWidth: `${(width || 1) * 2.5}rem`
            }}
            onClick={key ? () => handleKeyClick(key) : undefined}
            tabIndex={key ? 0 : -1}
          >
            {key}
          </button>
          {gapAfter && <span key={`gap-${idx}`} className="w-4 inline-block" />}
        </>
      ))}
    </div>
  )

  return (
    <Card className="p-4 bg-neutral-100 overflow-auto">
      <div className="flex flex-row gap-6 items-start">
        {/* Main keyboard */}
        <div>{mainRows.map(renderRow)}</div>
        {/* Specialty + Arrows */}
        <div className="flex flex-col gap-2 items-center">
          {/* Specialty 3x3 */}
          <div>{specialtyRows.map(renderRow)}</div>
          {/* Spacer */}
          <div style={{ height: '1.5rem' }} />
          {/* Arrows */}
          <div>{arrowRows.map(renderRow)}</div>
        </div>
        {/* Numpad */}
        <div>{numpadRows.map(renderRow)}</div>
      </div>
    </Card>
  )
}
