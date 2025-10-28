export enum BindType {
  PressKey = 'press_key',
  ReleaseKey = 'release_key',
  TapKey = 'tap_key',
  SwitchLayer = 'switch_layer',
  Macro = 'macro',

  // Not handled by Daemon
  TimedMacro = 'timed_macro_bind',
  Repeat = 'repeat_bind',
  AppOpen = 'app_open_bind'
}


export enum TriggerType {
  KeyPress = 'key_press',
  KeyRelease = 'key_release',
  TapSequence = 'tap_sequence',

  // not sure if different from tap tap_sequence
  // Timed = 'timed_trigger',

  // Not implemented in daemon
  Hold = 'hold_trigger',
  AppFocused = 'app_focus_trigger'
}
export enum TimedTriggerBehavior {
  // Capture and release. probably a better name but this seems ok
  Default = 'default',
  Capture = 'capture',
  Release = 'release'
}
