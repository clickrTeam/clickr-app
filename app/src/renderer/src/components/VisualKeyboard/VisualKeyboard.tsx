import { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { Layer } from '../../../../models/Layer'
import { mainRows, specialtyRows, numpadRows, KEYBOARD_100 as KEYBOARD_100 } from './Layout.const'
import { normalizeKey } from './Util'
import { InspectPopover } from './InspectPopover'
import { VisualKeyboardFooter } from './Footer'
import { Bind, Macro_Bind, PressKey, ReleaseKey, TapKey } from '../../../../models/Bind'
import { KeyTile } from './KeyTile'
import { buildVisualKeyboardModel, KeyPressInfo, KeyTileModel, VisualKeyboardModel } from './Model'
import { KeyPress, Trigger } from '../../../../models/Trigger'
import { useKeyboardController } from './controler'

interface VisualKeyboardProps {
  layer: Layer
  onSave: () => void
}

export const VisualKeyboard = ({ layer, onSave }: VisualKeyboardProps): JSX.Element => {
  const [inspectedKey, setInspectedKey] = useState<KeyTileModel | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [binds, setBind] = useState<Bind[]>([])
  const [trigger, setTrigger] = useState<Trigger[]>([])

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
  }, [keyQueue, selectedKey]);

  const [showPressedKeys, setShowPressedKeys] = useState<string[]>([])

  const visualKeyboardModel: VisualKeyboardModel = buildVisualKeyboardModel(
    KEYBOARD_100,
    layer.remappings,
    showPressedKeys,
    selectedKey
  )

  const handleKeyClick = (key: string): void => {
    if (!!selectedKey) {
      setSelectedKey(null)
      setTrigger([])
    } else {
      setSelectedKey(key)
      setTrigger([new KeyPress(key)])
    }
    setBind([])
  }

  const renderRow = (row: { key: string; width?: number; gapAfter?: boolean }[]): JSX.Element => {
    return (
      <div className="flex flex-row mb-1" style={{ gap: '0.25rem' }}>
        {row.map(({ key }) => {
          const keyModel: KeyTileModel = visualKeyboardModel.keyModels[key]
          return (
            <KeyTile
              key={keyModel.key === '' ? undefined : keyModel.key}
              keyModel={keyModel}
              onClick={(): void => {
                handleKeyClick(key)
              }}
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

  const renderFooter = (): JSX.Element | null => {
    return (
      <VisualKeyboardFooter
        selectedKey={selectedKey}
        macro={binds}
        onMacroChange={setBind}
        onClose={(save: boolean) => {
          if (save && trigger) {
            layer.addRemapping(trigger[0], new Macro_Bind(binds)) // TODO support multiple triggers
            setTrigger([])
            onSave()
          }
          setSelectedKey(null)
          setBind([])
        }}
      />
    )
  }

  return (
    <Card
      className="p-4 bg-neutral-100 overflow-auto flex flex-row items-start"
      style={{ position: 'relative' }}
    >
      {renderInspectPopover()}
      <div className="flex flex-col">{mainRows.map(renderRow)}</div>
      <div className="flex flex-col">{specialtyRows.map(renderRow)}</div>
      <div className="flex flex-col">{numpadRows.map(renderRow)}</div>
      {renderFooter()}
    </Card>
  )
}
