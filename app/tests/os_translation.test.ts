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

    expect(mac.layers[1].getRemapping(new T.KeyPress(WinKey.WinLeft))).toEqual(new B.TapKey(Key.A))
  })

  test('Basic macOS to Linux', () => {
    const mac = utils.generateMacProfile()
    mac.translateToTargetOS('macOS', 'Linux')

    expect(mac.OS).toBe('Linux')

    // Layer 0 translated binds
    expect(mac.layers[0].getRemapping(new T.KeyPress(Key.Digit1))).toEqual(
      new B.TapKey(LinuxKey.SuperLeft)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Key.Digit2))).toEqual(
      new B.TapKey(LinuxKey.SuperRight)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Key.Digit3))).toEqual(
      new B.TapKey(LinuxKey.AltLeft)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Key.Digit4))).toEqual(
      new B.TapKey(LinuxKey.AltRight)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Key.Digit5))).toEqual(
      new B.TapKey(LinuxKey.CtrlLeft)
    )

    // Layer 1 translated binds
    expect(mac.layers[1].getRemapping(new T.KeyPress(Key.Digit1))).toEqual(
      new B.TapKey(LinuxKey.SuperLeft)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Key.Digit2))).toEqual(
      new B.TapKey(LinuxKey.SuperRight)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Key.Digit3))).toEqual(
      new B.TapKey(LinuxKey.AltLeft)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Key.Digit4))).toEqual(
      new B.TapKey(LinuxKey.AltRight)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Key.Digit5))).toEqual(
      new B.TapKey(LinuxKey.CtrlLeft)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(LinuxKey.SuperLeft))).toEqual(
      new B.TapKey(Key.A)
    )
  })

  test('Basic Windows to macOS', () => {
    const win = utils.generateWindowsProfile()
    win.translateToTargetOS('Windows', 'macOS')

    expect(win.OS).toBe('macOS')

    // Layer 0 translated binds
    expect(win.layers[0].getRemapping(new T.KeyPress(Key.Digit1))).toEqual(
      new B.TapKey(MacKey.CommandLeft)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Key.Digit2))).toEqual(
      new B.TapKey(MacKey.CommandRight)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Key.Digit3))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Key.Digit4))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Key.Digit5))).toEqual(
      new B.TapKey(MacKey.OptionLeft)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Key.Digit6))).toEqual(
      new B.TapKey(MacKey.OptionRight)
    )

    // Layer 1 translated binds
    expect(win.layers[1].getRemapping(new T.KeyPress(Key.Digit1))).toEqual(
      new B.TapKey(MacKey.CommandLeft)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Key.Digit2))).toEqual(
      new B.TapKey(MacKey.CommandRight)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Key.Digit3))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Key.Digit4))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Key.Digit5))).toEqual(
      new B.TapKey(MacKey.OptionLeft)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Key.Digit6))).toEqual(
      new B.TapKey(MacKey.OptionRight)
    )

    // Verify trigger translation
    expect(win.layers[1].getRemapping(new T.KeyPress(MacKey.CommandLeft))).toEqual(
      new B.TapKey(Key.A)
    )
  })

  test('Basic Windows to Linux', () => {
    const win = utils.generateWindowsProfile()
    win.translateToTargetOS('Windows', 'Linux')

    expect(win.OS).toBe('Linux')

    // Layer 0 translated binds
    expect(win.layers[0].getRemapping(new T.KeyPress(Key.Digit1))).toEqual(
      new B.TapKey(LinuxKey.SuperLeft)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Key.Digit2))).toEqual(
      new B.TapKey(LinuxKey.SuperRight)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Key.Digit3))).toEqual(
      new B.TapKey(LinuxKey.CtrlLeft)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Key.Digit4))).toEqual(
      new B.TapKey(LinuxKey.CtrlRight)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Key.Digit5))).toEqual(
      new B.TapKey(LinuxKey.AltLeft)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Key.Digit6))).toEqual(
      new B.TapKey(LinuxKey.AltRight)
    )

    // Layer 1 translated binds
    expect(win.layers[1].getRemapping(new T.KeyPress(Key.Digit1))).toEqual(
      new B.TapKey(LinuxKey.SuperLeft)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Key.Digit2))).toEqual(
      new B.TapKey(LinuxKey.SuperRight)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Key.Digit3))).toEqual(
      new B.TapKey(LinuxKey.CtrlLeft)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Key.Digit4))).toEqual(
      new B.TapKey(LinuxKey.CtrlRight)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Key.Digit5))).toEqual(
      new B.TapKey(LinuxKey.AltLeft)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Key.Digit6))).toEqual(
      new B.TapKey(LinuxKey.AltRight)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(LinuxKey.SuperLeft))).toEqual(
      new B.TapKey(Key.A)
    )
  })

  test('Basic Linux to macOS', () => {
    const linux = utils.generateLinuxProfile()
    linux.translateToTargetOS('Linux', 'macOS')

    expect(linux.OS).toBe('macOS')

    // Layer 0 translated binds
    expect(linux.layers[0].getRemapping(new T.KeyPress(Key.Digit1))).toEqual(
      new B.TapKey(MacKey.CommandLeft)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Key.Digit2))).toEqual(
      new B.TapKey(MacKey.CommandRight)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Key.Digit3))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Key.Digit4))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Key.Digit5))).toEqual(
      new B.TapKey(MacKey.OptionLeft)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Key.Digit6))).toEqual(
      new B.TapKey(MacKey.OptionRight)
    )

    // Layer 1 translated binds
    expect(linux.layers[1].getRemapping(new T.KeyPress(Key.Digit1))).toEqual(
      new B.TapKey(MacKey.CommandLeft)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Key.Digit2))).toEqual(
      new B.TapKey(MacKey.CommandRight)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Key.Digit3))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Key.Digit4))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Key.Digit5))).toEqual(
      new B.TapKey(MacKey.OptionLeft)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Key.Digit6))).toEqual(
      new B.TapKey(MacKey.OptionRight)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(MacKey.CommandLeft))).toEqual(
      new B.TapKey(Key.A)
    )
  })

  test('Basic Linux to Windows', () => {
    const linux = utils.generateLinuxProfile()
    linux.translateToTargetOS('Linux', 'Windows')

    expect(linux.OS).toBe('Windows')

    // Layer 0 translated binds
    expect(linux.layers[0].getRemapping(new T.KeyPress(Key.Digit1))).toEqual(
      new B.TapKey(WinKey.WinLeft)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Key.Digit2))).toEqual(
      new B.TapKey(WinKey.WinRight)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Key.Digit3))).toEqual(
      new B.TapKey(WinKey.CtrlLeft)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Key.Digit4))).toEqual(
      new B.TapKey(WinKey.CtrlRight)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Key.Digit5))).toEqual(
      new B.TapKey(WinKey.AltLeft)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Key.Digit6))).toEqual(
      new B.TapKey(WinKey.AltRight)
    )

    // Layer 1 translated binds
    expect(linux.layers[1].getRemapping(new T.KeyPress(Key.Digit1))).toEqual(
      new B.TapKey(WinKey.WinLeft)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Key.Digit2))).toEqual(
      new B.TapKey(WinKey.WinRight)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Key.Digit3))).toEqual(
      new B.TapKey(WinKey.CtrlLeft)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Key.Digit4))).toEqual(
      new B.TapKey(WinKey.CtrlRight)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Key.Digit5))).toEqual(
      new B.TapKey(WinKey.AltLeft)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Key.Digit6))).toEqual(
      new B.TapKey(WinKey.AltRight)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(WinKey.WinLeft))).toEqual(
      new B.TapKey(Key.A)
    )
  })
})

describe('Recursive binds translation between OS', () => {
  test('macOS to Windows', () => {
    const mac_recursive = utils.generateRecursiveBindProfile()
    mac_recursive.translateToTargetOS('macOS', 'Windows')

    expect(mac_recursive.OS).toBe('Windows')
    const b1 = mac_recursive.layers[0].getRemapping(new T.KeyPress(Key.A))
    const macro = b1 as B.Macro_Bind
    expect(macro).toBeInstanceOf(B.Macro_Bind)
    expect(macro.binds[0]).toBeInstanceOf(B.Macro_Bind)
    const inner_macro = macro.binds[0] as B.Macro_Bind
    expect(inner_macro.binds[0]).toEqual(new B.TapKey(WinKey.WinLeft))
    expect(inner_macro.binds[1]).toEqual(new B.TapKey(WinKey.WinRight))
    expect(macro.binds[1]).toEqual(new B.TapKey(WinKey.AltLeft))
  })
})

/**
 * Write some kind of tests for keys that do not have a direct equivalent on other OSes.
 */