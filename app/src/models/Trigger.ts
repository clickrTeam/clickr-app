import log from 'electron-log'
import { LLAdvancedTrigger, LLBasicTrigger, LLBehavior } from './LowLevelProfile'

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
/**
 * Represents a physical key on the keyboard
 */
export abstract class Trigger {
  trigger_type: TriggerType

  constructor(trig_type: TriggerType) {
    this.trigger_type = trig_type
  }

  abstract toJSON(): object
  abstract toLL(): LLBasicTrigger | { triggers: LLAdvancedTrigger[], behavior: LLBehavior }
  abstract equals(other: Trigger): boolean
  abstract toString(): string
}

/**
 * Represents pressing a key
 */
export class KeyPress extends Trigger {
  value: string

  constructor(value: string) {
    super(TriggerType.KeyPress)
    this.value = value
  }

  toJSON(): object {
    return {
      type: TriggerType.KeyPress,
      value: this.value
    }
  }

  static fromJSON(obj: { value: string }): KeyPress {
    return new KeyPress(obj.value)
  }

  equals(other: Trigger): boolean {
    return other instanceof KeyPress && this.value === other.value
  }

  toString(): string {
    return `Press: ${this.value}`
  }

  toLL(): LLBasicTrigger | { triggers: LLAdvancedTrigger[], behavior: LLBehavior } {
    return { "type": "key_press", "value": this.value };
  }
}

/**
 * Represents releasing a key
 */
export class KeyRelease extends Trigger {
  value: string

  constructor(value: string) {
    super(TriggerType.KeyRelease)
    this.value = value
  }

  toJSON(): object {
    return {
      type: TriggerType.KeyRelease,
      value: this.value
    }
  }

  static fromJSON(obj: { value: string }): KeyRelease {
    return new KeyRelease(obj.value)
  }

  equals(other: Trigger): boolean {
    return other instanceof KeyRelease && this.value === other.value
  }

  toString(): string {
    return `Release: ${this.value}`
  }

  toLL(): LLBasicTrigger | { triggers: LLAdvancedTrigger[], behavior: LLBehavior } {
    return { "type": "key_release", "value": this.value };
  }
}

/**
 * A timed trigger will be used to represent a sequence of taps
 */
export class TapSequence extends Trigger {
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
  behavior: TimedTriggerBehavior

  constructor(
    key_time_pairs: [string, number][],
    behavior: TimedTriggerBehavior = TimedTriggerBehavior.Default
  ) {
    super(TriggerType.TapSequence)
    this.key_time_pairs = key_time_pairs
    this.behavior = behavior
  }

  toJSON(): object {
    return {
      type: TriggerType.TapSequence,
      key_time_pairs: this.key_time_pairs,
      behavior: this.behavior
    }
  }

  static fromJSON(obj: { key_time_pairs: [string, number][]; behavior: string }): TapSequence {
    let behavior: TimedTriggerBehavior

    if (obj.behavior === TimedTriggerBehavior.Capture) {
      behavior = TimedTriggerBehavior.Capture
    } else if (obj.behavior === TimedTriggerBehavior.Release) {
      behavior = TimedTriggerBehavior.Release
    } else if (obj.behavior === TimedTriggerBehavior.Default) {
      behavior = TimedTriggerBehavior.Default
    } else {
      log.info(`Unknown behavior "${obj.behavior}", defaulting to TimedTriggerBehavior.Default`)
      behavior = TimedTriggerBehavior.Default
    }

    return new TapSequence(obj.key_time_pairs, behavior)
  }

  equals(other: Trigger): boolean {
    return (
      other instanceof TapSequence &&
      this.behavior == other.behavior &&
      this.key_time_pairs.length === other.key_time_pairs.length &&
      this.key_time_pairs.every(
        ([k, t], i) => k === other.key_time_pairs[i][0] && t === other.key_time_pairs[i][1]
      )
    )
  }

  toString(): string {
    return `Tap: ${this.key_time_pairs.map((key) => key[0]).join(' + ')}`
  }

  toLL(): LLBasicTrigger | { triggers: LLAdvancedTrigger[], behavior: LLBehavior } {
    let triggers: LLAdvancedTrigger[] = [];
    for (const [key, time] of this.key_time_pairs) {
      triggers.push({
        type: "key_press",
        value: key,
      })
      triggers.push({
        type: "key_release",
        value: key,
      })
      triggers.push({
        type: "maximum_wait",
        value: time,
      })
    }

    return {
      behavior: this.behavior,
      triggers: triggers,
    };
  }
}

/**
 * Represents a trigged by pressing and holding a key.
 */
export class Hold extends Trigger {
  toString(): string {
    throw new Error('Method not implemented.')
  }
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

  static fromJSON(obj: { value: string; wait: number }): Hold {
    return new Hold(obj.value, obj.wait)
  }

  equals(other: Trigger): boolean {
    return other instanceof Hold && this.value === other.value && this.wait === other.wait
  }

  toLL(): LLBasicTrigger | { triggers: LLAdvancedTrigger[]; behavior: LLBehavior } {
    throw new Error('Method not implemented.')
  }
}

/**
 * This only applies when a certain application is running.
 */
export class AppFocus extends Trigger {
  toString(): string {
    throw new Error('Method not implemented.')
  }
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


  static fromJSON(obj: { app_name: string; value: string }): AppFocus {
    return new AppFocus(obj.app_name, obj.value)
  }

  equals(other: Trigger): boolean {
    return (
      other instanceof AppFocus && this.app_name === other.app_name && this.value === other.value
    )
  }

  toLL(): LLBasicTrigger | { triggers: LLAdvancedTrigger[]; behavior: LLBehavior } {
    throw new Error('Method not implemented.')
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deserializeTrigger(obj: any): Trigger {
  switch (obj.type) {
    case TriggerType.KeyPress:
      return KeyPress.fromJSON(obj)
    case TriggerType.KeyRelease:
      return KeyRelease.fromJSON(obj)
    case TriggerType.TapSequence:
      return TapSequence.fromJSON(obj)
    case TriggerType.Hold:
      return Hold.fromJSON(obj)
    case TriggerType.AppFocused:
      return AppFocus.fromJSON(obj)
    default:
      throw new Error(`Unknown Trigger type: ${obj.type}`)
  }
}
