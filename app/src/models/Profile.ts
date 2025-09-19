/* eslint-disable @typescript-eslint/no-explicit-any */
import { Layer } from './Layer'
import * as T from './Trigger'
import * as B from './Bind'
import { MacKey, WinKey, LinuxKey, ShortcutAction } from './Keys'
import log from 'electron-log'
/**
 * Represents an entire profile that can contain many layers.
 */
export class Profile {
  /**
   * The name of the profile, most likely the user's name. "YourName"
   */
  profile_name: string

  /**
   * Contains all of the layers associated with a profile
   */
  layers: Layer[]

  /**
   * Tracks the number of layers in the profile
   */
  layer_count: number

  /**
   * The operating system this profile was created on.
   * This is used for translating keys between OSes.
   */
  OS: string

  /**
   * Creates an instance of a profile
   * @param profile_name: The name associated with the profile
   */
  constructor(profile_name: string) {
    this.profile_name = profile_name
    this.layers = []
    this.layer_count = 0

    this.addLayer('layer 0')
    this.addLayer('layer 0')
    this.OS = detectOS()
    if (this.OS === 'Unknown') {
      this.OS = 'Error: Unknown OS'
      log.warn(`Unknown OS when creating profile ${this.profile_name}`)
    }
    log.info(`Profile "${this.profile_name}" created with initial layer "layer 0". OS: ${this.OS}`)
  }

  /**
   * Adds a new layer to the profile so the user can customize it.
   * @param layer_name: The name associated with the layer. "Photoshop"
   */
  addLayer(layer_name: string): void {
    const lyr = new Layer(layer_name, this.layer_count)
    this.layers.push(lyr)
    this.layer_count += 1

    log.info(`Layer ${layer_name} with number ${this.layer_count - 1} created.`)
    //TODO: Add support for cloning layer 0 when you want to create a new layer.
  }

  /**
   * Removes a layer from the profile, effectively deleting it.
   * @param layer_number The number associated with the layer to be removed. layer_number is unique and as such is used instead of layer_name
   * @returns True if the layer number was found and the layer removed, false otherwise
   */
  removeLayer(layer_number: number): boolean {
    const index = this.layers.findIndex((layer) => layer.layer_number === layer_number)
    let deletion_successful = false
    // not found
    if (index === -1) {
      log.warn(`Attempted to remove layer ${layer_number} and that does not exist in layer array.`)
    } else if (this.layers.length === 1) {
      log.warn('Attempted to remove the only layer. User should delete profile instead.')
    } else {
      // Remove the layer
      this.layers.splice(index, 1)

      // Decrement layer_numbers for layers after the removed one
      for (let i = index; i < this.layers.length; i++) {
        this.layers[i].layer_number -= 1
      }

      this.layer_count -= 1
      log.info(`Layer ${layer_number} removed successfully.`)
      deletion_successful = true
    }

    return deletion_successful
  }

  /**
   * Swaps the layer's positions in the layer array.
   * @param num1 The layer_number of the first layer to be swapped
   * @param num2 The layer_number of the second layer to be swapped
   * @returns True if the layers were able to be swapped, false otherwise
   */
  swapLayers(num1: number, num2: number): boolean {
    if (num1 === num2) return false // nothing to swap

    const index1 = this.layers.findIndex((layer) => layer.layer_number === num1)
    const index2 = this.layers.findIndex((layer) => layer.layer_number === num2)

    if (index1 === -1 || index2 === -1) {
      log.warn(`Attempted to swap layers ${num1} and ${num2}, but one or both do not exist.`)
      return false // one or both layers not found
    }

    // Swap the positions in the array
    const temp = this.layers[index1]
    this.layers[index1] = this.layers[index2]
    this.layers[index2] = temp

    // Also swap their layer_number fields to keep them correct
    this.layers[index1].layer_number = num1
    this.layers[index2].layer_number = num2

    log.info(`Layers ${num1} and ${num2} swapped successfully.`)
    return true
  }

