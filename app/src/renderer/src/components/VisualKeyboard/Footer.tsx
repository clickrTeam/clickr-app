import React, { useEffect, useState, useRef } from 'react'
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
  const [isClosing, setIsClosing] = useState(false)
  const [justAddedIndex, setJustAddedIndex] = useState<number | null>(null)
  const prevBindsLength = useRef<number>(currentBinds.binds.length)

  useEffect(() => {
    setCurrentKeyMappings(profileController.getMappings(selectedKey))
  }, [profileController, selectedKey, currentBinds, currentTrigger])

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

  // detect when a new bind was added so we can animate it
  useEffect(() => {
    const prev = prevBindsLength.current
    const curr = currentBinds.binds.length
    if (curr > prev) {
      const idx = curr - 1
      setJustAddedIndex(idx)
      // clear after animations
      const t = setTimeout(() => setJustAddedIndex(null), 1000)
      return () => clearTimeout(t)
    }
    prevBindsLength.current = curr
    return
  }, [currentBinds])

  // handle closing animation then call parent's onClose
  function requestClose(save: boolean): void {
    setIsClosing(true)
    // match CSS duration
    setTimeout(() => onClose(save), 260)
  }

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
  <div>
    <div className={`vk-footer ${isClosing ? 'vk-footer-closing' : 'vk-footer-opening'}`}>
      <div className="vk-footer-row">
        <span className="vk-footer-selected-label">Selected Key:</span>
        <Dropdown
          options={typeOptionsTrigger}
          currentSelected={currentTrigger.trigger_type}
          allSelected={currentKeyMappings.map(([mappingTrigger]) => mappingTrigger.trigger_type)}
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
            key={`${currentKeyMappings.length}-add-new-trigger-dropdown`}
            options={typeOptionsTrigger}
            currentSelected={currentTrigger.trigger_type}
            allSelected={currentKeyMappings.map(([mappingTrigger]) => mappingTrigger.trigger_type)}
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
            requestClose(true)
          }}
        >
          Remove Mapping
        </button>
        <button className="vk-footer-close" onClick={() => requestClose(true)}>
          Close
        </button>
      </div>

      <div className="vk-footer-row">
        <span className="vk-footer-macro-label">New Mapping:</span>
        {currentBinds.binds.length === 0 ? (
          <span className="vk-footer-macro-empty">(Tap keys to add to macro)</span>
        ) : (
          <div className="flex">
            <div className="max-w-[60vw] gap-2 flex" style={{ height: '52px', paddingRight: '6px', alignItems: 'center', overflowX: 'auto' }}>
              {currentBinds.binds.map((item: Bind, i: number) => (
                <Dropdown
                  options={typeOptionsBind}
                  currentSelected={item?.bind_type}
                  handleSelection={(opt: BindType) => handleTypeChange(i, opt)}
                  getDropdownBg={getMacroButtonBg}
                  getDisplayName={getBindTypeDisplayName}
                  openBtnLabel={getBindDisplayName(item)}
                  openBtnBackground={getMacroButtonBg(item)}
                  id={`bind-dropdown-${i}`}
                  extraClass={i === justAddedIndex ? 'vk-bind-just-added vk-wiggle-hover' : ''}
                ></Dropdown>
              ))}
            </div>

            <button
              className="vk-footer-clear"
              onClick={() => profileController.clearBinds()}
              style={{ width: '100px', flex: 'none' }}
            >
              Clear Binds
            </button>
          </div>
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
      </div>
    </div>
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
  )
}
