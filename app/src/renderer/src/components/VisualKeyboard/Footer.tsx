import React, { useEffect, useState, useRef } from 'react'
import { Bind, BindType, getBindDisplayName, getBindTypeDisplayName, Macro, PressKey, ReleaseKey, RunScript, TapKey } from '../../../../models/Bind'
import { KeyPressInfo } from './Model'
import { getDropdownBgT, getMacroButtonBg, getMacroButtonBgT } from './Colors'
import './Footer.css'
import { AppFocus, createTrigger, getTriggerTypeDisplayName, Hold, TapSequence, Trigger, TriggerType } from '../../../../models/Trigger'
import { SwapLayer } from '../../../../models/Bind'
import { KeyModal } from './KeyModal'
import log from 'electron-log'
import Dropdown from './dropdown'
import profileController from './ProfileControler'
import { Input } from '../ui/input'

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

enum keyModalType {
  Binds,
  Trigger_TapSequence,
  Closed,
}

export const VisualKeyboardFooter: React.FC<VisualKeyboardFooterProps> = ({
  selectedKey,
  onClose
}): JSX.Element | null => {
  const [showKeyModal, setShowKeyModal] = useState(keyModalType.Closed)
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

    if (type === BindType.Meta_Destroy) {
      currentBinds.binds.splice(idx, 1)
      profileController.currentBinds = new Macro(currentBinds.binds)
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
    setShowKeyModal(keyModalType.Closed)
  }

  function handleAddRunScript(interpreter: string, script: string): void {
    const newMacro = [...currentBinds.binds, new RunScript(interpreter, script)]
    profileController.currentBinds = new Macro(newMacro)
    setShowKeyModal(keyModalType.Closed)
  }

  return (
  <div>
    <div className={`vk-footer ${isClosing ? 'vk-footer-closing' : 'vk-footer-opening'}`}>
      <div className="vk-footer-row" aria-label={`triggers ${currentTrigger.trigger_type}`}>
        {selectedKey ? (
          <div aria-label='keyed triggers' className='flex gap-4'>
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
            {currentTrigger.trigger_type === TriggerType.Hold && (
              <div aria-label='Hold'>
                <Input
                  type="number"
                  placeholder="Time (ms)"
                  min={0}
                  onChange={(e) => {
                    profileController.currentTrigger = new Hold((currentTrigger as Hold).value, parseInt(e.target.value))
                    e.stopPropagation()
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div aria-label='keyless triggers'>
            {currentTrigger.trigger_type === TriggerType.TapSequence && (
              <div aria-label='TapSequence' className='flex gap-4'>
                { (currentTrigger as TapSequence).key_time_pairs.map((key_time_pair) =>
                  <div>
                    <div
                      className={`vk-footer-macro-btn relative z-10`}
                    >
                      {key_time_pair[0]}
                    </div>
                  </div>
                )}

                <button
                  className="vk-footer-macro-btn"
                  style={{
                    fontWeight: 'bold',
                    fontSize: 18,
                    padding: '0 0.7rem',
                    marginLeft: currentBinds.binds.length > 0 ? 8 : 0
                  }}
                  onClick={() => setShowKeyModal(keyModalType.Trigger_TapSequence)}
                >
                  +
                </button>
              </div>
            )}
            {currentTrigger.trigger_type === TriggerType.AppFocused && (
              <div aria-label='AppFocused' className='flex'>
                <span className="vk-footer-selected-label" title='When this application is focused, or tab is selected.' style={{ minWidth: '112px' }}>On app focus:</span>
                <Input placeholder={(currentTrigger as AppFocus).app_name} onChange={(e) => {
                  profileController.currentTrigger = new AppFocus(e.target.value, (currentTrigger as AppFocus).id)
                  e.stopPropagation()
                }} />
              </div>
            )}
          </div>
        )}
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

      <div className="vk-footer-row" aria-label='binds'>
        <span className="vk-footer-macro-label">New Mapping:</span>
        {currentBinds.binds.length === 0 ? (
          <span className="vk-footer-macro-empty">(Tap keys to add to macro)</span>
        ) : (
          <div className="flex">
            <div className="max-w-[60vw] gap-2 flex" style={{ height: '52px', paddingRight: '6px', alignItems: 'center', overflowX: 'auto' }}>
              {currentBinds.binds.map((item: Bind, i: number) => (
                item.bind_type === BindType.RunScript ? (
                  <Dropdown
                    options={[BindType.Meta_Destroy]}
                    currentSelected={'None'}
                    handleSelection={(opt: BindType) => handleTypeChange(i, opt)}
                    getDropdownBg={getMacroButtonBg}
                    getDisplayName={getBindTypeDisplayName}
                    openBtnLabel={getBindDisplayName(item)}
                    openBtnBackground={getMacroButtonBg(item)}
                    id={`bind-dropdown-${i}`}
                    extraClass={i === justAddedIndex ? 'vk-bind-just-added vk-wiggle-hover' : ''}
                  />
                ) : (
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
                  />
                )
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
            onClick={() => setShowKeyModal(keyModalType.Binds)}
          >
            +
          </button>
        </span>
      </div>
    </div>
    {showKeyModal !== keyModalType.Closed && (
      <KeyModal
        onClose={() => setShowKeyModal(keyModalType.Closed)}
        onAddKey={
          (key: KeyPressInfo) => {
            if (showKeyModal === keyModalType.Binds) {
              const newBinds = [...currentBinds.binds, new TapKey(key.key)]
              profileController.currentBinds = new Macro(newBinds)
            } else if (showKeyModal === keyModalType.Trigger_TapSequence) {
              const newSequence: [string, number][] = [...(currentTrigger as TapSequence).key_time_pairs, [key.key, 350]]
              profileController.currentTrigger = new TapSequence(newSequence, (currentTrigger as TapSequence).behavior)
            } else {
              log.error('Footers keymodal is trying to add a key without a proper type')
            }
          }
        }
        keyOnly={showKeyModal === keyModalType.Trigger_TapSequence}
        onSelectLayer={handleAddLayerToMacro}
        onAddRunScriptBind={handleAddRunScript}
        profileController={profileController}
      />
    )}
  </div>
  )
}
