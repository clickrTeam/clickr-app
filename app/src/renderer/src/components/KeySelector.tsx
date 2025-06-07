import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { keys } from '../../../models/Keys'

/**
 * Props for KeySelecter:
 * - selectedKey: currently selected key (optional)
 * - onSelect: callback when user picks a key
 */
type KeySelecterProps = {
  selectedKey?: string
  onSelect: (value: string) => void
}

export default function KeySelecter({ selectedKey, onSelect }: KeySelecterProps): JSX.Element {
  return (
    <Select value={selectedKey} onValueChange={onSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select key" />
      </SelectTrigger>
      <SelectContent>
        {keys.map((key) => (
          <SelectItem key={key} value={key}>
            {key}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
