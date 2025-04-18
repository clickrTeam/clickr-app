import { Trigger, deserializeTrigger } from "./Trigger"
export enum BindType {
  Tap = 'tap_bind',
  Combo = 'combo_bind',
  Macro = 'macro_bind',
  TimedMacro = 'timed_macro_bind',
  Repeat = 'repeat_bind',
  SwapLayer = 'swap_layer_bind',
  AppOpen = 'app_open_bind'
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
  abstract equals(other: Bind): boolean
}

/**
 * The simplest kind of bind, just activates one key.
 */
export class Tap_Bind extends Bind {
  value: string

  constructor(value: string) {
    super(BindType.Tap)
    this.value = value
  }

  toJSON(): object {
    return {
      type: BindType.Tap,
      value: this.value
    }
  }

  static fromJSON(obj: { value: string }): Tap_Bind {
    return new Tap_Bind(obj.value)
  }

  equals(other: Bind): boolean {
    return other instanceof Tap_Bind && this.value === other.value
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

  equals(other: Bind): boolean {
    return (
      other instanceof Combo_Bind &&
      this.values.length === other.values.length &&
      this.values.every((v, i) => v === other.values[i])
    )
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

  equals(other: Bind): boolean {
    return (
      other instanceof Macro_Bind &&
      this.binds.length === other.binds.length &&
      this.binds.every((b, i) => b.equals(other.binds[i]))
    )
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

  equals(other: Bind): boolean {
    return (
      other instanceof TimedMacro_Bind &&
      this.binds.length === other.binds.length &&
      this.times.length === other.times.length &&
      this.binds.every((b, i) => b.equals(other.binds[i])) &&
      this.times.every((t, i) => t === other.times[i])
    )
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

  static fromJSON(obj: {
    value: object
    time_delay: number
    times_to_execute: number
    cancel_trigger: object
  }): Repeat_Bind {
    return new Repeat_Bind(
      deserializeBind(obj.value),
      obj.time_delay,
      obj.times_to_execute,
      deserializeTrigger(obj.cancel_trigger)
    )
  }

  equals(other: Bind): boolean {
    return (
      other instanceof Repeat_Bind &&
      this.value.equals(other.value) &&
      this.time_delay === other.time_delay &&
      this.times_to_execute === other.times_to_execute &&
      this.cancel_trigger.equals(other.cancel_trigger)
    )
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

  equals(other: Bind): boolean {
    return other instanceof SwapLayer_Bind && this.layer_num === other.layer_num
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

  equals(other: Bind): boolean {
    return other instanceof AppOpen_Bind && this.app_name === other.app_name
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deserializeBind(obj: any): Bind {
  switch (obj.type) {
    case 'tap_bind':
      return new Tap_Bind(obj.value)
    case 'combo_bind':
      return new Combo_Bind(obj.values)
    case 'macro_bind':
      return new Macro_Bind(obj.binds.map(deserializeBind))
    case 'timed_macro_bind':
      return new TimedMacro_Bind(obj.binds.map(deserializeBind), obj.times)
    case 'repeat_bind':
      return new Repeat_Bind(
        deserializeBind(obj.value),
        obj.time_delay,
        obj.times_to_execute,
        deserializeTrigger(obj.cancel_trigger)
      )
    case 'swap_layer_bind':
      return new SwapLayer_Bind(obj.layer_num)
    case 'app_open_bind':
      return new AppOpen_Bind(obj.app_name)
    default:
      throw new Error(`Unknown Bind type: ${obj.type}`)
  }
}
