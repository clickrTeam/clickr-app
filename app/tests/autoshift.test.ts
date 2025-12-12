import { generateColemakProfile, AUTOSHIFT_DELAY } from './test_utils/test_utils'
import * as K from '../src/models/Keys.enum'
import * as T from '../src/models/Trigger'
import * as B from '../src/models/Bind'
import profileController from '../src/renderer/src/components/VisualKeyboard/ProfileControler'

describe('Autoshift on Colemak', () => {
  test('Enable Autoshift', () => {
    const profile = generateColemakProfile()
    profileController.profile = profile
    profileController.activeLayer = profile.layers[0]
    profileController.enableAutoshiftOnLayer(AUTOSHIFT_DELAY)

    // Digits
    expect(profile.layers[0].getRemapping(new T.Hold(K.Digits.Digit0, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Digits.Digit0),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Digits.Digit0)
      ])
    )

    expect(profile.layers[0].getRemapping(new T.Hold(K.Digits.Digit1, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Digits.Digit1),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Digits.Digit1)
      ])
    )

    expect(profile.layers[0].getRemapping(new T.Hold(K.Digits.Digit2, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Digits.Digit2),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Digits.Digit2)
      ])
    )

    expect(profile.layers[0].getRemapping(new T.Hold(K.Digits.Digit3, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Digits.Digit3),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Digits.Digit3)
      ])
    )

    expect(profile.layers[0].getRemapping(new T.Hold(K.Digits.Digit4, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Digits.Digit4),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Digits.Digit4)
      ])
    )

    expect(profile.layers[0].getRemapping(new T.Hold(K.Digits.Digit5, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Digits.Digit5),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Digits.Digit5)
      ])
    )

    expect(profile.layers[0].getRemapping(new T.Hold(K.Digits.Digit6, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Digits.Digit6),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Digits.Digit6)
      ])
    )

    expect(profile.layers[0].getRemapping(new T.Hold(K.Digits.Digit7, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Digits.Digit7),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Digits.Digit7)
      ])
    )

    expect(profile.layers[0].getRemapping(new T.Hold(K.Digits.Digit8, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Digits.Digit8),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Digits.Digit8)
      ])
    )

    expect(profile.layers[0].getRemapping(new T.Hold(K.Digits.Digit9, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Digits.Digit9),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Digits.Digit9)
      ])
    )

    // QWERTY A → Colemak A
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.A, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.A),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.A)
      ])
    )

    // QWERTY B → Colemak B
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.B, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.B),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.B)
      ])
    )

    // QWERTY C → Colemak C
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.C, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.C),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.C)
      ])
    )

    // QWERTY D → Colemak S
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.D, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.S),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.S)
      ])
    )

    // QWERTY E → Colemak F
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.E, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.F),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.F)
      ])
    )

    // QWERTY F → Colemak T
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.F, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.T),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.T)
      ])
    )

    // QWERTY G → Colemak D
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.G, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.D),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.D)
      ])
    )

    // QWERTY H → Colemak H
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.H, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.H),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.H)
      ])
    )

    // QWERTY I → Colemak U
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.I, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.U),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.U)
      ])
    )

    // QWERTY J → Colemak N
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.J, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.N),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.N)
      ])
    )

    // QWERTY K → Colemak E
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.K, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.E),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.E)
      ])
    )

    // QWERTY L → Colemak I
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.L, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.I),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.I)
      ])
    )

    // QWERTY M → Colemak M
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.M, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.M),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.M)
      ])
    )

    // QWERTY N → Colemak K
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.N, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.K),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.K)
      ])
    )

    // QWERTY O → Colemak Y
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.O, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.Y),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.Y)
      ])
    )

    // QWERTY P → Colemak ;
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.P, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.KeyedSymbols.Semicolon),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.KeyedSymbols.Semicolon)
      ])
    )

    // QWERTY Q → Colemak Q
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.Q, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.Q),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.Q)
      ])
    )

    // QWERTY R → Colemak P
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.R, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.P),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.P)
      ])
    )

    // QWERTY S → Colemak R
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.S, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.R),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.R)
      ])
    )

    // QWERTY T → Colemak G
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.T, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.G),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.G)
      ])
    )

    // QWERTY U → Colemak L
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.U, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.L),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.L)
      ])
    )

    // QWERTY V → Colemak V
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.V, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.V),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.V)
      ])
    )

    // QWERTY W → Colemak W
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.W, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.W),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.W)
      ])
    )

    // QWERTY Y → Colemak J
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.Y, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.J),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.J)
      ])
    )

    // QWERTY Z → Colemak Z
    expect(profile.layers[0].getRemapping(new T.Hold(K.Letters.Z, AUTOSHIFT_DELAY))).toEqual(
      new B.Macro([
        new B.PressKey(K.Modifier.LeftShift),
        new B.PressKey(K.Letters.Z),
        new B.ReleaseKey(K.Modifier.LeftShift),
        new B.ReleaseKey(K.Letters.Z)
      ])
    )
  })

  test('Disable Autoshift', () => {
    const profile = generateColemakProfile()
    profileController.profile = profile
    profileController.activeLayer = profile.layers[0]
    profileController.enableAutoshiftOnLayer(AUTOSHIFT_DELAY)
    profileController.disableAutoShift()

    profileController.activeLayer.remappings.forEach((bind, trigger) => {
      expect(trigger.trigger_type).not.toBe(T.TriggerType.Hold)
    })
  })
})
