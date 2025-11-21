/**
 * Generates profiles for testing purposes.
 */
import { Profile } from '../../src/models/Profile'
import {
  MacKey,
  WinKey,
  LinuxKey,
  Letters,
  Digits,
  Function,
  ShortcutAction
} from '../../src/models/Keys.enum'
import * as T from '../../src/models/Trigger'
import * as B from '../../src/models/Bind'

export function generateMacProfile(): Profile {
  const mac_profile = new Profile('Mac')
  mac_profile.OS = 'macOS'
  mac_profile.addLayer('layer1')

  // MacKey as binds (output)
  mac_profile.layers[0].addRemapping(
    new T.KeyPress(Digits.Digit1),
    new B.TapKey(MacKey.CommandLeft)
  )
  mac_profile.layers[0].addRemapping(
    new T.KeyPress(Digits.Digit2),
    new B.TapKey(MacKey.CommandRight)
  )
  mac_profile.layers[0].addRemapping(new T.KeyPress(Digits.Digit3), new B.TapKey(MacKey.OptionLeft))
  mac_profile.layers[0].addRemapping(
    new T.KeyPress(Digits.Digit4),
    new B.TapKey(MacKey.OptionRight)
  )
  mac_profile.layers[0].addRemapping(new T.KeyPress(Digits.Digit5), new B.TapKey(MacKey.Control))
  mac_profile.layers[0].addRemapping(new T.KeyPress(Digits.Digit6), new B.TapKey(MacKey.Eject))
  mac_profile.layers[0].addRemapping(new T.KeyPress(Digits.Digit7), new B.TapKey(MacKey.Spotlight))

  // MacKey as triggers (input)
  mac_profile.layers[0].addRemapping(new T.KeyPress(MacKey.Launchpad), new B.TapKey(Letters.A))
  mac_profile.layers[0].addRemapping(new T.KeyPress(MacKey.MissionControl), new B.TapKey(Letters.B))
  mac_profile.layers[0].addRemapping(new T.KeyPress(MacKey.MediaPlayPause), new B.TapKey(Letters.C))
  mac_profile.layers[0].addRemapping(new T.KeyPress(MacKey.MediaNext), new B.TapKey(Letters.D))
  mac_profile.layers[0].addRemapping(new T.KeyPress(MacKey.MediaPrev), new B.TapKey(Letters.E))
  mac_profile.layers[0].addRemapping(new T.KeyPress(MacKey.VolumeMute), new B.TapKey(Letters.F))
  mac_profile.layers[0].addRemapping(new T.KeyPress(MacKey.VolumeUp), new B.TapKey(Letters.G))
  mac_profile.layers[0].addRemapping(new T.KeyPress(MacKey.VolumeDown), new B.TapKey(Letters.H))

  // Ensure other layers are translated as well.
  mac_profile.layers[0].addRemapping(new T.KeyPress(Function.F1), new B.SwapLayer(1))
  mac_profile.layers[1].addRemapping(
    new T.KeyPress(Digits.Digit1),
    new B.TapKey(MacKey.CommandLeft)
  )
  mac_profile.layers[1].addRemapping(
    new T.KeyPress(Digits.Digit2),
    new B.TapKey(MacKey.CommandRight)
  )
  mac_profile.layers[1].addRemapping(new T.KeyPress(Digits.Digit3), new B.TapKey(MacKey.OptionLeft))
  mac_profile.layers[1].addRemapping(
    new T.KeyPress(Digits.Digit4),
    new B.TapKey(MacKey.OptionRight)
  )
  mac_profile.layers[1].addRemapping(new T.KeyPress(Digits.Digit5), new B.TapKey(MacKey.Control))
  mac_profile.layers[1].addRemapping(new T.KeyPress(Digits.Digit6), new B.TapKey(MacKey.Eject))
  mac_profile.layers[1].addRemapping(new T.KeyPress(Digits.Digit7), new B.TapKey(MacKey.Spotlight))
  mac_profile.layers[1].addRemapping(new T.KeyPress(MacKey.CommandLeft), new B.TapKey(Letters.A))

  return mac_profile
}

