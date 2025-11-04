import React, { useEffect, useMemo, useState } from 'react'
import { Bind, BindType, PressKey, ReleaseKey, TapKey } from '../../../../models/Bind'
import { KeyPressInfo } from './Model'
import { bindTypeColors, triggerTypeColors } from './Colors'
import './Footer.css'
import { ProfileController } from './ProfileControler'
import { AppFocus, getTriggerDisplayName, Hold, KeyPress, KeyRelease, TapSequence, Trigger, TriggerType } from '../../../../models/Trigger'
import { Layer } from '../../../../models/Layer'
import { SwapLayer } from '../../../../models/Bind'
import { KeyModal } from './KeyModal'
import log from 'electron-log'

const typeOptions: { value: BindType; label: string }[] = [
  { value: BindType.TapKey, label: 'Tap' },
  { value: BindType.PressKey, label: 'Press' },
  { value: BindType.ReleaseKey, label: 'Release' }
]

const typeOptionsTrigger: TriggerType[] = [
  TriggerType.Hold,
  TriggerType.KeyPress,
  TriggerType.KeyRelease,
]

function getMacroButtonBg(item: Bind): string {
  return `${bindTypeColors[item.bind_type as BindType]}80`
}
function getMacroButtonBgT(item: Trigger): string {
  return `${triggerTypeColors[item.trigger_type as TriggerType]}80`
}

function getDropdownBg(item: Bind, opt: { value: BindType | undefined }): string | undefined {
  if (!opt.value) return ''
  return item.bind_type === opt.value ? `${bindTypeColors[opt.value]}22` : undefined
}

function getDropdownBgT(
  item: Trigger,
  opt: TriggerType
): string | undefined {
  if (!opt) return ''
  return item.trigger_type === opt ? `${triggerTypeColors[opt]}22` : undefined
}

function getMacroValue(item: Bind): string {
  if ('value' in item) {
    return (item as TapKey | PressKey | ReleaseKey).value
  } else if ('layer_number' in item) {
    return 'Swap to Layer ' + item.layer_number
  }
  log.warn(`Macro value not applicable to add ${item.bind_type}`)
  return ''
}

export interface VisualKeyboardFooterProps {
  profileControler: ProfileController
  selectedKey: string | null
  binds: Bind[]
  onMacroChange: (binds: Bind[]) => void
  trigger: Trigger
  onTriggerChange: (trigger: Trigger) => void
  onClose: (save: boolean) => void
  activeLayer: Layer
}