  /**
   * NOTE: Just for testing JSON structure.
   */
  ADD_TEST_LAYER(test_layer_name: string): void {
    this.addLayer(test_layer_name)
    // Map a to b
    this.layers[1].addRemapping(new T.KeyPress('A'), new B.PressKey('B'))
    this.layers[1].addRemapping(new T.KeyRelease('A'), new B.ReleaseKey('B'))

    this.layers[1].addRemapping(
      new T.TapSequence([
        ['Q', 300],
        ['Q', 300]
      ]),
      new B.TapKey('T')
    )

    // const del_f1 = new T.TapSequence(
    //   [
    //     ['F1', 1],
    //     ['F1', 2]
    //   ],
    //   T.TimedTriggerBehavior.Default
    // )
    // const del_f1_bind = new B.Combo(['Ctrl', 'C'])
    // this.layers[1].addRemapping(del_f1, del_f1_bind)
    //
    // //Test deletion and adding
    // const new_f1 = new T.TapSequence(
    //   [
    //     ['F1', 1],
    //     ['F1', 3]
    //   ],
    //   true,
    //   true
    // )
    // const new_f1_bind = new B.Combo(['Ctrl', 'V'])
    // this.layers[1].deleteRemapping(del_f1)
    // this.layers[1].addRemapping(new_f1, new_f1_bind)
    //
    // const old_f2 = new T.KeyPress('F2')
    // const new_f2 = new T.Hold('F2', 99)
    // const macro1 = new B.TapKey('A')
    // const macro2 = new B.Combo(['Space', 'B', 'C'])
    // const new_f2_bind = new B.Macro_Bind([macro1, macro2])
    // this.layers[1].deleteRemapping(old_f2)
    // this.layers[1].addRemapping(new_f2, new_f2_bind)
    //
    // const old_f3 = new T.KeyPress('F3')
    // const new_f3 = new T.AppFocus('Photoshop', 'F3')
    // const new_f3_bind = new B.TimedMacro_Bind([macro1, macro2], [1, 2])
    // this.layers[1].deleteRemapping(old_f3)
    // this.layers[1].addRemapping(new_f3, new_f3_bind)
    //
    // const old_f4 = new T.KeyPress('F4')
    // const new_f4 = new T.KeyPress('F4')
    // const cancel_trg = new T.KeyPress('Escape')
    // const rpt_bnd = new B.TapKey('Enter')
    // const new_f4_bind = new B.Repeat_Bind(rpt_bnd, 11, 22, cancel_trg)
    // this.layers[1].deleteRemapping(old_f4)
    // this.layers[1].addRemapping(new_f4, new_f4_bind)
    //
    // const old_f5 = new T.KeyPress('F5')
    // const new_f5 = new T.KeyPress('F5')
    // const new_f5_bind = new B.SwapLayer(0)
    // this.layers[1].deleteRemapping(old_f5)
    // this.layers[1].addRemapping(new_f5, new_f5_bind)
    //
    // const old_f6 = new T.KeyPress('F6')
    // const new_f6 = new T.KeyPress('F6')
    // const new_f6_bind = new B.AppOpen_Bind('Google Chrome')
    // this.layers[1].deleteRemapping(old_f6)
    // this.layers[1].addRemapping(new_f6, new_f6_bind)
  }

  /**
   * Serializes the Profile instance to a JSON-compatible object.
   */
  toJSON(): object {
    log.info(`Serialization of profile "${this.profile_name}" started.`)
    return {
      profile_name: this.profile_name,
      layer_count: this.layer_count,
      OS: this.OS,
      layers: this.layers.map((layer: Layer) => layer.toJSON())
    }
  }

