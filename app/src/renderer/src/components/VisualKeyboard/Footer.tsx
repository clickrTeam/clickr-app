import React, { useEffect, useMemo, useState } from 'react'
import { Bind, BindType, getBindDisplayName, getBindTypeDisplayName, Macro_Bind, PressKey, ReleaseKey, TapKey } from '../../../../models/Bind'
import { KeyPressInfo } from './Model'
import { bindTypeColors, triggerTypeColors } from './Colors'
import './Footer.css'
import { AppFocus, createTrigger, getTriggerTypeDisplayName, Hold, KeyPress, KeyRelease, TapSequence, Trigger, TriggerType } from '../../../../models/Trigger'
import { Layer } from '../../../../models/Layer'
import { SwapLayer } from '../../../../models/Bind'
import { KeyModal } from './KeyModal'
import log from 'electron-log'
import Dropdown from './dropdown'
import profileController from './ProfileControler'

const typeOptionsBind: BindType[] = [
  BindType.TapKey,
  BindType.PressKey,
  BindType.ReleaseKey,
  BindType.Meta_Destroy,
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
  selectedKey: string | null
  onClose: (save: boolean) => void
}

export const VisualKeyboardFooter: React.FC<VisualKeyboardFooterProps> = ({
  selectedKey,
  onClose
}): JSX.Element | null => {
  if (!selectedKey) return null

  const [showKeyModal, setShowKeyModal] = useState(false)
  const [currentBinds, setCurrentBinds] = useState<Macro_Bind>(profileController.currentBinds)
  const [currentTrigger, setCurrentTrigger] = useState<Trigger>(profileController.currentTrigger)
  const [currentKeyMappings, setCurrentKeyMappings] = useState<[Trigger, Bind][]>(profileController.getMappings(selectedKey))

  useEffect(() => {
    setCurrentKeyMappings(profileController.getMappings(selectedKey))
  }, [profileController, selectedKey])

  useEffect(() => {
    const cleanup = profileController.addStateChangeListener((binds, trigger) => {
      log.silly('Footer received state update:', { bindsCount: binds.binds.length, triggerType: trigger?.trigger_type })
      setCurrentBinds(binds)
      setCurrentTrigger(trigger)
    })
    return () => {
      log.silly('Footer unsubscribing from controller state changes')
      cleanup()
    }
  }, [profileController])

  function handleTypeChange(idx: number, type: BindType | undefined): void {
    if (type === undefined) {
      // If type is undefined, we can remove the macro item
      const newMacro = currentBinds.binds.filter((_, i: number) => i !== idx)
      profileController.currentBinds = new Macro_Bind(newMacro)
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
    } else if (type === BindType.Meta_Destroy) {
      currentBinds.binds.splice(idx, 1)
      profileController.currentBinds = new Macro_Bind(currentBinds.binds)
      return
    } else {
      throw new Error('Unsupported bind type for macro UI')
    }
    const newMacro = currentBinds.binds.map((item: Bind, i: number) => (i === idx ? newBind : item))
    profileController.currentBinds = new Macro_Bind(newMacro)
  }

  function handleTriggerTypeChange(type: TriggerType | undefined): void {
    if (type === undefined) {
      log.warn('Cannot remove trigger from VisualKeyboardFooter.')
      return
    }
    const newTrigger = createTrigger(type, selectedKey)
    if (newTrigger) {
      profileController.changeTrigger(newTrigger)
    } else {
      log.warn('Failed to change to a new trigger in VisualKeyboardFooter.')
    }
  }

  function handleAddTriggerType(type: TriggerType): void {
    profileController.currentBinds = new Macro_Bind([])
    const newTrigger = createTrigger(type, selectedKey)
    if (newTrigger) {
      profileController.currentTrigger = newTrigger
    } else {
      log.warn('Failed to create new trigger in VisualKeyboardFooter.')
    }
  }

  function handleAddLayerToMacro(layerIdx: number): void {
    const newMacro = [...currentBinds.binds, new SwapLayer(layerIdx)]
    profileController.currentBinds = new Macro_Bind(newMacro)
    setShowKeyModal(false)
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
          allSelected={currentKeyMappings.map(([mappingTrigger]) => mappingTrigger)}
          openBtnLabel={selectedKey}
          openBtnBackground={getMacroButtonBgT(currentTrigger)}
          id="trigger-dropdown"
        ></Dropdown>
        {currentKeyMappings.length > 1 && (
          <div className="vk-footer-mappings">
            {currentKeyMappings.filter((mapping) => mapping[0].trigger_type !== currentTrigger.trigger_type).map((mapping) => (
              <button
                className="vk-footer-macro-btn relative z-10"
                style={{ background: '20% transparent' }}
                key={mapping[0].trigger_type}
                onClick={() => profileController.swapToMapping(mapping)}
              >
                {getTriggerTypeDisplayName(mapping[0].trigger_type)}
              </button>
            ))}
          </div>
        )}
        {currentKeyMappings.length > 0 && currentTrigger && (
          <Dropdown
            options={typeOptionsTrigger}
            currentSelected={currentTrigger.trigger_type}
            handleSelection={handleAddTriggerType}
            getDropdownBg={getDropdownBgT}
            getDisplayName={getTriggerTypeDisplayName}
            allSelected={currentKeyMappings.map(([mappingTrigger]) => mappingTrigger)}
            id="new-trigger-dropdown"
          ></Dropdown>
        )}
        <button
          className="vk-footer-clear"
          onClick={() => {
            profileController.removeBind(currentTrigger);
            onClose(true);
          }}
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

        <button
          className="vk-footer-clear"
          onClick={() => profileController.clearBinds()}
        >
          Clear
        </button>

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
                profileController.currentBinds = new Macro_Bind(newBinds)
              }
            }
            onSelectLayer={handleAddLayerToMacro}
            profileController={profileController}
          />
        )}
      </div>
    </div>
  )
}