export const VisualKeyboardFooter: React.FC<VisualKeyboardFooterProps> = ({
  profileControler,
  selectedKey,
  binds,
  trigger,
  onMacroChange,
  onTriggerChange,
  onClose
}): JSX.Element | null => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [openNewTriggerDropdown, setOpenNewTriggerDropdown] = useState<boolean>(false)
  const [openTriggerDropdown, setOpenTriggerDropdown] = useState<boolean>(false)
  const [showKeyModal, setShowKeyModal] = useState(false)
  if (!selectedKey) {
    if (openDropdown !== null) setOpenDropdown(null)
    if (openNewTriggerDropdown) setOpenNewTriggerDropdown(false)
    if (openTriggerDropdown) setOpenTriggerDropdown(false)
    return null
  }

  function handleTypeChange(idx: number, type: BindType | undefined): void {
    if (type === undefined) {
      // If type is undefined, we can remove the macro item
      const newMacro = binds.filter((_, i) => i !== idx)
      onMacroChange(newMacro)
      setOpenDropdown(null)
      return
    }

    const existing = binds[idx]
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
    const newMacro = binds.map((item, i) => (i === idx ? newBind : item))
    onMacroChange(newMacro)
    setOpenDropdown(null)
  }

  function handleTriggerTypeChange(type: TriggerType | undefined): void {
    if (type === undefined) {
      log.warn('Cannot remove trigger from VisualKeyboardFooter.')
      setOpenTriggerDropdown(false)
      return
    }

    if (selectedKey === null) {
      log.warn('No selected key to assign trigger to in VisualKeyboardFooter.')
      setOpenTriggerDropdown(false)
      return
    }
    switch (type) {
      case TriggerType.AppFocused:
        trigger = new AppFocus("test", selectedKey)
        break
      case TriggerType.Hold:
        trigger = new Hold(selectedKey, 100) // Default hold time 100ms
        break
      case TriggerType.KeyPress:
        trigger = new KeyPress(selectedKey)
        break
      case TriggerType.KeyRelease:
        trigger = new KeyRelease(selectedKey)
        break
      case TriggerType.TapSequence:
        trigger = new TapSequence([[selectedKey, 350]]) // Default 350ms between taps
        break
      default:
        log.warn(`Unsupported trigger type for VisualKeyboardFooter: ${type}`)
    }
    setOpenTriggerDropdown(false)
    onTriggerChange(trigger)
  }

  function handleAddLayerToMacro(layerIdx: number): void {
    const newMacro = [...binds, new SwapLayer(layerIdx)]
    onMacroChange(newMacro)
    setShowKeyModal(false)
  }

  function handleNewTriggerType(type: TriggerType | undefined): void {
    if (type === undefined) {
      log.warn('Cannot add undefined trigger type in VisualKeyboardFooter.')
      return
    }

    onMacroChange([])
    handleTriggerTypeChange(type)
  }

  const allKeyMappings = profileControler.getMappings(selectedKey)

  return (
    <div className="vk-footer">
      <div className="vk-footer-row">
        <span className="vk-footer-selected-label">Selected Key:</span>
        <div className="vk-footer-trigger-wrapper">
          <button
            className="vk-footer-selected-key z-10"
            style={{
              background: getMacroButtonBgT(trigger)
            }}
            onClick={() => setOpenTriggerDropdown(!openTriggerDropdown)}
            tabIndex={0}
          >
            {selectedKey}
          </button>
          {openTriggerDropdown && (
            <div className="vk-footer-macro-dropdown">
              {typeOptionsTrigger.map((type) => (
                <button
                  className={`vk-footer-macro-dropdown-btn${trigger.trigger_type === type ? ' selected' : ''}`}
                  style={{ background: getDropdownBgT(trigger, type) }}
                  onClick={() => handleTriggerTypeChange(type)}
                  disabled={type !== trigger.trigger_type && allKeyMappings.some(([mappingTrigger]) => mappingTrigger.trigger_type === type)}
                >
                  {getTriggerDisplayName(type)}
                </button>
              ))}
            </div>
          )}
        </div>
        {allKeyMappings && allKeyMappings.length > 1 && (
          <div className="vk-footer-mappings">
            {allKeyMappings.map((mapping) => (
              <button
                onClick={() => console.log('Swap to mapping', mapping)}
              >
                {mapping[0].trigger_type}
              </button>
            ))}
          </div>
        )}
        {allKeyMappings && allKeyMappings.length > 0 && (
          <div className="vk-footer-trigger-wrapper">
            <button
              onClick={() => setOpenNewTriggerDropdown(!openNewTriggerDropdown)}
            >
              Add
            </button>
            {openNewTriggerDropdown && (
              <div className="vk-footer-macro-dropdown">
                {typeOptionsTrigger.map((type) => (
                  <button
                    key={type}
                    className={`vk-footer-macro-dropdown-btn${trigger.trigger_type === type ? ' selected' : ''}`}
                    style={{ background: getDropdownBgT(trigger, type) }}
                    onClick={() => handleNewTriggerType(type)}
                    disabled={allKeyMappings.some(([mappingTrigger]) => mappingTrigger.trigger_type === type)}
                  >
                    {getTriggerDisplayName(type)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          className="vk-footer-clear"
          onClick={() => profileControler.removeBind(trigger, onMacroChange)}
        >
          Clear
        </button>
        <button className="vk-footer-close" onClick={() => onClose(true)}>
          Close
        </button>
      </div>

      <div className="vk-footer-row">
        <span className="vk-footer-macro-label">New Mapping:</span>
        {binds.length === 0 ? (
          <span className="vk-footer-macro-empty">(Tap keys to add to macro)</span>
        ) : (
          binds.map((item, i) => (
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className="vk-footer-macro-btn relative z-10"
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
              marginLeft: binds.length > 0 ? 8 : 0
            }}
            onClick={() => setShowKeyModal(true)}
          >
            +
          </button>
        </span>

        {showKeyModal && (
          <KeyModal
            onClose={() => setShowKeyModal(false)}
            onAddKey={
              (key: KeyPressInfo) => onMacroChange([...binds, new TapKey(key.key)])
            }
            onSelectLayer={handleAddLayerToMacro}
            profileControler={profileControler}
          />
        )}
      </div>
    </div>
  )
}
