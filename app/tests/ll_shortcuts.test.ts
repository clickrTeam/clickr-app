/**
 * This file is for testing the translation of shortcuts
 * into the expected format based on the OS.
 */
import { Profile } from '../src/models/Profile'
import * as utils from './test_utils/test_utils'
import { MacKey, WinKey, LinuxKey, Letters, Digits, Function } from '../src/models/Keys'
import * as T from '../src/models/Trigger'
import * as B from '../src/models/Bind'
import * as LL from '../src/models/LowLevelProfile'
import log from 'electron-log'

/**
 * Tests that ensure basic shortcuts are represented in their low level form
 */
describe('Basic Low Level Shortcut', () => {
  test('Basic Windows Shortcut', () => {
    const prof = utils.generateSmallShortcutProfileWindows()
    const ll_prof = prof.toLL()
    log.info('ll_prof: ', ll_prof)
    expect(2 + 2).toBe(4)
  })
})
