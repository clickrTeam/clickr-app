/**
 * This file is for testing the translation of OS-specific profiles
 * into the expected format based on the OS.
 */
import { Profile } from '../src/models/Profile'
import * as utils from './test_utils/test_utils'
import { MacKey, WinKey, LinuxKey, Key } from '../src/models/Keys'
import * as T from '../src/models/Trigger'
import * as B from '../src/models/Bind'

/**
 * Ensure translation between OSes works as expected.
 * Problems:
 * - Some keys do not have a direct equivalent on other OSes. Right now we just skip these.
 * - Some translations are not possible because the physical keyboard is different. CtrlLeft & CtrlRight vs Control (macOS)
 */
describe('Basic profile translations between OS', () => {
  test('Basic macOS to Windows', () => {
    const mac = utils.generateMacProfile()
    mac.translateToTargetOS('macOS', 'Windows')

    expect(mac.OS).toBe('Windows')
    expect(mac.layers[0].getRemapping(new T.KeyPress(Key.Digit1))).toEqual(
      new B.TapKey(WinKey.WinLeft)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Key.Digit2))).toEqual(
      new B.TapKey(WinKey.WinRight)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Key.Digit3))).toEqual(
      new B.TapKey(WinKey.AltLeft)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Key.Digit4))).toEqual(
      new B.TapKey(WinKey.AltRight)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Key.Digit5))).toEqual(
      new B.TapKey(WinKey.CtrlLeft)
    )

    // Verify layer 1 was also translated
    expect(mac.layers[1].getRemapping(new T.KeyPress(Key.Digit1))).toEqual(
      new B.TapKey(WinKey.WinLeft)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Key.Digit2))).toEqual(
      new B.TapKey(WinKey.WinRight)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Key.Digit3))).toEqual(
      new B.TapKey(WinKey.AltLeft)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Key.Digit4))).toEqual(
      new B.TapKey(WinKey.AltRight)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Key.Digit5))).toEqual(
      new B.TapKey(WinKey.CtrlLeft)
    )

    /// @todo Check that mac keys that are the triggers were also translated
  })

  test('Basic Windows to macOS', () => {
    const win = utils.generateWindowsProfile()
    win.translateToTargetOS('Windows', 'macOS')

    expect(win.OS).toBe('macOS')
    // Fill in expected vales
  })
})
