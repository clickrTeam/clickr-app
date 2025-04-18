export enum TriggerType {
  Tap = 'link_trigger',
  Timed = 'timed_trigger',
  Hold = 'hold_trigger',
  AppFocused = 'app_focus_trigger'
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
  abstract equals(other: Trigger): boolean
}

/**
 * A link trigger is the simplest kind of trigger. It represents a single key press, think 'tap'.
 */
export class Tap_Trigger extends Trigger {
  value: string

  constructor(value: string) {
    super(TriggerType.Tap)
    this.value = value
  }

  toJSON(): object {
    return {
      type: TriggerType.Tap,
      value: this.value
    }
  }

  static fromJSON(obj: { value: string }): Tap_Trigger {
    return new Tap_Trigger(obj.value)
  }

  equals(other: Trigger): boolean {
    return other instanceof Tap_Trigger && this.value === other.value
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

  equals(other: Trigger): boolean {
    return (
      other instanceof Timed_Trigger &&
      this.capture === other.capture &&
      this.release === other.release &&
      this.key_time_pairs.length === other.key_time_pairs.length &&
      this.key_time_pairs.every(
        ([k, t], i) => k === other.key_time_pairs[i][0] && t === other.key_time_pairs[i][1]
      )
    )
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

  equals(other: Trigger): boolean {
    return other instanceof Hold_Trigger && this.value === other.value && this.wait === other.wait
  }
}

/**
 * This only applies when a certain application is running.
 */
export class App_Focus_Trigger extends Trigger {
  app_name: string
  value: string

  constructor(app_name: string, value: string) {
    super(TriggerType.AppFocused)
    this.app_name = app_name
    this.value = value
  }

  toJSON(): object {
    return {
      type: TriggerType.AppFocused,
      app_name: this.app_name,
      value: this.value
    }
  }

  static fromJSON(obj: { app_name: string; value: string }): App_Focus_Trigger {
    return new App_Focus_Trigger(obj.app_name, obj.value)
  }

  equals(other: Trigger): boolean {
    return (
      other instanceof App_Focus_Trigger &&
      this.app_name === other.app_name &&
      this.value === other.value
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deserializeTrigger(obj: any): Trigger {
  switch (obj.type) {
    case 'link_trigger':
      return Tap_Trigger.fromJSON(obj)
    case 'timed_trigger':
      return Timed_Trigger.fromJSON(obj)
    case 'hold_trigger':
      return new Hold_Trigger(obj.value, obj.wait)
    case 'app_focus_trigger':
      return new App_Focus_Trigger(obj.app_name, obj.value)
    default:
      throw new Error(`Unknown Trigger type: ${obj.type}`)
  }
}
