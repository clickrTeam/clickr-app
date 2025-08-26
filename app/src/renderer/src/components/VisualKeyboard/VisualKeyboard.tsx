import { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { Layer } from '../../../../models/Layer'
import { mainRows, specialtyRows, numpadRows } from './Layout.const'
import { normalizeKey } from './Util'
import { InspectPopover } from './InspectPopover'
import { VisualKeyboardFooter } from './Footer'
import { Bind, Macro_Bind, TapKey } from '../../../../models/Bind'
import { KeyTile } from './KeyTile'
import { buildVisualKeyboardModel, KeyTileModel, VisualKeyboardModel } from './Model'
import * as T from '../../../../models/Trigger'

interface VisualKeyboardProps {
  layer: Layer
}

export const VisualKeyboard = ({ layer }: VisualKeyboardProps): JSX.Element => {
  const [pressedKeys, setPressedKeys] = useState<string[]>([])
  const [inspectedKey, setInspectedKey] = useState<KeyTileModel | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [bind, setBind] = useState<Bind[]>([])
  const [trigger, setTrigger] = useState<T.Trigger | null>(null)

  useEffect((): (() => void) => {
    function handleKeyDown(e: KeyboardEvent): void {
      const norm = normalizeKey(e)
      e.preventDefault()
      e.stopPropagation()
      setPressedKeys((prev: string[]) => (prev.includes(norm) ? prev : [...prev, norm]))
      if (selectedKey) setBind((prev) => [...prev, new TapKey(norm)])
    }
    function handleKeyUp(e: KeyboardEvent): void {
      const norm = normalizeKey(e)
      setPressedKeys((prev: string[]) => prev.filter((k) => k !== norm))
    }
    function handleBlur(): void {
      setPressedKeys((prev: string[]) => prev.filter((k) => k !== 'Win'))
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return (): void => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [selectedKey])

  const allKeys = [...mainRows.flat(), ...specialtyRows.flat(), ...numpadRows.flat()]
  const visualKeyboardModel: VisualKeyboardModel = buildVisualKeyboardModel(
    allKeys,
    layer.remappings,
    pressedKeys,
    selectedKey
  )

  const handleContextMenu =
    (key: KeyTileModel) =>
    (e: React.MouseEvent): void => {
      e.preventDefault()
      e.stopPropagation()
      setInspectedKey(key)
    }

  const handleCloseInspect = (): void => setInspectedKey(null)

  const handleKeyClick = (key: string): void => {
    if (selectedKey === key) {
      setSelectedKey(null)
      setTrigger(null)
    } else {
      setSelectedKey(key)
      setTrigger(new T.KeyPress(key))
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
              onContextMenu={handleContextMenu(keyModel)}
            />
          )
        })}
      </div>
    )
  }

  const renderInspectPopover = (): JSX.Element | null => {
    if (!inspectedKey) return null
    console.log('renderInspectPopover', inspectedKey)
    return <InspectPopover inspectedKey={inspectedKey} onClose={handleCloseInspect} />
  }

  const renderFooter = (): JSX.Element | null => {
    return (
      <VisualKeyboardFooter
        selectedKey={selectedKey}
        macro={bind}
        onMacroChange={setBind}
        onClose={() => {
          if (trigger) {
            layer.addRemapping(trigger, new Macro_Bind(bind))
            setTrigger(null)
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
