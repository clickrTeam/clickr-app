import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Input } from "./ui/input"
import { Bind, BindType, PressKey, ReleaseKey, TapKey, SwapLayer } from "../../../models/Bind"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import KeySelecter from "./KeySelector"

interface BindSelectorProps {
  maxLayer: number,
  onBindSelected: (bind: Bind) => void,
}

export function BindSelector({ maxLayer, onBindSelected }: BindSelectorProps) {
  const [type, setType] = useState<BindType | null>(null)
  const [bindValue, setBindValue] = useState<string>('')

  const handleSingleKeyChange = (key: string) => {
    setBindValue(key)

    if (!type || (type !== BindType.PressKey && type !== BindType.ReleaseKey
      && type !== BindType.TapKey))
      return

    const newBind = {
      [BindType.PressKey]: new PressKey(key),
      [BindType.ReleaseKey]: new ReleaseKey(key),
      [BindType.TapKey]: new TapKey(key),
    }[type]

    if (newBind) onBindSelected(newBind)
  }

  const handleLayerChange = (newLayer: number) => {
    setBindValue(newLayer.toString())
    onBindSelected(new SwapLayer(newLayer))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Bind</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trigger Type Dropdown */}
        <Select
          onValueChange={(type: BindType) => {
            setBindValue('')
            setType(type)
          }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select bind type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={BindType.PressKey}>Press Key</SelectItem>
            <SelectItem value={BindType.ReleaseKey}>Release Key</SelectItem>
            <SelectItem value={BindType.TapKey}>Tap Key</SelectItem>
            <SelectItem value={BindType.SwapLayer}>Change Layer</SelectItem>
          </SelectContent>
        </Select>


        {/* Single key input for press/release */}
        {type && type !== BindType.SwapLayer && (
          <KeySelecter
            selectedKey={bindValue}
            onSelect={handleSingleKeyChange}
          />
        )}

        {/* Sequence builder for taps */}
        {type && type === BindType.SwapLayer && (
          <Input
            type="number"
            placeholder="Layer number"
            min={0}
            max={maxLayer}
            onChange={(e) =>
              handleLayerChange(Number(e.target.value))
            }
          />
        )}
      </CardContent>
    </Card >
  )
}
