/**
 * This file is for testing the translation of OS-specific profiles
 * into the expected format based on the OS.
 */
import * as utils from './test_utils/test_utils'
import { MacKey, WinKey, LinuxKey, Letters, Digits } from '../src/models/Keys.enum'
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
    expect(mac.layers[0].getRemapping(new T.KeyPress(Digits.Digit1))).toEqual(
      new B.TapKey(WinKey.WinLeft)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Digits.Digit2))).toEqual(
      new B.TapKey(WinKey.WinRight)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Digits.Digit3))).toEqual(
      new B.TapKey(WinKey.LeftAlt)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Digits.Digit4))).toEqual(
      new B.TapKey(WinKey.RightAlt)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Digits.Digit5))).toEqual(
      new B.TapKey(WinKey.LeftControl)
    )

    // Verify layer 1 was also translated
    expect(mac.layers[1].getRemapping(new T.KeyPress(Digits.Digit1))).toEqual(
      new B.TapKey(WinKey.WinLeft)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Digits.Digit2))).toEqual(
      new B.TapKey(WinKey.WinRight)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Digits.Digit3))).toEqual(
      new B.TapKey(WinKey.LeftAlt)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Digits.Digit4))).toEqual(
      new B.TapKey(WinKey.RightAlt)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Digits.Digit5))).toEqual(
      new B.TapKey(WinKey.LeftControl)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(WinKey.WinLeft))).toEqual(
      new B.TapKey(Letters.A)
    )
  })

  test('Basic macOS to Linux', () => {
    const mac = utils.generateMacProfile()
    mac.translateToTargetOS('macOS', 'Linux')

    expect(mac.OS).toBe('Linux')

    // Layer 0 translated binds
    expect(mac.layers[0].getRemapping(new T.KeyPress(Digits.Digit1))).toEqual(
      new B.TapKey(LinuxKey.LeftSuper)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Digits.Digit2))).toEqual(
      new B.TapKey(LinuxKey.RightSuper)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Digits.Digit3))).toEqual(
      new B.TapKey(LinuxKey.LeftAlt)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Digits.Digit4))).toEqual(
      new B.TapKey(LinuxKey.RightAlt)
    )

    expect(mac.layers[0].getRemapping(new T.KeyPress(Digits.Digit5))).toEqual(
      new B.TapKey(LinuxKey.LeftControl)
    )

    // Layer 1 translated binds
    expect(mac.layers[1].getRemapping(new T.KeyPress(Digits.Digit1))).toEqual(
      new B.TapKey(LinuxKey.LeftSuper)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Digits.Digit2))).toEqual(
      new B.TapKey(LinuxKey.RightSuper)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Digits.Digit3))).toEqual(
      new B.TapKey(LinuxKey.LeftAlt)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Digits.Digit4))).toEqual(
      new B.TapKey(LinuxKey.RightAlt)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(Digits.Digit5))).toEqual(
      new B.TapKey(LinuxKey.LeftControl)
    )

    expect(mac.layers[1].getRemapping(new T.KeyPress(LinuxKey.LeftSuper))).toEqual(
      new B.TapKey(Letters.A)
    )
  })

  test('Basic Windows to macOS', () => {
    const win = utils.generateWindowsProfile()
    win.translateToTargetOS('Windows', 'macOS')

    expect(win.OS).toBe('macOS')

    // Layer 0 translated binds
    expect(win.layers[0].getRemapping(new T.KeyPress(Digits.Digit1))).toEqual(
      new B.TapKey(MacKey.CommandLeft)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Digits.Digit2))).toEqual(
      new B.TapKey(MacKey.CommandRight)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Digits.Digit3))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Digits.Digit4))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Digits.Digit5))).toEqual(
      new B.TapKey(MacKey.OptionLeft)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Digits.Digit6))).toEqual(
      new B.TapKey(MacKey.OptionRight)
    )

    // Layer 1 translated binds
    expect(win.layers[1].getRemapping(new T.KeyPress(Digits.Digit1))).toEqual(
      new B.TapKey(MacKey.CommandLeft)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Digits.Digit2))).toEqual(
      new B.TapKey(MacKey.CommandRight)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Digits.Digit3))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Digits.Digit4))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Digits.Digit5))).toEqual(
      new B.TapKey(MacKey.OptionLeft)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Digits.Digit6))).toEqual(
      new B.TapKey(MacKey.OptionRight)
    )

    // Verify trigger translation
    expect(win.layers[1].getRemapping(new T.KeyPress(MacKey.CommandLeft))).toEqual(
      new B.TapKey(Letters.A)
    )
  })

  test('Basic Windows to Linux', () => {
    const win = utils.generateWindowsProfile()
    win.translateToTargetOS('Windows', 'Linux')

    expect(win.OS).toBe('Linux')

    // Layer 0 translated binds
    expect(win.layers[0].getRemapping(new T.KeyPress(Digits.Digit1))).toEqual(
      new B.TapKey(LinuxKey.LeftSuper)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Digits.Digit2))).toEqual(
      new B.TapKey(LinuxKey.RightSuper)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Digits.Digit3))).toEqual(
      new B.TapKey(LinuxKey.LeftControl)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Digits.Digit4))).toEqual(
      new B.TapKey(LinuxKey.RightControl)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Digits.Digit5))).toEqual(
      new B.TapKey(LinuxKey.LeftAlt)
    )

    expect(win.layers[0].getRemapping(new T.KeyPress(Digits.Digit6))).toEqual(
      new B.TapKey(LinuxKey.RightAlt)
    )

    // Layer 1 translated binds
    expect(win.layers[1].getRemapping(new T.KeyPress(Digits.Digit1))).toEqual(
      new B.TapKey(LinuxKey.LeftSuper)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Digits.Digit2))).toEqual(
      new B.TapKey(LinuxKey.RightSuper)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Digits.Digit3))).toEqual(
      new B.TapKey(LinuxKey.LeftControl)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Digits.Digit4))).toEqual(
      new B.TapKey(LinuxKey.RightControl)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Digits.Digit5))).toEqual(
      new B.TapKey(LinuxKey.LeftAlt)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(Digits.Digit6))).toEqual(
      new B.TapKey(LinuxKey.RightAlt)
    )

    expect(win.layers[1].getRemapping(new T.KeyPress(LinuxKey.LeftSuper))).toEqual(
      new B.TapKey(Letters.A)
    )
  })

  test('Basic Linux to macOS', () => {
    const linux = utils.generateLinuxProfile()
    linux.translateToTargetOS('Linux', 'macOS')

    expect(linux.OS).toBe('macOS')

    // Layer 0 translated binds
    expect(linux.layers[0].getRemapping(new T.KeyPress(Digits.Digit1))).toEqual(
      new B.TapKey(MacKey.CommandLeft)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Digits.Digit2))).toEqual(
      new B.TapKey(MacKey.CommandRight)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Digits.Digit3))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Digits.Digit4))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Digits.Digit5))).toEqual(
      new B.TapKey(MacKey.OptionLeft)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Digits.Digit6))).toEqual(
      new B.TapKey(MacKey.OptionRight)
    )

    // Layer 1 translated binds
    expect(linux.layers[1].getRemapping(new T.KeyPress(Digits.Digit1))).toEqual(
      new B.TapKey(MacKey.CommandLeft)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Digits.Digit2))).toEqual(
      new B.TapKey(MacKey.CommandRight)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Digits.Digit3))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Digits.Digit4))).toEqual(
      new B.TapKey(MacKey.Control)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Digits.Digit5))).toEqual(
      new B.TapKey(MacKey.OptionLeft)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Digits.Digit6))).toEqual(
      new B.TapKey(MacKey.OptionRight)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(MacKey.CommandLeft))).toEqual(
      new B.TapKey(Letters.A)
    )
  })

  test('Basic Linux to Windows', () => {
    const linux = utils.generateLinuxProfile()
    linux.translateToTargetOS('Linux', 'Windows')

    expect(linux.OS).toBe('Windows')

    // Layer 0 translated binds
    expect(linux.layers[0].getRemapping(new T.KeyPress(Digits.Digit1))).toEqual(
      new B.TapKey(WinKey.WinLeft)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Digits.Digit2))).toEqual(
      new B.TapKey(WinKey.WinRight)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Digits.Digit3))).toEqual(
      new B.TapKey(WinKey.LeftControl)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Digits.Digit4))).toEqual(
      new B.TapKey(WinKey.RightControl)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Digits.Digit5))).toEqual(
      new B.TapKey(WinKey.LeftAlt)
    )

    expect(linux.layers[0].getRemapping(new T.KeyPress(Digits.Digit6))).toEqual(
      new B.TapKey(WinKey.RightAlt)
    )

    // Layer 1 translated binds
    expect(linux.layers[1].getRemapping(new T.KeyPress(Digits.Digit1))).toEqual(
      new B.TapKey(WinKey.WinLeft)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Digits.Digit2))).toEqual(
      new B.TapKey(WinKey.WinRight)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Digits.Digit3))).toEqual(
      new B.TapKey(WinKey.LeftControl)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Digits.Digit4))).toEqual(
      new B.TapKey(WinKey.RightControl)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Digits.Digit5))).toEqual(
      new B.TapKey(WinKey.LeftAlt)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(Digits.Digit6))).toEqual(
      new B.TapKey(WinKey.RightAlt)
    )

    expect(linux.layers[1].getRemapping(new T.KeyPress(WinKey.WinLeft))).toEqual(
      new B.TapKey(Letters.A)
    )
  })
})

describe('Recursive binds translation between OS', () => {
  test('macOS to Windows', () => {
    const mac_recursive = utils.generateRecursiveBindProfile()
    mac_recursive.translateToTargetOS('macOS', 'Windows')

    expect(mac_recursive.OS).toBe('Windows')
    const b1 = mac_recursive.layers[0].getRemapping(new T.KeyPress(Letters.A))
    const macro = b1 as B.Macro
    expect(macro).toBeInstanceOf(B.Macro)
    expect(macro.binds[0]).toBeInstanceOf(B.Macro)
    const inner_macro = macro.binds[0] as B.Macro
    expect(inner_macro.binds[0]).toEqual(new B.TapKey(WinKey.WinLeft))
    expect(inner_macro.binds[1]).toEqual(new B.TapKey(WinKey.WinRight))
    expect(macro.binds[1]).toEqual(new B.TapKey(WinKey.LeftAlt))
  })
})

/**
 * Write some kind of tests for keys that do not have a direct equivalent on other OSes.
 */
