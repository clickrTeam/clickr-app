import React, { useState } from 'react'
import { Bind, BindType, PressKey, ReleaseKey, TapKey } from '../../../../models/Bind'
import { detectOS } from '../../../../models/Profile'
import { bindTypeColors } from './Colors'
import './Footer.css'

import {
  Letters,
  Digits,
  Modifier,
  Symbols,
  Navigation,
  Function,
  ShortcutAction,
  Numpad,
  Misc,
  os_keys
} from '../../../../models/Keys'

let current_OS = detectOS()

const keyGroups: Record<string, string[]> = {
  Letters: Object.values(Letters),
  Digits: Object.values(Digits),
  Modifier: Object.values(Modifier),
  Symbols: Object.values(Symbols),
  Navigation: Object.values(Navigation),
  Function: Object.values(Function),
  Shortcuts: Object.values(ShortcutAction),
  Numpad: Object.values(Numpad),
  Misc: Object.values(Misc),
  [current_OS + ' Keys']: Object.values(os_keys)
}


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
  onClose: (save: boolean) => void
}

export const VisualKeyboardFooter: React.FC<VisualKeyboardFooterProps> = ({
  selectedKey,
  macro,
  onMacroChange,
  onClose
}): JSX.Element | null => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [showKeyModal, setShowKeyModal] = useState(false)
const [activeCategory, setActiveCategory] = useState<string | null>(null)
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
  onClick={() => setShowKeyModal(true)}
>
  +
</button>

        </span>
      </div>
      <div className="vk-footer-row">
        <button className="vk-footer-close" onClick={() => onClose(true)}>
          Save
        </button>
        <button
          className="vk-footer-close"
          onClick={() => onClose(false)}
          style={{ marginLeft: 'auto' }}
        >
          Close
        </button>
      </div>
      {showKeyModal && (
  <div className="vk-key-modal">
    <div className="vk-key-modal-overlay" onClick={() => setShowKeyModal(false)} />
    <div className="vk-key-modal-content">
      <h3>Select Key Category</h3>
      <div className="vk-key-modal-categories">
        {Object.keys(keyGroups).map((cat) => (
          <button
            key={cat}
            className={`vk-key-modal-category-btn${activeCategory === cat ? ' active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {activeCategory && (
        <div className="vk-key-modal-dropdown">
          {keyGroups[activeCategory].map((key) => (
            <button
              key={key}
              className="vk-footer-macro-dropdown-btn"
              onClick={() => {
                handleAddKeyToMacro(key)
                setShowKeyModal(false)
                setActiveCategory(null)
              }}
            >
              {key}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
)}
    </div>
  )
}
