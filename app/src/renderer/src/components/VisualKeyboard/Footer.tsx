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
  onClose: (save: boolean) => void
}

export const VisualKeyboardFooter: React.FC<VisualKeyboardFooterProps> = ({
  profileControler,
  selectedKey,
  onClose
}): JSX.Element | null => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [openTriggerDropdown, setOpenTriggerDropdown] = useState<boolean>(false)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [currentBinds, setCurrentBinds] = useState<Bind[]>(profileControler.currentBinds)
  const [currentTrigger, setCurrentTrigger] = useState<Trigger | null>(profileControler.currentTrigger)

  // Subscribe to controller state changes
  useEffect(() => {
    log.debug('Footer subscribing to controller state changes')
    const cleanup = profileControler.addStateChangeListener((binds, trigger) => {
      log.debug('Footer received state update:', { bindsCount: binds.length, triggerType: trigger?.trigger_type })
      setCurrentBinds(binds)
      setCurrentTrigger(trigger)
    })
    return () => {
      log.debug('Footer unsubscribing from controller state changes')
      cleanup()
    }
  }, [profileControler])

  // Sync with initial state
  useEffect(() => {
    setCurrentBinds(profileControler.currentBinds)
    setCurrentTrigger(profileControler.currentTrigger)
  }, [profileControler])

  if (!selectedKey) return null

  function handleTypeChange(idx: number, type: BindType | undefined): void {
    if (type === undefined) {
      // If type is undefined, we can remove the macro item
      const newMacro = currentBinds.filter((_, i: number) => i !== idx)
      profileControler.currentBinds = newMacro
      setOpenDropdown(null)
      return
    }

    const existing = currentBinds[idx]
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
    const newMacro = currentBinds.map((item: Bind, i: number) => (i === idx ? newBind : item))
    profileControler.currentBinds = newMacro
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

    let newTrigger: Trigger
    switch (type) {
      case TriggerType.AppFocused:
        newTrigger = new AppFocus("test", selectedKey)
        break
      case TriggerType.Hold:
        newTrigger = new Hold(selectedKey, 100) // Default hold time 100ms
        break
      case TriggerType.KeyPress:
        newTrigger = new KeyPress(selectedKey)
        break
      case TriggerType.KeyRelease:
        newTrigger = new KeyRelease(selectedKey)
        break
      case TriggerType.TapSequence:
        newTrigger = new TapSequence([[selectedKey, 350]]) // Default 350ms between taps
        break
      default:
        log.warn(`Unsupported trigger type for VisualKeyboardFooter: ${type}`)
        return
    }
    setOpenTriggerDropdown(false)
    profileControler.setTrigger(newTrigger)
  }

  function handleAddLayerToMacro(layerIdx: number): void {
    const newMacro = [...currentBinds, new SwapLayer(layerIdx)]
    profileControler.setBinds(newMacro)
    setShowKeyModal(false)
  }

  function handleNewTriggerType(type: TriggerType | undefined): void {
    if (type === undefined) {
      log.warn('Cannot add undefined trigger type in VisualKeyboardFooter.')
      return
    }

    profileControler.setBinds([])
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
              background: currentTrigger ? getMacroButtonBgT(currentTrigger) : undefined
            }}
            onClick={() => setOpenTriggerDropdown(!openTriggerDropdown)}
            tabIndex={0}
          >
            {selectedKey}
          </button>
          {openTriggerDropdown && currentTrigger && (
            <div className="vk-footer-macro-dropdown">
              {typeOptionsTrigger.map((type) => (
                <button
                  key={type}
                  className={`vk-footer-macro-dropdown-btn${currentTrigger.trigger_type === type ? ' selected' : ''}`}
                  style={{ background: getDropdownBgT(currentTrigger, type) }}
                  onClick={() => handleTriggerTypeChange(type)}
                  disabled={type !== currentTrigger.trigger_type && allKeyMappings.some(([mappingTrigger]) => mappingTrigger.trigger_type === type)}
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
                key={mapping[0].trigger_type}
                onClick={() => console.log('Swap to mapping', mapping)}
              >
                {mapping[0].trigger_type}
              </button>
            ))}
          </div>
        )}
        {allKeyMappings && allKeyMappings.length > 0 && currentTrigger && (
          <div className="vk-footer-trigger-wrapper">
            <button
              onClick={() => setOpenTriggerDropdown(!openTriggerDropdown)}
            >
              Add
            </button>
            {openTriggerDropdown && (
              <div className="vk-footer-macro-dropdown">
                {typeOptionsTrigger.map((type) => (
                  <button
                    key={type}
                    className={`vk-footer-macro-dropdown-btn${currentTrigger.trigger_type === type ? ' selected' : ''}`}
                    style={{ background: getDropdownBgT(currentTrigger, type) }}
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
          onClick={() => currentTrigger && profileControler.removeBind(currentTrigger, (binds) => profileControler.setBinds(binds))}
        >
          Clear
        </button>
        <button className="vk-footer-close" onClick={() => onClose(true)}>
          Close
        </button>
      </div>

      <div className="vk-footer-row">
        <span className="vk-footer-macro-label">New Mapping:</span>
        {currentBinds.length === 0 ? (
          <span className="vk-footer-macro-empty">(Tap keys to add to macro)</span>
        ) : (
          currentBinds.map((item: Bind, i: number) => (
            <span key={i} style={{ position: 'relative', display: 'inline-block' }}>
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
              marginLeft: currentBinds.length > 0 ? 8 : 0
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
              (key: KeyPressInfo) => {
                const newBinds = [...currentBinds, new TapKey(key.key)]
                profileControler.setBinds(newBinds)
              }
            }
            onSelectLayer={handleAddLayerToMacro}
            profileControler={profileControler}
          />
        )}
      </div>
    </div>
  )
}
