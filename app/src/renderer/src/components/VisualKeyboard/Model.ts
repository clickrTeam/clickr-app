import log from 'electron-log'
import { Bind, TapKey, PressKey, ReleaseKey, Macro_Bind } from '../../../../models/Bind'
import { Trigger } from '../../../../models/Trigger'
import { getKeyClass } from './Colors'
import { KeyTile } from './KeyTile'
import { ProfileController } from './ProfileControler'
import { c } from 'framer-motion/dist/types.d-Cjd591yU'

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
}

export interface VisualKeyboardModel {
  keyModels: Record<string, KeyTileModel>
  unmapped: Array<[Trigger, Bind]>
}

export function buildVisualKeyboardModel(
  allKeys: Array<{ key: string; width?: number; gapAfter?: boolean }>,
  profileController: ProfileController,
  pressedKeys: string[] = [],
  selectedKey: string | null = null
): VisualKeyboardModel {
  const keyModels: Record<string, KeyTileModel> = {}
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
  for (const { key, width, gapAfter } of allKeys) {
    const isDown = pressedKeys.includes(key)
    const isSelected = selectedKey === key
    let className = getKeyClass(key, [], [])
    if (isSelected) className += ' selected'
    if (isDown) className += ' down'
    const mapped = keyMap[key] || []
    let displayKey: string | undefined = undefined
    if (mapped.length === 1) {
      const singleBind = mapped[0][1] as Macro_Bind
      if (singleBind.binds.length > 0) {
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
      isSelected
    }
  }
  return { keyModels, unmapped }
}