  /**
   * Deserializes a JSON-compatible object into a Profile instance.
   * @param obj - The JSON object to deserialize.
   * @returns A Profile instance.
   * @throws Error if the JSON is malformed.
   */
  static fromJSON(obj: any): Profile {
    // Validate the essential properties
    if (typeof obj !== 'object' || obj === null) {
      log.error('Profile JSON is not an object or is null.')
      throw new Error('Profile JSON is not an object')
    }
    if (typeof obj.profile_name !== 'string') {
      log.error('Profiles name is missing or is invalid.')
      throw new Error("Profile JSON missing or invalid 'profile_name'")
    }
    if (!Array.isArray(obj.layers)) {
      log.error('Profile JSON missing or invalid layers')
      throw new Error("Profile JSON missing or invalid 'layers'")
    }

    // Create the Profile instance using the profile name
    const profile = new Profile(obj.profile_name)

    // Deserialize the layers and override defaults if needed.
    profile.layers = obj.layers.map((layerObj: any) => Layer.fromJSON(layerObj))
    profile.layer_count = profile.layers.length

    if (profile.OS !== obj.OS) {
      log.info(
        `Profile OS "${obj.OS}" does not match current OS "${profile.OS}". Translating keys to current OS.`
      )
      profile.translateToCurrentOS(obj.OS)
    }

    log.info(
      `Deserialization of profile "${profile.profile_name}" completed with ${profile.layer_count} layers.`
    )
    return profile
  }

  /**
   * Checks whether the incoming OS is valid, and if so begins the translation process.
   * @param incoming_OS The OS the read profile was created on.
   */
  private translateToCurrentOS(incoming_OS: string): void {
    let valid_incoming_OS = false
    if (incoming_OS === 'Linux' || incoming_OS === 'Windows' || incoming_OS === 'macOS') {
      valid_incoming_OS = true
    }
    if (valid_incoming_OS) {
      // Iterate through layers and remappings to translate keys
      this.iterateForTranslation(incoming_OS)
    } else {
      log.warn(`Incoming profile has unknown OS "${incoming_OS}", cannot translate to ${this.OS}.`)
    }
  }

  private iterateForTranslation(incoming_OS: string): void {
    log.info(`Translating profile from ${incoming_OS} to ${this.OS}.`)

    for (const layer of this.layers) {
      for (const [trigger, bind] of layer.remappings) {
        // Translate Trigger keys
        if (
          trigger instanceof T.KeyPress ||
          trigger instanceof T.KeyRelease ||
          trigger instanceof T.Hold ||
          trigger instanceof T.AppFocus
        ) {
          trigger.value = this.processRemapValue(trigger.value, incoming_OS)
        } else if (trigger instanceof T.TapSequence) {
          for (const pair of trigger.key_time_pairs) {
            pair[0] = this.processRemapValue(pair[0], incoming_OS)
          }
        } else {
          log.warn(
            `Unknown trigger type during ${incoming_OS} to ${this.OS} translation. Trigger: ${trigger.toString()}`
          )
        }

        // Translate Bind keys
        if (
          bind instanceof B.PressKey ||
          bind instanceof B.ReleaseKey ||
          bind instanceof B.TapKey
        ) {
          bind.value = this.processRemapValue(bind.value, incoming_OS)
        }
        // Need recursive call here for array of nested binds
        else if (bind instanceof B.Macro_Bind || bind instanceof B.TimedMacro_Bind) {
          for (const single_bind of bind.binds) {
            this.processBindRecursive(single_bind, incoming_OS)
          }
        }
        // Need recursive call here for nested bind
        else if (bind instanceof B.Repeat_Bind) {
          this.processBindRecursive(bind.value, incoming_OS)
        } else {
          log.warn(
            `Unknown bind type during ${incoming_OS} to ${this.OS} translation. Bind: ${bind.toString()}`
          )
        }
      }
    }
  }

  private processRemapValue(val: string, incoming_OS: string): string {
    let new_trigger_value = ''
    if (this.OS === 'Linux') {
      if (incoming_OS === 'Windows') {
        new_trigger_value = this.windowsToLinux(val)
      } else if (incoming_OS === 'macOS') {
        new_trigger_value = this.macToLinux(val)
      } else {
        log.warn(
          `Incoming profile has unknown OS "${incoming_OS}", cannot translate to ${this.OS}.`
        )
      }
    } else if (this.OS === 'Windows') {
      if (incoming_OS === 'Linux') {
        new_trigger_value = this.linuxToWindows(val)
      } else if (incoming_OS === 'macOS') {
        new_trigger_value = this.macToWindows(val)
      } else {
        log.warn(
          `Incoming profile has unknown OS "${incoming_OS}", cannot translate to ${this.OS}.`
        )
      }
    } else if (this.OS === 'macOS') {
      if (incoming_OS === 'Linux') {
        new_trigger_value = this.linuxToMac(val)
      } else if (incoming_OS === 'Windows') {
        new_trigger_value = this.windowsToMac(val)
      } else {
        log.warn(
          `Incoming profile has unknown OS "${incoming_OS}", cannot translate to ${this.OS}.`
        )
      }
    }
    return new_trigger_value
  }

