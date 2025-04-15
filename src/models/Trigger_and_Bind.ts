export enum BindType {
  Link = 'link',
  Combo = 'combo',
  Macro = 'macro',
  TimedMacro = 'timed_macro',
  Repeat = 'repeat',
  SwapLayer = 'swap_layer',
  AppOpen = 'app_open'
}

export enum TriggerType {
  Link = 'link',
  Timed = 'timed',
  Hold = 'hold',
  AppFocused = 'app_focused'
}
//TODO: Remove label & physical key from Trigger. Add constructor. Add map/dictionary that will produce a label from a trigger value.

/**
 * Represents a physical key on the keyboard
 */
export class Trigger {
  trigger_type: TriggerType
  
  constructor(trig_type: TriggerType) {
    this.trigger_type = trig_type
  }
}

/**
 * A link trigger is the simplest kind of trigger. It represents a single key press, think 'tap'.
 */
export class Link_Trigger extends Trigger {
  value: string

  constructor(value: string) {
    super(TriggerType.Link)
    this.value = value
  }
}

/**
 * A timed trigger will be used to represent double and triple taps.
 * A double tap will have 2 elements in the key_time_pairs list, a triple will have 3, etc.
 */
export class Timed_Trigger extends Trigger {
  /**
   * This is represented as a list of tuples. Each tuple is a key, time pair.
   * The time is a delay before moving on to the next key time pair.
   * The value of the last time delay does not matter.
   */
  key_time_pairs: [string, number][]

  /**
   * 1. Default behavior is both capture and release are true.
   *    Example:  If you tap 't', you will get 't' later.
   *              If you double tap 't', you will get 'r'.
   *              If you tap too slow, you get 'tt'.
   * 2. If release is true and capture is false:
   *        if you press 't' you will immediately get 't'.
   *        If you double tap 't', you will get 'ttr'.
   *        If you tap too slow, you get 'tt'.
   * 3. If capture is true and release is not, the key will never go through.
   *        For example: double tap 't' -> 'r', when you press 't' twice you just get 'r'
   *        if you press 't', you won't get anything
   */
  capture: boolean
  release: boolean

  constructor(
    key_time_pairs: [string, number][],
    capture: boolean = true,
    release: boolean = true
  ) {
    super(TriggerType.Timed)
    this.key_time_pairs = key_time_pairs
    this.capture = capture
    this.release = release
  }
}

/**
 * Represents a trigged by pressing and holding a key.
 */
export class Hold_Trigger extends Trigger {
  value: string
  wait: number

  constructor(value: string, wait: number) {
    super(TriggerType.Hold)
    this.value = value
    this.wait = wait
  }
}

/**
 * This only applies when a certain application is running.
 */
export class App_Focus_Trigger extends Trigger {
  app_name: string

  constructor(app_name: string) {
    super(TriggerType.AppFocused)
    this.app_name = app_name
  }
}

/**
 * Represents the desired bind to be associated with a key
 */
export class Bind {
  /**
   * Type of the bind. Tap, macro, double tap, etc.
   */
  bind_type: BindType

  constructor(bind_type: BindType) {
    this.bind_type = bind_type
  }
}

/**
 * The simplest kind of bind, just activates one key.
 */
export class Link_Bind extends Bind {
  value: string

  constructor(value: string) {
    super(BindType.Link)
    this.value = value
  }
}

/**
 * Represents multiple keys being pressed at once. ['Ctrl', 'Alt', 'Del']
 */
export class Combo_Bind extends Bind {
  /**
   * The values that will be remapped to. Will be multiple: ['Ctrl', 'V']
   */
  values: string[]

  /**
   * Instantiates a Combo object
   * @param bind_type 'Combo'
   * @param values A list of values to be remapped to
   */
  constructor(values: string[]) {
    super(BindType.Combo)
    this.values = values
  }
}

/**
 * A combination of different types of binds. Can be link and combo, combo and repeat, etc.
 */
export class Macro_Bind extends Bind {
  binds: Bind[]

  constructor(binds: Bind[]) {
    super(BindType.Macro)
    this.binds = binds
  }
}

/**
 * A macro where there are time delays between each bind. Each time delay can be different.
 */
export class TimedMacro_Bind extends Bind {
  binds: Bind[]
  times: number[]

  constructor(binds: Bind[], times: number[]) {
    super(BindType.TimedMacro)
    this.binds = binds
    this.times = times
  }
}

/**
 * A bind that will repeat a certain number of times with or without a delay.
 */
export class Repeat_Bind extends Bind {
  value: Bind

  /**
   * The amount of time between each execution of the bind
   */
  time_delay: number

  /**
   * The amount of times the bind will execute
   */
  times_to_execute: number

  /**
   * A trigger that can be pressed in order to stop the repeating bind.
   */
  cancel_trigger: Trigger

  constructor(value: Bind, time_delay: number, times_to_execute: number, cancel_trigger: Trigger) {
    super(BindType.Repeat)
    this.value = value
    this.time_delay = time_delay
    this.times_to_execute = times_to_execute
    this.cancel_trigger = cancel_trigger
  }
}

/**
 * Swaps to a different layer such that new triggers and binds are accessible.
 */
export class SwapLayer_Bind extends Bind {
  layer_num: number

  constructor(layer_num: number) {
    super(BindType.SwapLayer)
    this.layer_num = layer_num
  }
}

/**
 * Opens an application of the user's choice.
 */
export class AppOpen_Bind extends Bind {
  app_name: string

  constructor(app_name: string) {
    super(BindType.AppOpen)
    this.app_name = app_name
  }
}