export function generateWindowsProfile(): Profile {
  const win_profile = new Profile('Windows')
  win_profile.OS = 'Windows'
  win_profile.addLayer('layer1')

  // WinKey as binds (output)
  win_profile.layers[0].addRemapping(new T.KeyPress(Digits.Digit1), new B.TapKey(WinKey.WinLeft))
  win_profile.layers[0].addRemapping(new T.KeyPress(Digits.Digit2), new B.TapKey(WinKey.WinRight))
  win_profile.layers[0].addRemapping(
    new T.KeyPress(Digits.Digit3),
    new B.TapKey(WinKey.LeftControl)
  )
  win_profile.layers[0].addRemapping(
    new T.KeyPress(Digits.Digit4),
    new B.TapKey(WinKey.RightControl)
  )
  win_profile.layers[0].addRemapping(new T.KeyPress(Digits.Digit5), new B.TapKey(WinKey.LeftAlt))
  win_profile.layers[0].addRemapping(new T.KeyPress(Digits.Digit6), new B.TapKey(WinKey.RightAlt))
  win_profile.layers[0].addRemapping(new T.KeyPress(Digits.Digit7), new B.TapKey(WinKey.Menu))
  win_profile.layers[0].addRemapping(new T.KeyPress(Digits.Digit8), new B.TapKey(WinKey.PauseBreak))
  win_profile.layers[0].addRemapping(new T.KeyPress(Digits.Digit9), new B.TapKey(WinKey.Insert))

  // WinKey as triggers (input)
  win_profile.layers[0].addRemapping(new T.KeyPress(WinKey.OEM1), new B.TapKey(Letters.A))
  win_profile.layers[0].addRemapping(new T.KeyPress(WinKey.OEM2), new B.TapKey(Letters.B))
  win_profile.layers[0].addRemapping(new T.KeyPress(WinKey.OEM3), new B.TapKey(Letters.C))
  win_profile.layers[0].addRemapping(new T.KeyPress(WinKey.OEM4), new B.TapKey(Letters.D))
  win_profile.layers[0].addRemapping(new T.KeyPress(WinKey.OEM5), new B.TapKey(Letters.E))
  win_profile.layers[0].addRemapping(new T.KeyPress(WinKey.OEM6), new B.TapKey(Letters.F))
  win_profile.layers[0].addRemapping(new T.KeyPress(WinKey.OEM7), new B.TapKey(Letters.G))
  win_profile.layers[0].addRemapping(new T.KeyPress(WinKey.BrowserBack), new B.TapKey(Letters.H))
  win_profile.layers[0].addRemapping(new T.KeyPress(WinKey.BrowserForward), new B.TapKey(Letters.I))
  win_profile.layers[0].addRemapping(new T.KeyPress(WinKey.BrowserRefresh), new B.TapKey(Letters.J))
  win_profile.layers[0].addRemapping(new T.KeyPress(WinKey.BrowserStop), new B.TapKey(Letters.K))
  win_profile.layers[0].addRemapping(new T.KeyPress(WinKey.BrowserSearch), new B.TapKey(Letters.L))
  win_profile.layers[0].addRemapping(
    new T.KeyPress(WinKey.BrowserFavorites),
    new B.TapKey(Letters.M)
  )
  win_profile.layers[0].addRemapping(new T.KeyPress(WinKey.LaunchMail), new B.TapKey(Letters.N))
  win_profile.layers[0].addRemapping(new T.KeyPress(WinKey.LaunchApp1), new B.TapKey(Letters.O))
  win_profile.layers[0].addRemapping(new T.KeyPress(WinKey.LaunchApp2), new B.TapKey(Letters.P))

  // Second layer
  win_profile.layers[0].addRemapping(new T.KeyPress(Function.F1), new B.SwapLayer(1))
  win_profile.layers[1].addRemapping(new T.KeyPress(Digits.Digit1), new B.TapKey(WinKey.WinLeft))
  win_profile.layers[1].addRemapping(new T.KeyPress(Digits.Digit2), new B.TapKey(WinKey.WinRight))
  win_profile.layers[1].addRemapping(
    new T.KeyPress(Digits.Digit3),
    new B.TapKey(WinKey.LeftControl)
  )
  win_profile.layers[1].addRemapping(
    new T.KeyPress(Digits.Digit4),
    new B.TapKey(WinKey.RightControl)
  )
  win_profile.layers[1].addRemapping(new T.KeyPress(Digits.Digit5), new B.TapKey(WinKey.LeftAlt))
  win_profile.layers[1].addRemapping(new T.KeyPress(Digits.Digit6), new B.TapKey(WinKey.RightAlt))
  win_profile.layers[1].addRemapping(new T.KeyPress(Digits.Digit7), new B.TapKey(WinKey.Menu))
  win_profile.layers[1].addRemapping(new T.KeyPress(WinKey.WinLeft), new B.TapKey(Letters.A))

  return win_profile
}

