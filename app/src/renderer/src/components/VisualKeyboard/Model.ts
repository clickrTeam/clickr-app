import { Bind, TapKey, Macro } from '../../../../models/Bind'
import { Trigger } from '../../../../models/Trigger'
import { getKeyClass } from './Colors'
import { ProfileController } from './ProfileControler'

export interface KeyPressInfo {
  key: string
  isDown: boolean
}

export interface KeyTileModel {
  displayKey: string | undefined
  key: string
  width: number
  displayWidth: string
  gapAfter: string
  className: string
  mapped: Array<[Trigger, Bind]>
  keyRef?: HTMLButtonElement | null
  isDown?: boolean // true if the key is currently pressed
  isSelected?: boolean
  gridRowSpan: number
}

export interface VisualKeyboardModel {
  keyModels: Record<string, KeyTileModel>
  unmappedKeyModels: KeyTileModel[]
  unmapped: Array<[Trigger, Bind]>
}

export function buildVisualKeyboardModel(
  allKeys: Array<{ key: string; width?: number; gapAfter?: boolean; gridRowSpan?: number }>,
  profileController: ProfileController,
  pressedKeys: string[] = [],
  selectedKey: string | null = null
): VisualKeyboardModel {
  const keyModels: Record<string, KeyTileModel> = {}
  const unmappedKeyModels: KeyTileModel[] = []
  const unmapped: Array<[Trigger, Bind]> = []
  const keyMap: Record<string, Array<[Trigger, Bind]>> = {}
  for (const [trigger, bind] of profileController.getActiveRemappings().entries()) {
    const triggerKey = (trigger as { value?: string }).value
    if (typeof triggerKey === 'string') {
      if (!keyMap[triggerKey]) keyMap[triggerKey] = []
      keyMap[triggerKey].push([trigger, bind])
    } else {
      unmapped.push([trigger, bind])
    }
  }
  for (const { key, width, gapAfter, gridRowSpan } of allKeys) {
    const isDown = pressedKeys.includes(key)
    const isSelected = selectedKey === key
    let className = getKeyClass(key, [], [])
    if (isSelected) className += ' selected'
    if (isDown) className += ' down'
    const mapped = keyMap[key] || []
    let displayKey: string | undefined = undefined
    if (mapped.length === 1) {
      const singleBind = mapped[0][1] as Macro
      if (singleBind.binds.length === 1) {
        const firstBind = singleBind.binds[0]
        if (firstBind instanceof TapKey) {
          displayKey = firstBind.value
        }
      }
    }

    keyModels[key] = {
      displayKey,
      key,
      width: width ?? 2.5,
      gapAfter: gapAfter ? `${width || 0.25 + (2 * 2.25) / 3}rem` : '0rem',
      className: 'vk-key ' + className,
      mapped,
      displayWidth: `${width || 2.25}rem`,
      isDown,
      isSelected,
      gridRowSpan: gridRowSpan ?? 1
    }
  }

  for (const k in keyMap) {
    if (k in keyModels) continue
    const mapped = keyMap[k]
    unmappedKeyModels.push({
      displayKey: undefined,
      key: k,
      width: 2.5,
      gapAfter: '0rem',
      className: 'vk-key',
      mapped,
      displayWidth: '2.5rem',
      isDown: false,
      isSelected: false,
      gridRowSpan: 1
    })
  }

  unmapped.sort((a, b) => {
      const aKey = (a[0] as { value?: string }).value || ''
      const bKey = (b[0] as { value?: string }).value || ''
      return aKey.localeCompare(bKey)
    })
  return { keyModels, unmappedKeyModels, unmapped }
}
