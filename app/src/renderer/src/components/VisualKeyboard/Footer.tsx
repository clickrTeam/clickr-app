import React, { useState } from 'react'
import { Bind, BindType, PressKey, ReleaseKey, TapKey } from '../../../../models/Bind'
import { keys } from '../../../../models/Keys'
import { bindTypeColors } from './Colors'
import './Footer.css'

const typeOptions: { value: BindType; label: string }[] = [
  { value: BindType.TapKey, label: 'Tap' },
  { value: BindType.PressKey, label: 'Press' },
  { value: BindType.ReleaseKey, label: 'Release' }
]

function getMacroButtonBg(item: Bind): string {
  return `${bindTypeColors[item.bind_type as BindType]}80`
}

function getDropdownBg(item: Bind, opt: { value: BindType }): string | undefined {
  return item.bind_type === opt.value ? `${bindTypeColors[opt.value]}22` : undefined
}

function getMacroValue(item: Bind): string {
  if ('value' in item) return (item as TapKey | PressKey | ReleaseKey).value
  return ''
}

export interface VisualKeyboardFooterProps {
  selectedKey: string | null
  macro: Bind[]
  onMacroChange: (macro: Bind[]) => void
  onClose: () => void
}

export const VisualKeyboardFooter: React.FC<VisualKeyboardFooterProps> = ({
  selectedKey,
  macro,
  onMacroChange,
  onClose
}): JSX.Element | null => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [showKeySelector, setShowKeySelector] = useState(false)
  if (!selectedKey) return null

  function handleTypeChange(idx: number, type: BindType): void {
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

  function handleAddKeyToMacro(key: string): void {
    onMacroChange([...macro, new TapKey(key)])
    setShowKeySelector(false)
  }

  return (
    <div className="vk-footer">
      <div className="vk-footer-row">
        <span className="vk-footer-selected-label">Selected Key:</span>
        <span className="vk-footer-selected-key">{selectedKey}</span>
      </div>
      <div className="vk-footer-row">
        <span className="vk-footer-macro-label">New Mapping:</span>
        {macro.length === 0 ? (
          <span className="vk-footer-macro-empty">(Tap keys to add to macro)</span>
        ) : (
          macro.map((item, i) => (
            <span key={i} style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className="vk-footer-macro-btn"
                style={{ background: getMacroButtonBg(item) }}
                onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
                tabIndex={0}
              >
                {getMacroValue(item)}
              </button>
              {openDropdown === i && (
                <div className="vk-footer-macro-dropdown">
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      className={`vk-footer-macro-dropdown-btn${item.bind_type === opt.value ? ' selected' : ''}`}
                      style={{ background: getDropdownBg(item, opt) }}
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
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <button
            className="vk-footer-macro-btn"
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              padding: '0 0.7rem',
              marginLeft: macro.length > 0 ? 8 : 0
            }}
            onClick={() => setShowKeySelector((v) => !v)}
          >
            +
          </button>
          {showKeySelector && (
            <div
              className="vk-footer-macro-dropdown"
              style={{ left: 0, minWidth: 160, maxHeight: 200, overflowY: 'auto' }}
            >
              {keys.map((key) => (
                <button
                  key={key}
                  className="vk-footer-macro-dropdown-btn"
                  style={{ width: '100%' }}
                  onClick={() => handleAddKeyToMacro(key)}
                >
                  {key}
                </button>
              ))}
            </div>
          )}
        </span>
      </div>
      <div className="vk-footer-row">
        <button className="vk-footer-close" onClick={onClose}>
          Save
        </button>
        <button className="vk-footer-close" onClick={onClose} style={{ marginLeft: 'auto' }}>
          Close
        </button>
      </div>
    </div>
  )
}
