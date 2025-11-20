/**
 * This file is for testing the translation of shortcuts
 * into the expected format based on the OS.
 */
import * as utils from './test_utils/test_utils'

/**
 * Tests that ensure basic shortcuts are represented in their low level form
 */
describe('Basic Low Level Shortcut', () => {
  test('Basic Windows Shortcut', () => {
    const prof = utils.generateSmallShortcutProfileWindows()
    const ll_prof = prof.toLL()

    const remapA = ll_prof.layers[0].remappings[0]
    if ('trigger' in remapA && remapA.trigger.type === 'key_press') {
      expect(remapA.trigger.type).toBe('key_press')
      expect(remapA.trigger.value).toBe('A')
    }

    expect(remapA.binds).toEqual([
      { type: 'press_key', value: 'LeftControl' },
      { type: 'press_key', value: 'C' },
      { type: 'release_key', value: 'LeftControl' },
      { type: 'release_key', value: 'C' }
    ])

    const remapB = ll_prof.layers[1].remappings[0]
    if ('trigger' in remapB && remapB.trigger.type === 'key_press') {
      expect(remapB.trigger.type).toBe('key_press')
      expect(remapB.trigger.value).toBe('B')
    }

    expect(remapB.binds).toEqual([
      { type: 'press_key', value: 'LeftControl' },
      { type: 'press_key', value: 'X' },
      { type: 'release_key', value: 'LeftControl' },
      { type: 'release_key', value: 'X' },
      { type: 'press_key', value: 'LeftControl' },
      { type: 'press_key', value: 'V' },
      { type: 'release_key', value: 'LeftControl' },
      { type: 'release_key', value: 'V' }
    ])
  })

  test('Basic Linux Shortcut', () => {
    const prof = utils.generateSmallShortcutProfileLinux()
    const ll_prof = prof.toLL()

    const remapA = ll_prof.layers[0].remappings[0]
    if ('trigger' in remapA && remapA.trigger.type === 'key_press') {
      expect(remapA.trigger.type).toBe('key_press')
      expect(remapA.trigger.value).toBe('A')
    }

    expect(remapA.binds).toEqual([
      { type: 'press_key', value: 'LeftControl' },
      { type: 'press_key', value: 'C' },
      { type: 'release_key', value: 'LeftControl' },
      { type: 'release_key', value: 'C' }
    ])

    const remapB = ll_prof.layers[1].remappings[0]
    if ('trigger' in remapB && remapB.trigger.type === 'key_press') {
      expect(remapB.trigger.type).toBe('key_press')
      expect(remapB.trigger.value).toBe('B')
    }

    expect(remapB.binds).toEqual([
      { type: 'press_key', value: 'LeftControl' },
      { type: 'press_key', value: 'X' },
      { type: 'release_key', value: 'LeftControl' },
      { type: 'release_key', value: 'X' },
      { type: 'press_key', value: 'LeftControl' },
      { type: 'press_key', value: 'V' },
      { type: 'release_key', value: 'LeftControl' },
      { type: 'release_key', value: 'V' }
    ])
  })

  test('Basic macOS Shortcut', () => {
    const prof = utils.generateSmallShortcutProfileMac()
    const ll_prof = prof.toLL()

    const remapA = ll_prof.layers[0].remappings[0]
    if ('trigger' in remapA && remapA.trigger.type === 'key_press') {
      expect(remapA.trigger.type).toBe('key_press')
      expect(remapA.trigger.value).toBe('A')
    }

    expect(remapA.binds).toEqual([
      { type: 'press_key', value: 'CommandLeft' },
      { type: 'press_key', value: 'C' },
      { type: 'release_key', value: 'CommandLeft' },
      { type: 'release_key', value: 'C' }
    ])

    const remapB = ll_prof.layers[1].remappings[0]
    if ('trigger' in remapB && remapB.trigger.type === 'key_press') {
      expect(remapB.trigger.type).toBe('key_press')
      expect(remapB.trigger.value).toBe('B')
    }

    expect(remapB.binds).toEqual([
      { type: 'press_key', value: 'CommandLeft' },
      { type: 'press_key', value: 'X' },
      { type: 'release_key', value: 'CommandLeft' },
      { type: 'release_key', value: 'X' },
      { type: 'press_key', value: 'CommandLeft' },
      { type: 'press_key', value: 'V' },
      { type: 'release_key', value: 'CommandLeft' },
      { type: 'release_key', value: 'V' }
    ])
  })
})