export function generateLinuxProfile(): Profile {
  const linux_profile = new Profile('Linux')
  linux_profile.OS = 'Linux'
  linux_profile.addLayer('layer1')

  // LinuxKey as binds (output)
  linux_profile.layers[0].addRemapping(
    new T.KeyPress(Digits.Digit1),
    new B.TapKey(LinuxKey.LeftSuper)
  )
  linux_profile.layers[0].addRemapping(
    new T.KeyPress(Digits.Digit2),
    new B.TapKey(LinuxKey.RightSuper)
  )
  linux_profile.layers[0].addRemapping(
    new T.KeyPress(Digits.Digit3),
    new B.TapKey(LinuxKey.LeftControl)
  )
  linux_profile.layers[0].addRemapping(
    new T.KeyPress(Digits.Digit4),
    new B.TapKey(LinuxKey.RightControl)
  )
  linux_profile.layers[0].addRemapping(
    new T.KeyPress(Digits.Digit5),
    new B.TapKey(LinuxKey.LeftAlt)
  )
  linux_profile.layers[0].addRemapping(
    new T.KeyPress(Digits.Digit6),
    new B.TapKey(LinuxKey.RightAlt)
  )
  linux_profile.layers[0].addRemapping(
    new T.KeyPress(Digits.Digit7),
    new B.TapKey(LinuxKey.Compose)
  )

  // LinuxKey as triggers (input)
  linux_profile.layers[0].addRemapping(
    new T.KeyPress(LinuxKey.XF86AudioPlay),
    new B.TapKey(Letters.A)
  )
  linux_profile.layers[0].addRemapping(
    new T.KeyPress(LinuxKey.XF86AudioNext),
    new B.TapKey(Letters.B)
  )
  linux_profile.layers[0].addRemapping(
    new T.KeyPress(LinuxKey.XF86AudioPrev),
    new B.TapKey(Letters.C)
  )
  linux_profile.layers[0].addRemapping(
    new T.KeyPress(LinuxKey.XF86AudioMute),
    new B.TapKey(Letters.D)
  )
  linux_profile.layers[0].addRemapping(
    new T.KeyPress(LinuxKey.XF86AudioRaiseVolume),
    new B.TapKey(Letters.E)
  )
  linux_profile.layers[0].addRemapping(
    new T.KeyPress(LinuxKey.XF86AudioLowerVolume),
    new B.TapKey(Letters.F)
  )
  linux_profile.layers[0].addRemapping(
    new T.KeyPress(LinuxKey.XF86HomePage),
    new B.TapKey(Letters.G)
  )
  linux_profile.layers[0].addRemapping(new T.KeyPress(LinuxKey.XF86Search), new B.TapKey(Letters.H))

  // Second layer
  linux_profile.layers[0].addRemapping(new T.KeyPress(Function.F1), new B.SwapLayer(1))
  linux_profile.layers[1].addRemapping(
    new T.KeyPress(Digits.Digit1),
    new B.TapKey(LinuxKey.LeftSuper)
  )
  linux_profile.layers[1].addRemapping(
    new T.KeyPress(Digits.Digit2),
    new B.TapKey(LinuxKey.RightSuper)
  )
  linux_profile.layers[1].addRemapping(
    new T.KeyPress(Digits.Digit3),
    new B.TapKey(LinuxKey.LeftControl)
  )
  linux_profile.layers[1].addRemapping(
    new T.KeyPress(Digits.Digit4),
    new B.TapKey(LinuxKey.RightControl)
  )
  linux_profile.layers[1].addRemapping(
    new T.KeyPress(Digits.Digit5),
    new B.TapKey(LinuxKey.LeftAlt)
  )
  linux_profile.layers[1].addRemapping(
    new T.KeyPress(Digits.Digit6),
    new B.TapKey(LinuxKey.RightAlt)
  )
  linux_profile.layers[1].addRemapping(
    new T.KeyPress(Digits.Digit7),
    new B.TapKey(LinuxKey.Compose)
  )
  linux_profile.layers[1].addRemapping(new T.KeyPress(LinuxKey.LeftSuper), new B.TapKey(Letters.A))

  return linux_profile
}

