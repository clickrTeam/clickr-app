// Editor footer for VisualKeyboard
import React, { useState } from 'react'
import { Bind, BindType, PressKey, ReleaseKey, TapKey } from '../../../../models/Bind'
import { bindTypeColors } from './Colors'
import './Footer.css'

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
    if (
      existing instanceof TapKey ||
      existing instanceof PressKey ||
      existing instanceof ReleaseKey
    ) {
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
    <div className="vk-footer">
      <div className="vk-footer-row">
        <span className="vk-footer-selected-label">Selected Key:</span>
        <span className="vk-footer-selected-key">{selectedKey}</span>
        <button className="vk-footer-close" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="vk-footer-row">
        <span className="vk-footer-macro-label">Macro:</span>
        {macro.length === 0 ? (
          <span className="vk-footer-macro-empty">(Tap keys to add to macro)</span>
        ) : (
          macro.map((item, i) => (
            <span key={i} style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className="vk-footer-macro-btn"
                style={{
                  background: `${bindTypeColors[item.bind_type as BindType]}80`
                }}
                onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
                tabIndex={0}
              >
                {'value' in item ? (item as TapKey | PressKey | ReleaseKey).value : ''}
              </button>
              {openDropdown === i && (
                <div className="vk-footer-macro-dropdown">
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      className={`vk-footer-macro-dropdown-btn${item.bind_type === opt.value ? ' selected' : ''}`}
                      style={{
                        background:
                          item.bind_type === opt.value
                            ? `${bindTypeColors[opt.value]}22`
                            : undefined
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
