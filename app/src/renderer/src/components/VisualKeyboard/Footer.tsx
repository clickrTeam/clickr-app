import React, { useEffect, useState } from 'react'
import { Bind, BindType, getBindDisplayName, getBindTypeDisplayName, Macro, PressKey, ReleaseKey, TapKey } from '../../../../models/Bind'
import { KeyPressInfo } from './Model'
import { getDropdownBgT, getMacroButtonBg, getMacroButtonBgT } from './Colors'
import './Footer.css'
import { createTrigger, getTriggerTypeDisplayName, Trigger, TriggerType } from '../../../../models/Trigger'
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
  const [currentBinds, setCurrentBinds] = useState<Macro>(profileController.currentBinds)
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
      const newMacro = currentBinds.binds.filter((_: any, i: number) => i !== idx)
      profileController.currentBinds = new Macro(newMacro)
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
      profileController.currentBinds = new Macro(currentBinds.binds)
      return
    } else {
      throw new Error('Unsupported bind type for macro UI')
    }
    const newMacro = currentBinds.binds.map((item: Bind, i: number) => (i === idx ? newBind : item))
    profileController.currentBinds = new Macro(newMacro)
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
    profileController.currentBinds = new Macro([])
    const newTrigger = createTrigger(type, selectedKey)
    if (newTrigger) {
      profileController.currentTrigger = newTrigger
    } else {
      log.warn('Failed to create new trigger in VisualKeyboardFooter.')
    }
  }

  function handleAddLayerToMacro(layerIdx: number): void {
    const newMacro = [...currentBinds.binds, new SwapLayer(layerIdx)]
    profileController.currentBinds = new Macro(newMacro)
    setShowKeyModal(false)
  }

  return (
    <div className="vk-footer">
      <div className="vk-footer-row">
        <span className="vk-footer-selected-label">Selected Key:</span>
        <Dropdown
          options={typeOptionsTrigger}
          currentSelected={currentTrigger.trigger_type}
          allSelected={currentKeyMappings.map(([mappingTrigger]) => mappingTrigger)}
          handleSelection={handleTriggerTypeChange}
          getDropdownBg={getDropdownBgT}
          getDisplayName={getTriggerTypeDisplayName}
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
            allSelected={currentKeyMappings.map(([mappingTrigger]) => mappingTrigger)}
            handleSelection={handleAddTriggerType}
            getDropdownBg={getDropdownBgT}
            getDisplayName={getTriggerTypeDisplayName}
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
          Remove Mapping
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
          Clear Binds
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
                profileController.currentBinds = new Macro(newBinds)
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
