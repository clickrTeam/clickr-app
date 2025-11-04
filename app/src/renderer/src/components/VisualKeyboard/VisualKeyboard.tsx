import { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { mainRows, specialtyRows, numpadRows, KEYBOARD_100 as KEYBOARD_100 } from './Layout.const'
import { InspectPopover } from './InspectPopover'
import { VisualKeyboardFooter } from './Footer'
import { Bind, PressKey, ReleaseKey, TapKey } from '../../../../models/Bind'
import { KeyTile } from './KeyTile'
import * as T from '../../../../models/Trigger'
import { buildVisualKeyboardModel, KeyPressInfo, KeyTileModel, VisualKeyboardModel } from './Model'
import { Trigger } from '../../../../models/Trigger'
import { useKeyboardController } from './controler'
import { ProfileController } from './ProfileControler'
import { ChevronDown } from 'lucide-react'
import log from 'electron-log'

interface VisualKeyboardProps {
  profileControler: ProfileController
}

export const VisualKeyboard = ({ profileControler }: VisualKeyboardProps): JSX.Element => {
  const [inspectedKey, setInspectedKey] = useState<KeyTileModel | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const onKey: KeyPressInfo = useKeyboardController()
  const [keyQueue, setKeyQueue] = useState<KeyPressInfo[]>([])

  // Example of using the state change callback
  useEffect(() => {
    const removeListener = profileControler.addStateChangeListener((binds, trigger) => {
      log.debug('Profile state updated:', { bindsCount: binds.length, hasTrigger: !!trigger });
    });
    return removeListener;
  }, [profileControler]);

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

    if (selectedKey) {
      if (currentKey.isDown) {
        profileControler.currentBinds = [...profileControler.currentBinds, new PressKey(currentKey.key)]
      } else {
        const newBinds = [...profileControler.currentBinds]

        if (
          newBinds.length !== 0 &&
          newBinds[newBinds.length - 1] instanceof PressKey &&
          (newBinds[newBinds.length - 1] as PressKey).value === currentKey.key
        ) {
          newBinds[newBinds.length - 1] = new TapKey(currentKey.key)
          profileControler.currentBinds = newBinds
        } else {
          profileControler.currentBinds = [...newBinds, new ReleaseKey(currentKey.key)]
        }
      }
    }

    setKeyQueue((prev) => prev.slice(1))
  }, [keyQueue, profileControler])

  useEffect(() => {
    profileControler.setSelectedKey(selectedKey)
  }, [selectedKey, profileControler])

  const [showPressedKeys, setShowPressedKeys] = useState<string[]>([])

  const visualKeyboardModel: VisualKeyboardModel = buildVisualKeyboardModel(
    KEYBOARD_100,
    profileControler,
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
        </div>
        {showLeftover && (
          <div className="flex flex-wrap mt-2" style={{ gap: '0.25rem' }}>
            {leftoverKeys.filter((keyModel) => keyModel[0] instanceof T.AppFocus).map((keyModel) => (
              <div>
                {(keyModel[0] as T.AppFocus).app_name}
              </div>
            ))}
            {leftoverKeys.filter((keyModel) => keyModel[0] instanceof T.KeyPress ||
                   keyModel[0] instanceof T.KeyRelease ||
                   keyModel[0] instanceof T.Hold).map((keyModel) => (
              <div>
                {(keyModel[0] as any).value}
              </div>
            ))}
            {leftoverKeys.filter((keyModel) => keyModel[0] instanceof T.TapSequence).map((keyModel) => (
              <div>
                {(keyModel[0] as T.TapSequence).key_time_pairs.map((pair) => pair[0]).join('+')}
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
    <Card
      className="p-4 bg-neutral-100 overflow-auto flex flex-row items-start"
      style={{ position: 'relative', width: 'fit-content', alignSelf: 'center' }}
    >
      {renderInspectPopover()}
      <div className="flex flex-col">{mainRows.map(renderRow)}</div>
      <div className="flex flex-col">{specialtyRows.map(renderRow)}</div>
      <div className="flex flex-col">{numpadRows.map(renderRow)}</div>

      <VisualKeyboardFooter
        profileControler={profileControler}
        selectedKey={selectedKey}
        onClose={(save: boolean) => {
          if (save) {
            profileControler.addBind(profileControler.currentTrigger, profileControler.currentBinds)
          }
          setSelectedKey(null)
          profileControler.currentTrigger = null
          profileControler.currentBinds = []
        }}
      />
    </Card>
    {renderLeftoverKeys()}
    </div>
  )
}
