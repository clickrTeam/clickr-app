import React, { useEffect, useMemo, useState } from 'react'
import { Bind, BindType, getBindDisplayName, getBindTypeDisplayName, Macro_Bind, PressKey, ReleaseKey, TapKey } from '../../../../models/Bind'
import { KeyPressInfo } from './Model'
import { bindTypeColors, triggerTypeColors } from './Colors'
import './Footer.css'
import { ProfileController } from './ProfileControler'
import { AppFocus, getTriggerTypeDisplayName, Hold, KeyPress, KeyRelease, TapSequence, Trigger, TriggerType } from '../../../../models/Trigger'
import { Layer } from '../../../../models/Layer'
import { SwapLayer } from '../../../../models/Bind'
import { KeyModal } from './KeyModal'
import log from 'electron-log'
import Dropdown from './dropdown'

const typeOptionsBind: BindType[] = [
  BindType.TapKey,
  BindType.PressKey,
  BindType.ReleaseKey,
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
): string {
  if (!opt) return ''
  return item.trigger_type === opt ? `${triggerTypeColors[opt]}22` : ''
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
  if (!selectedKey) return null

  const [showKeyModal, setShowKeyModal] = useState(false)
  const [currentBinds, setCurrentBinds] = useState<Macro_Bind>(profileControler.currentBinds)
  const [currentTrigger, setCurrentTrigger] = useState<Trigger>(profileControler.currentTrigger)

  useEffect(() => {
    const cleanup = profileControler.addStateChangeListener((binds, trigger) => {
      log.silly('Footer received state update:', { bindsCount: binds.binds.length, triggerType: trigger?.trigger_type })
      setCurrentBinds(binds)
      setCurrentTrigger(trigger)
    })
    return () => {
      log.silly('Footer unsubscribing from controller state changes')
      cleanup()
    }
  }, [profileControler])

  const allKeyMappings = profileControler.getMappings(selectedKey)

  function handleTypeChange(idx: number, type: BindType | undefined): void {
    if (type === undefined) {
      // If type is undefined, we can remove the macro item
      const newMacro = currentBinds.binds.filter((_, i: number) => i !== idx)
      profileControler.currentBinds = new Macro_Bind(newMacro)
      return
    }

    const existing = currentBinds.binds[idx]
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
    const newMacro = currentBinds.binds.map((item: Bind, i: number) => (i === idx ? newBind : item))
    profileControler.currentBinds = new Macro_Bind(newMacro)
  }

  function handleTriggerTypeChange(type: TriggerType | undefined): void {
    if (type === undefined) {
      log.warn('Cannot remove trigger from VisualKeyboardFooter.')
      return
    }

    let newTrigger: Trigger
    switch (type) {
      case TriggerType.AppFocused:
        newTrigger = new AppFocus("test", selectedKey ?? '')
        break
      case TriggerType.Hold:
        if (selectedKey === null) {
          log.warn('No selected key to assign trigger to in VisualKeyboardFooter.')
          return
        }
        newTrigger = new Hold(selectedKey, 100) // Default hold time 100ms
        break
      case TriggerType.KeyPress:
        if (selectedKey === null) {
          log.warn('No selected key to assign trigger to in VisualKeyboardFooter.')
          return
        }
        newTrigger = new KeyPress(selectedKey)
        break
      case TriggerType.KeyRelease:
        if (selectedKey === null) {
          log.warn('No selected key to assign trigger to in VisualKeyboardFooter.')
          return
        }
        newTrigger = new KeyRelease(selectedKey)
        break
      case TriggerType.TapSequence:
        if (selectedKey === null) {
          log.warn('No selected key to assign trigger to in VisualKeyboardFooter.')
          return
        }
        newTrigger = new TapSequence([[selectedKey, 350]]) // Default 350ms between taps
        break
      default:
        log.warn(`Unsupported trigger type for VisualKeyboardFooter: ${type}`)
        return
    }
    profileControler.changeTrigger(newTrigger)
  }

  function handleAddLayerToMacro(layerIdx: number): void {
    const newMacro = [...currentBinds.binds, new SwapLayer(layerIdx)]
    profileControler.setBinds(new Macro_Bind(newMacro))
    setShowKeyModal(false)
  }

  function handleNewTriggerType(type: TriggerType | undefined): void {
    if (type === undefined) {
      log.warn('Cannot add undefined trigger type in VisualKeyboardFooter.')
      return
    }

    // todo ADD mapping

    profileControler.setBinds(new Macro_Bind([]))
    handleTriggerTypeChange(type)
  }

  return (
    <div className="vk-footer">
      <div className="vk-footer-row">
        <span className="vk-footer-selected-label">Selected Key:</span>
        <Dropdown
          options={typeOptionsTrigger}
          currentSelected={currentTrigger.trigger_type}
          handleSelection={handleTriggerTypeChange}
          getDropdownBg={getDropdownBgT}
          getDisplayName={getTriggerTypeDisplayName}
          allSelected={allKeyMappings.map(([mappingTrigger]) => mappingTrigger)}
          openBtnLabel={selectedKey}
          openBtnBackground={getMacroButtonBgT(currentTrigger)}
          id="trigger-dropdown"
        ></Dropdown>
        {allKeyMappings.length > 1 && (
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
        {allKeyMappings.length > 0 && currentTrigger && (
          <Dropdown
            options={typeOptionsTrigger}
            currentSelected={currentTrigger.trigger_type}
            handleSelection={handleNewTriggerType}
            getDropdownBg={getDropdownBgT}
            getDisplayName={getTriggerTypeDisplayName}
            allSelected={allKeyMappings.map(([mappingTrigger]) => mappingTrigger)}
            id="new-trigger-dropdown"
          ></Dropdown>
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
        {currentBinds.binds.length === 0 ? (
          <span className="vk-footer-macro-empty">(Tap keys to add to macro)</span>
        ) : (
          currentBinds.binds.map((item: Bind, i: number) => (
            <Dropdown
              options={typeOptionsBind}
              currentSelected={item?.bind_type}
              handleSelection={(opt: BindType) => handleTypeChange(i, opt)}
              getDropdownBg={getMacroButtonBg}
              getDisplayName={getBindTypeDisplayName}
              openBtnLabel={getBindDisplayName(item)}
              openBtnBackground={getMacroButtonBg(item)}
              id={`bind-dropdown-${i}`}
            ></Dropdown>
          ))
        )}

        <span style={{ position: 'relative', display: 'inline-block' }}>
          <button
            className="vk-footer-macro-btn"
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              padding: '0 0.7rem',
              marginLeft: currentBinds.binds.length > 0 ? 8 : 0
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
                const newBinds = [...currentBinds.binds, new TapKey(key.key)]
                profileControler.setBinds(new Macro_Bind(newBinds))
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
