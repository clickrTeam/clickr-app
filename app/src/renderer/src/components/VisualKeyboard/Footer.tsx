import React, { useState } from 'react'
import { Bind, BindType, PressKey, ReleaseKey, TapKey } from '../../../../models/Bind'
import { keys } from '../../../../models/Keys'
import { KeyPressInfo } from './Model'
import { bindTypeColors } from './Colors'
import './Footer.css'
import { ProfileController } from './ProfileControler'
import { Trigger } from '../../../../models/Trigger'
import log from 'electron-log'

const typeOptions: { value: BindType | undefined; label: string }[] = [
  { value: undefined, label: 'X' },
  { value: BindType.TapKey, label: 'Tap' },
  { value: BindType.PressKey, label: 'Press' },
  { value: BindType.ReleaseKey, label: 'Release' }
]

function getMacroButtonBg(item: Bind): string {
  return `${bindTypeColors[item.bind_type as BindType]}80`
}


function getDropdownBg(item: Bind, opt: { value: BindType | undefined }): string | undefined {
  if (!opt.value) return ''
  return item.bind_type === opt.value ? `${bindTypeColors[opt.value]}22` : undefined
}

function getMacroValue(item: Bind): string {
  if ('value' in item) return (item as TapKey | PressKey | ReleaseKey).value
  return ''
}

export interface VisualKeyboardFooterProps {
  profileControler: ProfileController
  selectedKey: string | null
  macro: Bind[]
  trigger: Trigger | null
  onMacroChange: (macro: Bind[]) => void
  onClose: (save: boolean) => void
}

export const VisualKeyboardFooter: React.FC<VisualKeyboardFooterProps> = ({
  profileControler,
  selectedKey,
  macro,
  trigger,
  onMacroChange,
  onClose
}): JSX.Element | null => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [showKeySelector, setShowKeySelector] = useState(false)
  if (!selectedKey) return null
  if (!trigger) {
    log.warn('No trigger provided to VisualKeyboardFooter. Aborting.');
    return null
  }

  function handleTypeChange(idx: number, type: BindType | undefined): void {
    if (type === undefined) {
      // If type is undefined, we can remove the macro item
      const newMacro = macro.filter((_, i) => i !== idx)
      onMacroChange(newMacro)
      setOpenDropdown(null)
      return
    }

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

  function handleAddKeyToMacro(key: KeyPressInfo): void {
    console.log('Adding key to macro:', key)
    if (key.isDown) {
      onMacroChange([...macro, new PressKey(key.key)])
    } else {
      if (macro[macro.length - 1] instanceof PressKey) {
        var macros = [...macro]
        macros[macros.length - 1] = new TapKey(key.key)
        onMacroChange(macros)
      } else {
        onMacroChange([...macro, new ReleaseKey(key.key)])
      }
    }
    setShowKeySelector(false)
  }

  return (
    <div className="vk-footer">
      <div className="vk-footer-row">
        <span className="vk-footer-selected-label">Selected Key:</span>
        <span className="vk-footer-selected-key">{selectedKey}</span>
        <button className="vk-footer-clear" onClick={() => profileControler.removeBind(trigger, onMacroChange)}>Clear</button>
      </div>
      <div className="vk-footer-row">
        <span className="vk-footer-macro-label">New Mapping:</span>
        {macro.length === 0 ? (
          <span className="vk-footer-macro-empty">(Tap keys to add to macro)</span>
        ) : (
          macro.map((item, i) => (
            <span key={i} style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className={`vk-footer-macro-btn relative z-10`}
                style={{
                  background: getMacroButtonBg(item),
                  position: 'relative'
                }}
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
                  onClick={() => handleAddKeyToMacro({ key, isDown: true })}
                >
                  {key}
                </button>
              ))}
            </div>
          )}
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
    </div>
  )
}
