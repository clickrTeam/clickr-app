/**
 * This file is for testing the translation of OS-specific profiles
 * into the expected format based on the OS.
 */
import { Profile } from '../src/models/Profile'
import * as utils from './test_utils/test_utils'
import { MacKey, WinKey, LinuxKey, Letters, Digits, Function } from '../src/models/Keys'
import * as T from '../src/models/Trigger'
import * as B from '../src/models/Bind'
import { AdvancedModificaiton } from '../src/models/Modification'

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
    let expectedTrigger = new T.KeyPress(Digits.Digit1);
    let expectedBind = new B.TapKey(WinKey.WinLeft);
    let foundModification = mac.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit2);
    expectedBind = new B.TapKey(WinKey.WinRight);
    foundModification = mac.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit3);
    expectedBind = new B.TapKey(WinKey.AltLeft);
    foundModification = mac.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit4);
    expectedBind = new B.TapKey(WinKey.AltRight);
    foundModification = mac.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit5);
    expectedBind = new B.TapKey(WinKey.CtrlLeft);
    foundModification = mac.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    // Verify layer 1 was also translated
    expectedTrigger = new T.KeyPress(Digits.Digit1);
    expectedBind = new B.TapKey(WinKey.WinLeft);
    foundModification = mac.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit2);
    expectedBind = new B.TapKey(WinKey.WinRight);
    foundModification = mac.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit3);
    expectedBind = new B.TapKey(WinKey.AltLeft);
    foundModification = mac.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit4);
    expectedBind = new B.TapKey(WinKey.AltRight);
    foundModification = mac.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit5);
    expectedBind = new B.TapKey(WinKey.CtrlLeft);
    foundModification = mac.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(WinKey.WinLeft);
    expectedBind = new B.TapKey(Letters.A);
    foundModification = mac.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

  test('Basic macOS to Linux', () => {
    const mac = utils.generateMacProfile()
    mac.translateToTargetOS('macOS', 'Linux')

    expect(mac.OS).toBe('Linux')

    // Layer 0 translated binds
    let expectedTrigger = new T.KeyPress(Digits.Digit1);
    let expectedBind = new B.TapKey(LinuxKey.SuperLeft);
    let foundModification = mac.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit2);
    expectedBind = new B.TapKey(LinuxKey.SuperRight);
    foundModification = mac.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit3);
    expectedBind = new B.TapKey(LinuxKey.AltLeft);
    foundModification = mac.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit4);
    expectedBind = new B.TapKey(LinuxKey.AltRight);
    foundModification = mac.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit5);
    expectedBind = new B.TapKey(LinuxKey.CtrlLeft);
    foundModification = mac.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    // Layer 1 translated binds
    expectedTrigger = new T.KeyPress(Digits.Digit1);
    expectedBind = new B.TapKey(LinuxKey.SuperLeft);
    foundModification = mac.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit2);
    expectedBind = new B.TapKey(LinuxKey.SuperRight);
    foundModification = mac.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit3);
    expectedBind = new B.TapKey(LinuxKey.AltLeft);
    foundModification = mac.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit4);
    expectedBind = new B.TapKey(LinuxKey.AltRight);
    foundModification = mac.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit5);
    expectedBind = new B.TapKey(LinuxKey.CtrlLeft);
    foundModification = mac.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(LinuxKey.SuperLeft);
    expectedBind = new B.TapKey(Letters.A);
    foundModification = mac.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

  test('Basic Windows to macOS', () => {
    const win = utils.generateWindowsProfile()
    win.translateToTargetOS('Windows', 'macOS')

    expect(win.OS).toBe('macOS')

    // Layer 0 translated binds
    let expectedTrigger = new T.KeyPress(Digits.Digit1);
    let expectedBind = new B.TapKey(MacKey.CommandLeft);
    let foundModification = win.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit2);
    expectedBind = new B.TapKey(MacKey.CommandRight);
    foundModification = win.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit3);
    expectedBind = new B.TapKey(MacKey.Control);
    foundModification = win.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit4);
    expectedBind = new B.TapKey(MacKey.Control);
    foundModification = win.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit5);
    expectedBind = new B.TapKey(MacKey.OptionLeft);
    foundModification = win.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit6);
    expectedBind = new B.TapKey(MacKey.OptionRight);
    foundModification = win.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    // Layer 1 translated binds
    expectedTrigger = new T.KeyPress(Digits.Digit1);
    expectedBind = new B.TapKey(MacKey.CommandLeft);
    foundModification = win.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit2);
    expectedBind = new B.TapKey(MacKey.CommandRight);
    foundModification = win.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit3);
    expectedBind = new B.TapKey(MacKey.Control);
    foundModification = win.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit4);
    expectedBind = new B.TapKey(MacKey.Control);
    foundModification = win.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit5);
    expectedBind = new B.TapKey(MacKey.OptionLeft);
    foundModification = win.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit6);
    expectedBind = new B.TapKey(MacKey.OptionRight);
    foundModification = win.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    // Verify trigger translation
    expectedTrigger = new T.KeyPress(MacKey.CommandLeft);
    expectedBind = new B.TapKey(Letters.A);
    foundModification = win.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);
  })

  test('Basic Windows to Linux', () => {
    const win = utils.generateWindowsProfile()
    win.translateToTargetOS('Windows', 'Linux')

    expect(win.OS).toBe('Linux')

    // Layer 0 translated binds
    let expectedTrigger = new T.KeyPress(Digits.Digit1);
    let expectedBind = new B.TapKey(LinuxKey.SuperLeft);
    let foundModification = win.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit2);
    expectedBind = new B.TapKey(LinuxKey.SuperRight);
    foundModification = win.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit3);
    expectedBind = new B.TapKey(LinuxKey.CtrlLeft);
    foundModification = win.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit4);
    expectedBind = new B.TapKey(LinuxKey.CtrlRight);
    foundModification = win.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit5);
    expectedBind = new B.TapKey(LinuxKey.AltLeft);
    foundModification = win.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit6);
    expectedBind = new B.TapKey(LinuxKey.AltRight);
    foundModification = win.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    // Layer 1 translated binds
    // Layer 1 translated binds
    expectedTrigger = new T.KeyPress(Digits.Digit1);
    expectedBind = new B.TapKey(LinuxKey.SuperLeft);
    foundModification = win.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit2);
    expectedBind = new B.TapKey(LinuxKey.SuperRight);
    foundModification = win.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit3);
    expectedBind = new B.TapKey(LinuxKey.CtrlLeft);
    foundModification = win.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit4);
    expectedBind = new B.TapKey(LinuxKey.CtrlRight);
    foundModification = win.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit5);
    expectedBind = new B.TapKey(LinuxKey.AltLeft);
    foundModification = win.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit6);
    expectedBind = new B.TapKey(LinuxKey.AltRight);
    foundModification = win.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(WinKey.WinLeft);
    expectedBind = new B.TapKey(Letters.A);
    foundModification = win.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);
  })

  test('Basic Linux to macOS', () => {
    const linux = utils.generateLinuxProfile()
    linux.translateToTargetOS('Linux', 'macOS')

    expect(linux.OS).toBe('macOS')

    // Layer 0 translated binds
    let expectedTrigger = new T.KeyPress(Digits.Digit1);
    let expectedBind = new B.TapKey(MacKey.CommandLeft);
    let foundModification = linux.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit2);
    expectedBind = new B.TapKey(MacKey.CommandRight);
    foundModification = linux.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit3);
    expectedBind = new B.TapKey(MacKey.Control);
    foundModification = linux.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit4);
    expectedBind = new B.TapKey(MacKey.Control);
    foundModification = linux.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit5);
    expectedBind = new B.TapKey(MacKey.OptionLeft);
    foundModification = linux.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit6);
    expectedBind = new B.TapKey(MacKey.OptionRight);
    foundModification = linux.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    // Layer 1 translated binds
    expectedTrigger = new T.KeyPress(Digits.Digit1);
    expectedBind = new B.TapKey(MacKey.CommandLeft);
    foundModification = linux.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit2);
    expectedBind = new B.TapKey(MacKey.CommandRight);
    foundModification = linux.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit3);
    expectedBind = new B.TapKey(MacKey.Control);
    foundModification = linux.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit4);
    expectedBind = new B.TapKey(MacKey.Control);
    foundModification = linux.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit5);
    expectedBind = new B.TapKey(MacKey.OptionLeft);
    foundModification = linux.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit6);
    expectedBind = new B.TapKey(MacKey.OptionRight);
    foundModification = linux.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(MacKey.CommandLeft);
    expectedBind = new B.TapKey(Letters.A);
    foundModification = linux.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

  test('Basic Linux to Windows', () => {
    const linux = utils.generateLinuxProfile()
    linux.translateToTargetOS('Linux', 'Windows')

    expect(linux.OS).toBe('Windows')

    // Layer 0 translated binds
    let expectedTrigger = new T.KeyPress(Digits.Digit1);
    let expectedBind = new B.TapKey(WinKey.WinLeft);
    let foundModification = linux.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit2);
    expectedBind = new B.TapKey(WinKey.WinRight);
    foundModification = linux.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit3);
    expectedBind = new B.TapKey(WinKey.CtrlLeft);
    foundModification = linux.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit4);
    expectedBind = new B.TapKey(WinKey.CtrlRight);
    foundModification = linux.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit5);
    expectedBind = new B.TapKey(WinKey.AltLeft);
    foundModification = linux.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit6);
    expectedBind = new B.TapKey(WinKey.AltRight);
    foundModification = linux.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    // Layer 1 translated binds
    expectedTrigger = new T.KeyPress(Digits.Digit1);
    expectedBind = new B.TapKey(WinKey.WinLeft);
    foundModification = linux.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit2);
    expectedBind = new B.TapKey(WinKey.WinRight);
    foundModification = linux.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit3);
    expectedBind = new B.TapKey(WinKey.CtrlLeft);
    foundModification = linux.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit4);
    expectedBind = new B.TapKey(WinKey.CtrlRight);
    foundModification = linux.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit5);
    expectedBind = new B.TapKey(WinKey.AltLeft);
    foundModification = linux.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(Digits.Digit6);
    expectedBind = new B.TapKey(WinKey.AltRight);
    foundModification = linux.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);

    expectedTrigger = new T.KeyPress(WinKey.WinLeft);
    expectedBind = new B.TapKey(Letters.A);
    foundModification = linux.layers[1].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    expect((foundModification as AdvancedModificaiton).bind).toEqual(expectedBind);
})

describe('Recursive binds translation between OS', () => {
  test('macOS to Windows', () => {
    const mac_recursive = utils.generateRecursiveBindProfile()
    mac_recursive.translateToTargetOS('macOS', 'Windows')

    expect(mac_recursive.OS).toBe('Windows')
    const expectedTrigger = new T.KeyPress(Letters.A);
    const foundModification = mac_recursive.layers[0].remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(expectedTrigger)
    );
    expect(foundModification).toBeInstanceOf(AdvancedModificaiton);
    const b1 = (foundModification as AdvancedModificaiton).bind;
    const macro = b1 as B.Macro;
    expect(macro).toBeInstanceOf(B.Macro);
    expect(macro.binds[0]).toBeInstanceOf(B.Macro);
    const inner_macro = macro.binds[0] as B.Macro;
    expect(inner_macro.binds[0]).toEqual(new B.TapKey(WinKey.WinLeft));
    expect(inner_macro.binds[1]).toEqual(new B.TapKey(WinKey.WinRight));
    expect(macro.binds[1]).toEqual(new B.TapKey(WinKey.AltLeft));
})

/**
 * Write some kind of tests for keys that do not have a direct equivalent on other OSes.
 */