  /**
   * Returns the value of a trigger or bind translated from Linux to Windows.
   * @param old_value The trigger / bind value to be translated.
   * @returns The translated value for the current OS.
   */
  private linuxToWindows(old_value: string): string {
    let new_value = ''
    return new_value
  }

  /**
   * Returns the value of a trigger or bind translated from Linux to macOS.
   * @param old_value The trigger / bind value to be translated.
   * @returns The translated value for the current OS.
   */
  private linuxToMac(old_value: string): string {
    let new_value = ''
    return new_value
  }

  /**
   * Returns the value of a trigger or bind translated from Windows to Linux.
   * @param old_value The trigger / bind value to be translated.
   * @returns The translated value for the current OS.
   */
  private windowsToLinux(old_value: string): string {
    let new_value = ''
    return new_value
  }

  /**
   * Returns the value of a trigger or bind translated from Windows to macOS.
   * @param old_value The trigger / bind value to be translated.
   * @returns The translated value for the current OS.
   */
  private windowsToMac(old_value: string): string {
    let new_value = ''
    return new_value
  }

  /**
   * Returns the value of a trigger or bind translated from macOS to Linux.
   * @param old_value The trigger / bind value to be translated.
   * @returns The translated value for the current OS.
   */
  private macToLinux(old_value: string): string {
    let new_value = ''
    return new_value
  }

  /**
   * Returns the value of a trigger or bind translated from macOS to Windows.
   * @param old_value The trigger / bind value to be translated.
   * @returns The translated value for the current OS.
   */
  private macToWindows(old_value: string): string {
    let new_value = ''
    return new_value
  }

  /**
   * Because some binds have multiple nested binds, we need to recursively process them all.
   * This will drill down until it finds a bind with a single value string, then translate that.
   * @param bind The bind to be processed.
   * @param incoming_OS The operating system the profile was created on.
   */
  private processBindRecursive(bind: B.Bind, incoming_OS: string): void {
    if (bind instanceof B.Macro_Bind || bind instanceof B.TimedMacro_Bind) {
      for (const single_bind of bind.binds) {
        this.processBindRecursive(single_bind, incoming_OS)
      }
    }
    // Repeat bind contains a single bind called value, not an array
    else if (bind instanceof B.Repeat_Bind) {
      this.processBindRecursive(bind.value, incoming_OS)
    }
    // All other bind types have a single value string. BASE CASE
    else if (
      bind instanceof B.PressKey ||
      bind instanceof B.ReleaseKey ||
      bind instanceof B.TapKey
    ) {
      bind.value = this.processRemapValue(bind.value, incoming_OS)
    } else {
      log.warn(
        `Unknown bind type during ${incoming_OS} to ${this.OS} translation. Bind: ${bind.toString()}`
      )
    }
  }
}

/**
 * Detects the operating system the code is running on.
 * @returns 'macOS', 'Windows', 'Linux', or 'Unknown'
 */
function detectOS(): 'macOS' | 'Windows' | 'Linux' | 'Unknown' {
  if (typeof process !== 'undefined' && process.platform) {
    const platform = process.platform
    if (platform === 'darwin') return 'macOS'
    if (platform === 'win32') return 'Windows'
    if (platform === 'linux') return 'Linux'
  } else if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('mac')) return 'macOS'
    if (ua.includes('win')) return 'Windows'
    if (ua.includes('linux')) return 'Linux'
  }

  return 'Unknown'
}
