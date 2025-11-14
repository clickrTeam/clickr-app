import { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { mainRows, specialtyRows, numpadRows, KEYBOARD_100 } from './Layout.const'
import { InspectPopover } from './InspectPopover'
import { VisualKeyboardFooter } from './Footer'
import { Macro, PressKey, ReleaseKey, TapKey } from '../../../../models/Bind'
import { KeyTile } from './KeyTile'
import * as T from '../../../../models/Trigger'
import { buildVisualKeyboardModel, KeyPressInfo, KeyTileModel, VisualKeyboardModel } from './Model'
import { useKeyboardController } from './controler'
import { TriggerRadialMenu } from './TriggerRadialMenu'
import { ChevronDown } from 'lucide-react'
import log from 'electron-log'
import profileController from './ProfileControler'
import { KeyModal } from './KeyModal'
import { getMacroButtonBgT } from './Colors'

export const VisualKeyboard = (): JSX.Element => {
  const [inspectedKey, setInspectedKey] = useState<KeyTileModel | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [isCreatingNewMapping, setIsCreatingNewMapping] = useState(false)
  const [showNewTriggerRadial, setShowNewTriggerRadial] = useState(false)
  const [showNewMappingKeyModal, setShowNewMappingKeyModal] = useState(false)

  const onKey: KeyPressInfo = useKeyboardController()
  const [keyQueue, setKeyQueue] = useState<KeyPressInfo[]>([])

  useEffect(() => {
    setKeyQueue((prev) => [...prev, onKey])
  }, [onKey])

  useEffect(() => {
    if (keyQueue.length === 0) return

    const currentKey = keyQueue[0]

    if (currentKey.key === '') {
      setShowPressedKeys([])
      setKeyQueue((prev) => prev.slice(1))
      return
    } else if (currentKey.isDown) {
      setShowPressedKeys((prev: string[]) =>
        prev.includes(currentKey.key) ? prev : [...prev, currentKey.key]
      )
    } else {
      setShowPressedKeys((prev: string[]) => prev.filter((k) => k !== currentKey.key))
    }

    if (selectedKey || isCreatingNewMapping) {
      const existingBinds = [...profileController.currentBinds.binds]
      if (currentKey.isDown) {
        profileController.currentBinds = new Macro([...existingBinds, new PressKey(currentKey.key)])
      } else {

        if (
          existingBinds.length !== 0 &&
          existingBinds[existingBinds.length - 1] instanceof PressKey &&
          (existingBinds[existingBinds.length - 1] as PressKey).value === currentKey.key
        ) {
          existingBinds[existingBinds.length - 1] = new TapKey(currentKey.key)
          profileController.currentBinds = new Macro(existingBinds)
        } else {
          profileController.currentBinds = new Macro([...existingBinds, new ReleaseKey(currentKey.key)])
        }
      }
    }

    setKeyQueue((prev) => prev.slice(1))
  }, [keyQueue, profileController])

  useEffect(() => {
    if (showNewMappingKeyModal) {
      return
    }
    profileController.setSelectedKey(selectedKey, profileController.radialSelectedTriggerType)
    log.debug("reseting radialSelectedTriggerType as used: ", profileController.radialSelectedTriggerType)
    profileController.radialSelectedTriggerType = T.TriggerType.KeyPress
  }, [selectedKey])

  const handleTriggerTypeSelected = (triggerType: T.TriggerType) => {
    log.debug('handleTriggerTypeSelected: ', triggerType)
    setShowNewTriggerRadial(false)
    profileController.clearMapping()
    profileController.radialSelectedTriggerType = triggerType
    switch (triggerType) {
      case T.TriggerType.KeyPress:
        setShowNewMappingKeyModal(true)
        return
      case T.TriggerType.KeyRelease:
        setShowNewMappingKeyModal(true)
        return
      case T.TriggerType.Hold:
        setShowNewMappingKeyModal(true)
        return
      case T.TriggerType.AppFocused:
        setIsCreatingNewMapping(true)
        setSelectedKey(null)
        profileController.currentTrigger = new T.AppFocus("App Name")
        return
      case T.TriggerType.TapSequence:
        setIsCreatingNewMapping(true)
        setSelectedKey(null)
        profileController.currentTrigger = new T.TapSequence([])
        return
      default:
        log.warn("handleTriggerTypeSelected: undefined radial output.")
        return
    }
  }

  const [showPressedKeys, setShowPressedKeys] = useState<string[]>([])

  const visualKeyboardModel: VisualKeyboardModel = buildVisualKeyboardModel(
    KEYBOARD_100,
    profileController,
    showPressedKeys,
    selectedKey
  )

  const renderRow = (row: { key: string; width?: number; gapAfter?: boolean }[]): JSX.Element => {
    return (
      <div className="flex flex-row mb-1" style={{ gap: '0.25rem' }}>
        {row.map(({ key }) => {
          const keyModel: KeyTileModel = visualKeyboardModel.keyModels[key]
          return (
            <KeyTile
              key={keyModel.key === '' ? undefined : keyModel.key}
              keyModel={keyModel}
              onClick={(): void => setSelectedKey(key)}
              onInspect={setInspectedKey}
            />
          )
        })}
      </div>
    )
  }

  const renderInspectPopover = (): JSX.Element | null => {
    if (!inspectedKey) return null
    return <InspectPopover inspectedKey={inspectedKey} onClose={() => setInspectedKey(null)} />
  }

  const [showLeftover, setShowLeftover] = useState(true)

  const renderLeftoverKeys = (): JSX.Element | null => {
    const leftoverKeys = visualKeyboardModel.unmapped

    return (
      <div className="flex flex-col mt-4 p-4" style={{ alignItems: 'center' }}>
        <div className="flex justify-center" style={{ width: '80%' }}>
          <button
            className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setShowLeftover((prev) => !prev)}
            aria-label={showLeftover ? 'Hide leftover keys' : 'Show leftover keys'}
            title={showLeftover ? 'Hide leftover keys' : 'Show leftover keys'}
          >
            <ChevronDown
              className={`h-4 w-4 transform transition-transform duration-150 ${showLeftover ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>
          <button
            className="p-1 bg-indigo-200 rounded-full hover:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ml-2"
            onClick={() => setShowNewTriggerRadial((prev) => !prev)}
            aria-label={'Add New Mapping'}
            title={'Add New Mapping'}
          >
            <span className="text-sm font-semibold text-indigo-700">+</span>
          </button>
        </div>
        {showLeftover && (
          <div className="flex flex-wrap mt-2" style={{ gap: '0.25rem' }}>
            {leftoverKeys.filter((keyModel) => keyModel[0].trigger_type === T.TriggerType.AppFocused).map((keyModel) => (
              <button
                aria-label={keyModel[0].trigger_type + ' leftover-item'}
                className='vk-footer-macro-btn'
                style={{ background: getMacroButtonBgT(keyModel[0]) }}
                onClick={(): void => {
                  profileController.clearMapping()
                  setSelectedKey(null)
                  setIsCreatingNewMapping(true)
                  profileController.currentTrigger = keyModel[0]
                  profileController.currentBinds = (keyModel[1] as Macro)
                }}
              >
                {(keyModel[0] as T.AppFocus).app_name}
              </button>
            ))}
            {leftoverKeys.filter((keyModel) => keyModel[0].trigger_type === T.TriggerType.TapSequence).map((keyModel) => (
              <button
                aria-label={keyModel[0].trigger_type + ' leftover-item'}
                className='vk-footer-macro-btn'
                style={{ background: getMacroButtonBgT(keyModel[0]) }}
                onClick={(): void => {
                  profileController.clearMapping()
                  setSelectedKey(null)
                  setIsCreatingNewMapping(true)
                  profileController.currentTrigger = keyModel[0]
                  profileController.currentBinds = (keyModel[1] as Macro)
                }}
              >
                {(keyModel[0] as T.TapSequence).key_time_pairs.map((pair) => pair[0]).join('+')}
              </button>
            ))}
            {leftoverKeys.filter((keyModel) => keyModel[0] instanceof T.KeyPress ||
                   keyModel[0] instanceof T.KeyRelease ||
                   keyModel[0] instanceof T.Hold).map((keyModel) => (
              <div aria-label={keyModel[0].trigger_type + ' leftover-item'} className='vk-footer-macro-btn'>
                {(keyModel[0] as any).value}
              </div>
            ))}
            {visualKeyboardModel.unmappedKeyModels.map((keyModel) => (
              <KeyTile
                keyModel={keyModel}
                onClick={(): void => setSelectedKey(keyModel.key)}
                onInspect={setInspectedKey}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      <TriggerRadialMenu
        isOpen={showNewTriggerRadial}
        onSelectTrigger={handleTriggerTypeSelected}
        onClose={() => setShowNewTriggerRadial(false)}
      />
      {showNewMappingKeyModal && (
        <KeyModal
          onClose={(as_cancel: boolean) => {
            setShowNewMappingKeyModal(false)
            if (as_cancel) {
              log.debug("reseting radialSelectedTriggerType as cancel")
              profileController.radialSelectedTriggerType = T.TriggerType.KeyPress
            }
          }}
          onAddKey={(key: KeyPressInfo) => { setSelectedKey(key.key) }}
          keyOnly={true}
          profileController={profileController}
        />
      )}
      <Card
        className="p-4 bg-neutral-100 overflow-auto flex flex-row items-start"
        style={{ position: 'relative', width: 'fit-content', alignSelf: 'center' }}
      >
        {renderInspectPopover()}
        <div className="flex flex-col">{mainRows.map(renderRow)}</div>
        <div className="flex flex-col">{specialtyRows.map(renderRow)}</div>
        <div className="flex flex-col">{numpadRows.map(renderRow)}</div>
      </Card>

      {(isCreatingNewMapping || selectedKey) && (
        <VisualKeyboardFooter
          selectedKey={selectedKey}
          onClose={(save: boolean) => {
            log.debug('Closing VisualKeyboard Footer')
            if (save) profileController.addBind()
            setSelectedKey(null)
            setIsCreatingNewMapping(false)
            profileController.currentTrigger = new T.KeyPress('UNDEFINED')
            profileController.currentBinds = new Macro([])
          }}
        />
      )}
      {renderLeftoverKeys()}
    </div>
  )
}
