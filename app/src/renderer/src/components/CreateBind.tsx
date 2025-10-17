import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import {
  Bind,
  BindType,
  PressKey,
  ReleaseKey,
  TapKey,
  SwapLayer,
  Macro
} from '../../../models/Bind'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import KeySelecter from './KeySelector'
import { Button } from './ui/button'

interface BindSelectorProps {
  maxLayer: number
  onBindSelected: (bind: Bind) => void
}

export function BindSelector({ maxLayer, onBindSelected }: BindSelectorProps): JSX.Element {
  const [type, setType] = useState<BindType | null>(null)
  const [bindValue, setBindValue] = useState<string>('')
  const [macroBinds, setMacroBinds] = useState<(Bind | null)[]>([])

  const handleSingleKeyChange = (key: string): void => {
    setBindValue(key)

    if (
      !type ||
      (type !== BindType.PressKey && type !== BindType.ReleaseKey && type !== BindType.TapKey)
    )
      return

    const newBind = {
      [BindType.PressKey]: new PressKey(key),
      [BindType.ReleaseKey]: new ReleaseKey(key),
      [BindType.TapKey]: new TapKey(key)
    }[type]

    if (newBind) onBindSelected(newBind)
  }

  const handleLayerChange = (newLayer: number): void => {
    setBindValue(newLayer.toString())
    onBindSelected(new SwapLayer(newLayer))
  }

  const handleMacroSelect = (): void => {
    setBindValue(BindType.Macro)
    setType(BindType.Macro)
    setMacroBinds([])
    onBindSelected(new Macro([]))
  }

  // Add a new placeholder for a new bind
  const handleAddMacroBind = (): void => {
    setMacroBinds([...macroBinds, null])
  }

  // Update a bind at a specific index
  const handleUpdateMacroBind = (idx: number, bind: Bind): void => {
    const newBinds = [...macroBinds]
    newBinds[idx] = bind
    setMacroBinds(newBinds)
    // Only pass non-null binds to Macro_Bind
    onBindSelected(new Macro(newBinds.filter((b): b is Bind => b !== null)))
  }

  // Dynamic card width for macro binds
  const cardWidthClass = type === BindType.Macro ? 'max-w-4xl' : 'max-w-md'

  return (
    <Card className={`w-full ${cardWidthClass} mx-auto`}>
      <CardHeader>
        <CardTitle>Select Bind</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bind Type Dropdown */}
        <Select
          onValueChange={(type: BindType) => {
            setType(type)
            setBindValue('')
            if (type === BindType.Macro) {
              handleMacroSelect()
              return
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select bind type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={BindType.PressKey}>Press Key</SelectItem>
            <SelectItem value={BindType.ReleaseKey}>Release Key</SelectItem>
            <SelectItem value={BindType.TapKey}>Tap Key</SelectItem>
            <SelectItem value={BindType.SwitchLayer}>Change Layer</SelectItem>
            <SelectItem value={BindType.Macro}>Macro</SelectItem>
          </SelectContent>
        </Select>

        {/* Single key input for press/release/tap */}
        {type &&
          (type === BindType.PressKey ||
            type === BindType.ReleaseKey ||
            type === BindType.TapKey) && (
            <div className="w-full flex justify-center">
              <div className="w-64">
                <KeySelecter selectedKey={bindValue} onSelect={handleSingleKeyChange} />
              </div>
            </div>
          )}

        {/* Sequence builder for taps */}
        {type && type === BindType.SwitchLayer && (
          <Input
            type="number"
            placeholder="Layer number"
            min={0}
            max={maxLayer}
            onChange={(e) => handleLayerChange(Number(e.target.value))}
          />
        )}

        {/* Macro bind selection */}
        {type === BindType.Macro && (
          <div className="space-y-2 w-full">
            <div>
              <div className="font-semibold mb-2">Macro Binds:</div>
              {macroBinds.length === 0 && (
                <div className="text-sm text-gray-500">No binds yet.</div>
              )}
              <div
                className="flex flex-col gap-3"
                style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  width: '100%'
                }}
              >
                {macroBinds.map((_, idx) => (
                  <div key={idx} className="border rounded px-2 py-2 bg-gray-50 w-full">
                    <BindSelector
                      maxLayer={maxLayer}
                      onBindSelected={(updatedBind) => handleUpdateMacroBind(idx, updatedBind)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <Button type="button" size="sm" onClick={handleAddMacroBind}>
              Add Bind
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
