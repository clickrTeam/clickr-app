import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { keys } from "src/models/Keys"

type SelectKeyProps = {
  onValueChange: (value: string) => void,
  defaultValue?: string
}
export default function SelectKey({
  onValueChange,
  defaultValue
}: SelectKeyProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue} >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        {keys.map((key) => (
          <SelectItem value={key}>key</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
