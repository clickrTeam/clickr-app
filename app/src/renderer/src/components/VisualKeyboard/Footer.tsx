// Editor footer for VisualKeyboard
import React, { useState } from 'react'
import { Bind, BindType, PressKey, ReleaseKey, TapKey } from '../../../../models/Bind'

const bindTypeColors: Record<BindType, string> = {
  [BindType.PressKey]: '#60a5fa',
  [BindType.ReleaseKey]: '#f87171',
  [BindType.TapKey]: '#34d399',
  [BindType.SwitchLayer]: '#fbbf24',
  [BindType.Macro]: '#a78bfa',
  [BindType.TimedMacro]: '#f472b6',
  [BindType.Repeat]: '#fb7185',
  [BindType.AppOpen]: '#facc15'
}

export interface VisualKeyboardFooterProps {
  selectedKey: string | null
  macro: Bind[]
  onMacroChange: (macro: Bind[]) => void
  onClose: () => void
}

const typeOptions: { value: BindType; label: string }[] = [
  { value: BindType.TapKey, label: 'Tap' },
  { value: BindType.PressKey, label: 'Press' },
  { value: BindType.ReleaseKey, label: 'Release' }
]

export const VisualKeyboardFooter: React.FC<VisualKeyboardFooterProps> = ({
  selectedKey,
  macro,
  onMacroChange,
  onClose
}): JSX.Element | null => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  if (!selectedKey) return null

  // Handler to change type of a macro item
  const handleTypeChange = (idx: number, type: BindType): void => {
    const existing = macro[idx]
    let value: string
    if (existing instanceof TapKey || existing instanceof PressKey || existing instanceof ReleaseKey) {
      value = existing.value
    } else {
      throw new Error('Macro bind is not a TapKey, PressKey, or ReleaseKey. Cannot change type.')
    }
    let newBind: Bind
    if (type === BindType.TapKey) {
      newBind = new TapKey(value)
    } else if (type === BindType.PressKey) {
      newBind = new PressKey(value)
    } else if (type === BindType.ReleaseKey) {
      newBind = new ReleaseKey(value)
    } else {
      throw new Error('Unsupported bind type for macro UI')
    }
    const newMacro = macro.map((item, i) => (i === idx ? newBind : item))
    onMacroChange(newMacro)
    setOpenDropdown(null)
  }

  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-gray-300 shadow-lg p-4 flex flex-col items-center animate-fade-in">
      <div className="flex items-center gap-4 mb-2">
        <span className="font-bold text-blue-700">Selected Key:</span>
        <span className="bg-blue-100 px-3 py-1 rounded text-blue-900 font-mono text-lg">
          {selectedKey}
        </span>
        <button className="ml-4 text-gray-500 hover:text-red-500" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">Macro:</span>
        {macro.length === 0 ? (
          <span className="text-gray-400">(Tap keys to add to macro)</span>
        ) : (
          macro.map((item, i) => (
            <span key={i} className="relative inline-block">
              <button
                className="px-2 py-1 rounded font-mono text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{
                  background: `${bindTypeColors[item.bind_type as BindType]}80` // 50% opacity
                }}
                onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
                tabIndex={0}
              >
                {'value' in item ? (item as TapKey | PressKey | ReleaseKey).value : ''}
              </button>
              {openDropdown === i && (
                <div
                  className="absolute left-0 bottom-full mb-1 w-24 bg-white border border-gray-300 rounded shadow-lg z-50"
                  style={{ minWidth: 80 }}
                >
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      className={`w-full text-left px-3 py-1 hover:bg-blue-100 ${item.bind_type === opt.value ? 'font-bold text-blue-700' : ''}`}
                      style={{
                        background:
                          item.bind_type === opt.value ? `${bindTypeColors[opt.value]}22` : undefined
                      }}
                      onClick={() => handleTypeChange(i, opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </span>
          ))
        )}
      </div>
    </div>
  )
}
