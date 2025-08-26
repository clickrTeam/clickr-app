import { Bind } from '../../../../models/Bind'
import { Trigger } from '../../../../models/Trigger'
import { getKeyClass } from './Colors'

export interface KeyTileModel {
  key: string
  width: number
  displayWidth: string
  gapAfter: string
  className: string
  mapped: Array<[Trigger, Bind]>
  keyRef?: HTMLButtonElement | null
  isDown?: boolean // true if the key is currently pressed
  isSelected?: boolean
}

export interface VisualKeyboardModel {
  keyModels: Record<string, KeyTileModel>
  unmapped: Array<[Trigger, Bind]>
}

export function buildVisualKeyboardModel(
  allKeys: Array<{ key: string; width?: number; gapAfter?: boolean }>,
  remappings: Map<Trigger, Bind>
): VisualKeyboardModel {
  const keyModels: Record<string, KeyTileModel> = {}
  const unmapped: Array<[Trigger, Bind]> = []
  // Pre-index triggers by key
  const keyMap: Record<string, Array<[Trigger, Bind]>> = {}
  for (const [trigger, bind] of remappings.entries()) {
    const triggerKey = (trigger as { value?: string }).value
    if (typeof triggerKey === 'string') {
      if (!keyMap[triggerKey]) keyMap[triggerKey] = []
      keyMap[triggerKey].push([trigger, bind])
    } else {
      unmapped.push([trigger, bind])
    }
  }
  for (const { key, width, gapAfter } of allKeys) {
    keyModels[key] = {
      key,
      width: width ?? 2.5,
      gapAfter: gapAfter ? `${width || 0.25 + (2 * 2.25) / 3}rem` : '0rem',
      className: getKeyClass(key, [], []),
      mapped: keyMap[key] || [],
      displayWidth: `${width || 2.25}rem`
    }
  }
  return { keyModels, unmapped }
}