/// @todo Generate tests for recursive bind translation
export function generateRecursiveBindProfile(): Profile {
  const profile = new Profile('Recursive Binds')
  profile.OS = 'macOS'

  const t1 = new T.KeyPress(Letters.A)
  const b1 = new B.Macro([
    new B.Macro([new B.TapKey(MacKey.CommandLeft), new B.TapKey(MacKey.CommandRight)]),
    new B.TapKey(MacKey.OptionLeft)
  ])
  profile.layers[0].addRemapping(t1, b1)

  return profile
}

export function generateSmallShortcutProfileWindows(): Profile {
  const profile = new Profile('Windows Shortcuts')
  profile.OS = 'Windows'
  profile.addLayer('layer1')

  const t1 = new T.KeyPress(Letters.A)
  const b1 = new B.TapKey(ShortcutAction.Copy)
  profile.layers[0].addRemapping(t1, b1)

  const t2 = new T.KeyPress(Letters.B)
  const b2 = new B.Macro([new B.TapKey(ShortcutAction.Cut), new B.TapKey(ShortcutAction.Paste)])
  profile.layers[1].addRemapping(t2, b2)

  return profile
}

export function generateSmallShortcutProfileLinux(): Profile {
  const profile = new Profile('Linux Shortcuts')
  profile.OS = 'Linux'
  profile.addLayer('layer1')

  const t1 = new T.KeyPress(Letters.A)
  const b1 = new B.TapKey(ShortcutAction.Copy)
  profile.layers[0].addRemapping(t1, b1)

  const t2 = new T.KeyPress(Letters.B)
  const b2 = new B.Macro([new B.TapKey(ShortcutAction.Cut), new B.TapKey(ShortcutAction.Paste)])
  profile.layers[1].addRemapping(t2, b2)

  return profile
}

export function generateSmallShortcutProfileMac(): Profile {
  const profile = new Profile('macOS Shortcuts')
  profile.OS = 'macOS'
  profile.addLayer('layer1')

  const t1 = new T.KeyPress(Letters.A)
  const b1 = new B.TapKey(ShortcutAction.Copy)
  profile.layers[0].addRemapping(t1, b1)

  const t2 = new T.KeyPress(Letters.B)
  const b2 = new B.Macro([new B.TapKey(ShortcutAction.Cut), new B.TapKey(ShortcutAction.Paste)])
  profile.layers[1].addRemapping(t2, b2)

  return profile
}
