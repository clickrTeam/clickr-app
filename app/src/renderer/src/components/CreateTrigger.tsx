import { TriggerType, KeyPress, KeyRelease, TapSequence, Trigger } from '../../../models/Trigger'

import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { Button } from './ui/button'
import KeySelecter from './KeySelector'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'

interface TriggerSelectorProps {
  onTriggerSelected: (trigger: Trigger) => void
}

const TriggerSelector: React.FC<TriggerSelectorProps> = ({ onTriggerSelected }) => {
  const [type, setType] = useState<TriggerType | null>(null)
  const [singleKey, setSingleKey] = useState<string>('')
  const [sequence, setSequence] = useState<string[]>([''])

  const handleSingleKeyChange = (key: string) => {
    setSingleKey(key)
    const trigger = type === TriggerType.KeyPress ? new KeyPress(key) : new KeyRelease(key)
    onTriggerSelected(trigger)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Trigger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trigger Type Dropdown */}
        <Select
          onValueChange={(val: any) => {
            setSequence([])
            setSingleKey('')
            setType(val as TriggerType)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select trigger type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TriggerType.KeyPress}>Key Press</SelectItem>
            <SelectItem value={TriggerType.KeyRelease}>Key Release</SelectItem>
            <SelectItem value={TriggerType.TapSequence}>Tap Sequence</SelectItem>
          </SelectContent>
        </Select>

        {/* Single key input for press/release */}
        {type && type !== TriggerType.TapSequence && (
          <KeySelecter selectedKey={singleKey} onSelect={handleSingleKeyChange} />
        )}

        {/* Sequence builder for taps */}
        {type && type === TriggerType.TapSequence && (
          <div className="space-y-2">
            {sequence.map((seqKey, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <KeySelecter
                  selectedKey={seqKey}
                  onSelect={(k) => {
                    const newSeq = [...sequence]
                    newSeq[idx] = k
                    //TOOD: use timeout values
                    if (newSeq.every((k) => k !== ''))
                      onTriggerSelected(new TapSequence(newSeq.map((k) => [k, 0])))
                    setSequence(newSeq)
                  }}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setSequence(sequence.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button onClick={() => setSequence([...sequence, ''])}>Add Key</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
export default TriggerSelector
