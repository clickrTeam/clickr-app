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
/**
 * Represents a physical key on the keyboard
 */
export abstract class Trigger {
  trigger_type: TriggerType

  constructor(trig_type: TriggerType) {
    this.trigger_type = trig_type
  }

  abstract toJSON(): object
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

  toJSON(): object {
    return {
      type: TriggerType.Link,
      value: this.value
    }
  }

  static fromJSON(obj: { value: string }): Link_Trigger {
    return new Link_Trigger(obj.value)
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

  toJSON(): object {
    return {
      type: TriggerType.Timed,
      key_time_pairs: this.key_time_pairs,
      capture: this.capture,
      release: this.release
    }
  }

  static fromJSON(obj: {
    key_time_pairs: [string, number][]
    capture: boolean
    release: boolean
  }): Timed_Trigger {
    return new Timed_Trigger(obj.key_time_pairs, obj.capture, obj.release)
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

  toJSON(): object {
    return {
      type: TriggerType.Hold,
      value: this.value,
      wait: this.wait
    }
  }

  static fromJSON(obj: { value: string; wait: number }): Hold_Trigger {
    return new Hold_Trigger(obj.value, obj.wait)
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

  toJSON(): object {
    return {
      type: TriggerType.AppFocused,
      app_name: this.app_name
    }
  }

  static fromJSON(obj: { app_name: string }): App_Focus_Trigger {
    return new App_Focus_Trigger(obj.app_name)
  }
}

/**
 * Represents the desired bind to be associated with a key
 */
export abstract class Bind {
  /**
   * Type of the bind. Tap, macro, double tap, etc.
   */
  bind_type: BindType

  constructor(bind_type: BindType) {
    this.bind_type = bind_type
  }

  abstract toJSON(): object
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

  toJSON(): object {
    return {
      type: BindType.Link,
      value: this.value
    }
  }

  static fromJSON(obj: { value: string }): Link_Bind {
    return new Link_Bind(obj.value)
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

  toJSON(): object {
    return {
      type: BindType.Combo,
      values: this.values
    }
  }

  static fromJSON(obj: { values: string[] }): Combo_Bind {
    return new Combo_Bind(obj.values)
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

  toJSON(): { type: BindType; binds: object[] } {
    return {
      type: BindType.Macro,
      binds: this.binds.map((bind) => bind.toJSON())
    }
  }

  static fromJSON(obj: { binds: object[] }): Macro_Bind {
    return new Macro_Bind(obj.binds.map(deserializeBind))
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

  toJSON(): object {
    return {
      type: BindType.TimedMacro,
      binds: this.binds.map((bind) => bind.toJSON()),
      times: this.times
    }
  }

  static fromJSON(obj: { binds: object[]; times: number[] }): TimedMacro_Bind {
    return new TimedMacro_Bind(obj.binds.map(deserializeBind), obj.times)
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

  toJSON(): object {
    return {
      type: BindType.Repeat,
      value: this.value.toJSON(),
      time_delay: this.time_delay,
      times_to_execute: this.times_to_execute,
      cancel_trigger: this.cancel_trigger.toJSON()
    }
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

  toJSON(): object {
    return {
      type: BindType.SwapLayer,
      layer_num: this.layer_num
    }
  }

  static fromJSON(obj: { layer_num: number }): SwapLayer_Bind {
    return new SwapLayer_Bind(obj.layer_num)
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

  toJSON(): object {
    return {
      type: BindType.AppOpen,
      app_name: this.app_name
    }
  }

  static fromJSON(obj: { app_name: string }): AppOpen_Bind {
    return new AppOpen_Bind(obj.app_name)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deserializeTrigger(obj: any): Trigger {
  switch (obj.type) {
    case 'Link_Trigger':
      return Link_Trigger.fromJSON(obj)
    case 'Timed_Trigger':
      return Timed_Trigger.fromJSON(obj)
    case 'Hold_Trigger':
      return new Hold_Trigger(obj.value, obj.wait)
    case 'App_Focus_Trigger':
      return new App_Focus_Trigger(obj.app_name)
    default:
      throw new Error(`Unknown Trigger type: ${obj.type}`)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deserializeBind(obj: any): Bind {
  switch (obj.type) {
    case 'Link_Bind':
      return new Link_Bind(obj.value)
    case 'Combo_Bind':
      return new Combo_Bind(obj.values)
    case 'Macro_Bind':
      return new Macro_Bind(obj.binds.map(deserializeBind))
    case 'TimedMacro_Bind':
      return new TimedMacro_Bind(obj.binds.map(deserializeBind), obj.times)
    case 'Repeat_Bind':
      return new Repeat_Bind(
        deserializeBind(obj.value),
        obj.time_delay,
        obj.times_to_execute,
        deserializeTrigger(obj.cancel_trigger)
      )
    case 'SwapLayer_Bind':
      return new SwapLayer_Bind(obj.layer_num)
    case 'AppOpen_Bind':
      return new AppOpen_Bind(obj.app_name)
    default:
      throw new Error(`Unknown Bind type: ${obj.type}`)
  }
}
