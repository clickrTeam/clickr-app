// Key color identity for VisualKeyboard
import { Trigger, TriggerType } from '../../../../models/Trigger'
import { Bind, BindType } from '../../../../models/Bind'

export const bindTypeColors: Record<BindType, string> = {
  [BindType.PressKey]: '#60a5fa',
  [BindType.ReleaseKey]: '#f87171',
  [BindType.TapKey]: '#34d399',
  [BindType.SwitchLayer]: '#fbbf24',
  [BindType.Macro]: '#a78bfa',
  [BindType.TimedMacro]: '#f472b6',
  [BindType.Repeat]: '#fb7185',
  [BindType.OpenApp]: '#71fb83ff',
  [BindType.RunScript]: '#71f2fbff',
  [BindType.Meta_Destroy]: '#cb0f2bff',
}

export const triggerTypeColors: Record<TriggerType, string> = {
  [TriggerType.KeyPress]: '#60a5fa',
  [TriggerType.KeyRelease]: '#f87171',
  [TriggerType.Hold]: '#fbbf24',
  [TriggerType.TapSequence]: '#a78bfa',
  [TriggerType.AppFocused]: '#34d399'
}

const DEFAULT_COLOR = '#d1d5db'

export function getMacroButtonBg(item: Bind): string {
  return `${bindTypeColors[item.bind_type as BindType]}80`
}
export function getMacroButtonBgT(item: Trigger): string {
  return `${triggerTypeColors[item.trigger_type as TriggerType]}80`
}
export function getTriggerTypeBackground(trigger_type: string): string {
  return `${triggerTypeColors[trigger_type as TriggerType]}`
}

export function getDropdownBgT(
  item: Trigger,
  opt: TriggerType
): string {
  if (!opt) return ''
  return item.trigger_type === opt ? `${triggerTypeColors[opt]}22` : ''
}

export function getBindColor(bindings: Array<[Trigger, Bind]>): string {
  if (!bindings || bindings.length === 0) return DEFAULT_COLOR
  const colors = bindings.map(([, bind]) => bindTypeColors[bind.bind_type])
  if (colors.length === 1) return colors[0]
  // Average the colors for now, later implement a multi-color geometry background
  const stops = colors.map(
    (color: string, i: number) => `${color} ${Math.round((i / colors.length) * 100)}%`
  )
  return `linear-gradient(45deg, ${stops.join(', ')})`
}

export function getTriggerColor(mapped: [Trigger, Bind][]): import("csstype").Property.Background<string | number> | undefined {
  if (!mapped || mapped.length === 0) return DEFAULT_COLOR
  const colors = mapped.map(([trigger, ]) => triggerTypeColors[trigger.trigger_type])
  if (colors.length === 1) return colors[0]
  // Average the colors for now, later implement a multi-color geometry background
  const stops = colors.map(
    (color: string, i: number) => `${color} ${Math.round(((i + 1) / (colors.length + 1)) * 100)}%`
  )
  return `linear-gradient(60deg, ${stops.join(', ')})`;
}

export function getKeyClass(
  key: string | undefined,
  pressedKeys: string[],
  clickedKeys: string[]
): string {
  return [
    'transition-all',
    'border',
    'rounded',
    'font-mono',
    'h-10',
    key && key.length >= 4 ? 'text-xs' : key && key.length >= 2 ? 'text-sm' : '',
    key && pressedKeys.includes(key) ? 'border-blue-600' : '',
    key && clickedKeys.includes(key) ? 'border-green-600' : '',
    key && !pressedKeys.includes(key) && !clickedKeys.includes(key) ? 'border-gray-300' : '',
    !key ? 'border-none cursor-default' : ''
  ].join(' ')
}
