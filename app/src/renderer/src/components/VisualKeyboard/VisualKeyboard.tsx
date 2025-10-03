import { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { mainRows, specialtyRows, numpadRows, KEYBOARD_100 as KEYBOARD_100 } from './Layout.const'
import { InspectPopover } from './InspectPopover'
import { VisualKeyboardFooter } from './Footer'
import { Bind, PressKey, ReleaseKey, TapKey } from '../../../../models/Bind'
import { KeyTile } from './KeyTile'
import { buildVisualKeyboardModel, KeyPressInfo, KeyTileModel, VisualKeyboardModel } from './Model'
import { Trigger } from '../../../../models/Trigger'
import { useKeyboardController } from './controler'
import { ProfileController } from './ProfileControler'

interface VisualKeyboardProps {
  profileControler: ProfileController
}

export const VisualKeyboard = ({ profileControler }: VisualKeyboardProps): JSX.Element => {
  const [inspectedKey, setInspectedKey] = useState<KeyTileModel | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [binds, setBind] = useState<Bind[]>([])
  const [trigger, setTrigger] = useState<Trigger | null>(null)

  const onKey: KeyPressInfo = useKeyboardController();
  const [keyQueue, setKeyQueue] = useState<KeyPressInfo[]>([]);

  useEffect(() => {
    setKeyQueue(prev => [...prev, onKey]);
  }, [onKey]);

  useEffect(() => {
    if (keyQueue.length === 0) return;

    const currentKey = keyQueue[0];

    if (currentKey.key === '') {
      setShowPressedKeys([]);
      setKeyQueue(prev => prev.slice(1));
      return;
    } else if (currentKey.isDown) {
      setShowPressedKeys((prev: string[]) =>
        prev.includes(currentKey.key)
          ? prev
          : [...prev, currentKey.key]
      );
    } else {
      setShowPressedKeys((prev: string[]) =>
        prev.filter((k) => k !== currentKey.key)
      );
    }

    if (selectedKey) {
      if (currentKey.isDown) {
        setBind((prevBinds) => [...prevBinds, new PressKey(currentKey.key)]);
      } else {
        setBind((prevBinds) => {
          const newBinds = [...prevBinds];

          if (
            newBinds.length !== 0 &&
            newBinds[newBinds.length - 1] instanceof PressKey &&
            (newBinds[newBinds.length - 1] as PressKey).value === currentKey.key
          ) {
            newBinds[newBinds.length - 1] = new TapKey(currentKey.key);
            return newBinds;
          }

          return [...newBinds, new ReleaseKey(currentKey.key)];
        });
      }
    }

    setKeyQueue(prev => prev.slice(1));
  }, [keyQueue]);

  useEffect(() => {
    profileControler.setSelectedKey(selectedKey, setBind, setTrigger);
  }, [selectedKey]);

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

  return (
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
        macro={binds}
        trigger={trigger}
        onMacroChange={setBind}
        onClose={(save: boolean) => {
          if (save) {
            profileControler.addBind(trigger, binds);
          }
          setSelectedKey(null)
          setTrigger(null)
          setBind([])
        }}
      />
    </Card>
  )
}
