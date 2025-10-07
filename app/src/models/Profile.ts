/* eslint-disable @typescript-eslint/no-explicit-any */
import { Layer } from './Layer'
import * as T from './Trigger'
import * as B from './Bind'
import { MacKey, WinKey, LinuxKey } from './Keys'
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
    log.silly(`Profile "${this.profile_name}" created with initial layer "layer 0". OS: ${this.OS}`)
  }

  /**
   * Adds a new layer to the profile so the user can customize it.
   * @param layer_name: The name associated with the layer. "Photoshop"
   */
  addLayer(layer_name: string): void {
    const lyr = new Layer(layer_name, this.layer_count)
    this.layers.push(lyr)
    this.layer_count += 1

    log.silly(`Layer ${layer_name} with number ${this.layer_count - 1} created.`)
    //TODO: Add support for cloning layer 0 when you want to create a new layer.
  }

  duplicateLayer(layerNumber: number) {
    const index = this.layers.findIndex((layer) => layer.layer_number === layerNumber)
    if (index === -1) {
      log.warn(`Attempted to duplicate layer ${layerNumber}, but it does not exist.`)
      throw new Error('Layer not found.')
    }

    const layerToDuplicate = this.layers[index]
    const newLayer = new Layer(layerToDuplicate.layer_name + ' Copy', this.layer_count)
    newLayer.remappings = new Map(layerToDuplicate.remappings)
    this.layers.push(newLayer)
    this.layer_count += 1

    log.info(`Layer ${layerNumber} duplicated as ${newLayer.layer_name}.`)
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
  }

  /**
   * Serializes the Profile instance to a JSON-compatible object.
   */
  toJSON(): object {
    log.silly(`>>>>> Serialization of profile "${this.profile_name}" started.`)
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
      profile.translateToTargetOS(obj.OS, detectOS())
    } else {
      log.silly(`Profile OS "${obj.OS}" matches current OS "${profile.OS}". No translation needed.`)
    }

    log.silly(
      `<<<<<< Deserialization of profile "${profile.profile_name}" completed with ${profile.layer_count} layers.`
    )
    return profile
  }

  /**
   * Checks whether the incoming OS is valid, and if so begins the translation process.
   * @param incoming_OS The OS the read profile was created on.
   * @param target_OS The OS to translate the profile to, usually the current OS.
   */
  translateToTargetOS(incoming_OS: string, target_OS: string): void {
    let valid_incoming_OS = false
    let valid_target_OS = false
    if (incoming_OS === 'Linux' || incoming_OS === 'Windows' || incoming_OS === 'macOS') {
      valid_incoming_OS = true
    }
    if (target_OS === 'Linux' || target_OS === 'Windows' || target_OS === 'macOS') {
      valid_target_OS = true
    }
    if (valid_incoming_OS && valid_target_OS) {
      // Iterate through layers and remappings to translate keys
      this.iterateForTranslation(incoming_OS, target_OS)
      log.debug(`Translation from ${incoming_OS} to ${target_OS} completed.`)
      this.OS = target_OS
    } else {
      log.warn(
        `Incoming profile has unknown OS "${incoming_OS}", cannot translate to ${target_OS}.`
      )
    }
  }

  /**
   * Iterates through all layers, remappings, triggers, and binds to translate keys from the incoming OS to the current OS.
   * @param incoming_OS The operating system the profile was created on.
   * @param target_OS The OS to translate the profile to, usually the current OS.
   */
  private iterateForTranslation(incoming_OS: string, target_OS: string): void {
    log.debug(`Translating profile from ${incoming_OS} to ${target_OS}.`)

    for (const layer of this.layers) {
      for (const [trigger, bind] of layer.remappings) {
        // Translate Trigger keys
        if (
          trigger instanceof T.KeyPress ||
          trigger instanceof T.KeyRelease ||
          trigger instanceof T.Hold ||
          trigger instanceof T.AppFocus
        ) {
          trigger.value = this.processRemapValue(trigger.value, incoming_OS, target_OS)
        } else if (trigger instanceof T.TapSequence) {
          for (const pair of trigger.key_time_pairs) {
            pair[0] = this.processRemapValue(pair[0], incoming_OS, target_OS)
          }
        } else {
          log.warn(
            `Unknown trigger type during ${incoming_OS} to ${target_OS} translation. Trigger: ${trigger.toString()}`
          )
        }

        // Translate Bind keys
        if (
          bind instanceof B.PressKey ||
          bind instanceof B.ReleaseKey ||
          bind instanceof B.TapKey
        ) {
          bind.value = this.processRemapValue(bind.value, incoming_OS, target_OS)
        } else if (bind instanceof B.SwapLayer) {
          // Do nothing, layer numbers are OS-independent
          continue
        }
        // Need recursive call here for array of nested binds
        else if (bind instanceof B.Macro_Bind || bind instanceof B.TimedMacro_Bind) {
          for (const single_bind of bind.binds) {
            this.processBindRecursive(single_bind, incoming_OS, target_OS)
          }
        }
        // Need recursive call here for nested bind
        else if (bind instanceof B.Repeat_Bind) {
          this.processBindRecursive(bind.value, incoming_OS, target_OS)
        } else {
          log.warn(
            `Unknown bind type during ${incoming_OS} to ${target_OS} translation. Bind: ${bind.toString()}`
          )
        }
      }
    }
  }

  /**
   * Determines which translation function to call based on the current and incoming OS.
   * @param val The value of the trigger or bind to be translated.
   * @param incoming_OS The operating system the profile was created on.
   * @param target_OS The OS to translate the profile to, usually the current OS.
   * @returns The translated value for the current OS.
   */
  private processRemapValue(val: string, incoming_OS: string, target_OS: string): string {
    let new_remap_value = ''
    if (target_OS === 'Linux') {
      if (incoming_OS === 'Windows') {
        new_remap_value = this.windowsToLinux(val)
      } else if (incoming_OS === 'macOS') {
        new_remap_value = this.macToLinux(val)
      } else {
        log.warn(
          `Incoming profile has unknown OS "${incoming_OS}", cannot translate to ${this.OS}.`
        )
      }
    } else if (target_OS === 'Windows') {
      if (incoming_OS === 'Linux') {
        new_remap_value = this.linuxToWindows(val)
      } else if (incoming_OS === 'macOS') {
        new_remap_value = this.macToWindows(val)
      } else {
        log.warn(
          `Incoming profile has unknown OS "${incoming_OS}", cannot translate to ${this.OS}.`
        )
      }
    } else if (target_OS === 'macOS') {
      if (incoming_OS === 'Linux') {
        new_remap_value = this.linuxToMac(val)
      } else if (incoming_OS === 'Windows') {
        new_remap_value = this.windowsToMac(val)
      } else {
        log.warn(
          `Incoming profile has unknown OS "${incoming_OS}", cannot translate to ${this.OS}.`
        )
      }
    }
    return new_remap_value
  }

  /**
   * Returns the value of a trigger or bind translated from Linux to Windows.
   * @param old_value The trigger / bind value to be translated.
   * @returns The translated value for the current OS.
   */
  private linuxToWindows(old_value: string): string {
    let new_value = old_value

    if (old_value === LinuxKey.SuperLeft) {
      new_value = WinKey.WinLeft
    } else if (old_value === LinuxKey.SuperRight) {
      new_value = WinKey.WinRight
    } else {
      log.info(`No translation needed for Linux key ${old_value} to Windows.`)
    }

    /// @todo Add more key translations here as needed.
    return new_value
  }

  /**
   * Returns the value of a trigger or bind translated from Linux to macOS.
   * @param old_value The trigger / bind value to be translated.
   * @returns The translated value for the current OS.
   */
  private linuxToMac(old_value: string): string {
    let new_value = old_value

    // Translate Linux-specific keys to macOS equivalents
    if (old_value === LinuxKey.SuperLeft) {
      new_value = MacKey.CommandLeft
    } else if (old_value === LinuxKey.SuperRight) {
      new_value = MacKey.CommandRight
    }
    /// @todo This is a problem, because there are two Ctrl keys on Linux, but only one Control key on macOS.
    /// possible solutions include not allowing both Ctrl keys to be mapped in the UI (having them both be Ctrl), or mapping both to Control on macOS.
    else if (old_value === LinuxKey.CtrlLeft || old_value === LinuxKey.CtrlRight) {
      new_value = MacKey.Control
    } else if (old_value === LinuxKey.AltLeft) {
      new_value = MacKey.OptionLeft
    } else if (old_value === LinuxKey.AltRight) {
      new_value = MacKey.OptionRight
    } else {
      log.info(`No translation needed for Linux key ${old_value} to macOS.`)
    }

    /// @todo Add more key translations here as needed. Consider how to handle ambiguous or missing mappings.
    return new_value
  }

  /**
   * Returns the value of a trigger or bind translated from Windows to Linux.
   * @param old_value The trigger / bind value to be translated.
   * @returns The translated value for the current OS.
   */
  private windowsToLinux(old_value: string): string {
    let new_value = old_value

    if (old_value === WinKey.WinLeft) {
      new_value = LinuxKey.SuperLeft
    } else if (old_value === WinKey.WinRight) {
      new_value = LinuxKey.SuperRight
    } else {
      log.info(`No translation needed for Windows key ${old_value} to Linux.`)
    }

    /// @todo Add more key translations here as needed.
    return new_value
  }

  /**
   * Returns the value of a trigger or bind translated from Windows to macOS.
   * @param old_value The trigger / bind value to be translated.
   * @returns The translated value for the current OS.
   */
  private windowsToMac(old_value: string): string {
    let new_value = old_value

    // Check all Windows-specific keys and translate them to macOS equivalents
    if (old_value === WinKey.WinLeft) {
      new_value = MacKey.CommandLeft
    } else if (old_value === WinKey.WinRight) {
      new_value = MacKey.CommandRight
    }
    /// @todo This is a problem, because there are two Ctrl keys on Windows, but only one Control key on macOS.
    /// possible solutions include not allowing both Ctrl keys to be mapped in the UI (having them both be Ctrl), or mapping both to Control on macOS.
    else if (old_value === WinKey.CtrlLeft || old_value === WinKey.CtrlRight) {
      new_value = MacKey.Control
    } else if (old_value === WinKey.AltLeft) {
      new_value = MacKey.OptionLeft
    } else if (old_value === WinKey.AltRight) {
      new_value = MacKey.OptionRight
    } else {
      log.info(`No translation needed for Windows key ${old_value} to macOS.`)
    }

    /// @todo Add more key translations here as needed. Unsure of how to handle media keys
    return new_value
  }

  /**
   * Returns the value of a trigger or bind translated from macOS to Linux.
   * @param old_value The trigger / bind value to be translated.
   * @returns The translated value for the current OS.
   */
  private macToLinux(old_value: string): string {
    let new_value = old_value

    // Translate macOS-specific keys to Windows equivalents
    if (old_value === MacKey.CommandLeft) {
      new_value = LinuxKey.SuperLeft
    } else if (old_value === MacKey.CommandRight) {
      new_value = LinuxKey.SuperRight
    } else if (old_value === MacKey.Control) {
      /// @todo Since macOS only has one Control key, default to left Control on Windows. This is not a great solution.
      new_value = LinuxKey.CtrlLeft
    } else if (old_value === MacKey.OptionLeft) {
      new_value = LinuxKey.AltLeft
    } else if (old_value === MacKey.OptionRight) {
      new_value = LinuxKey.AltRight
    } else {
      log.info(`No translation needed for macOS key ${old_value} to Windows.`)
    }

    /// @todo Add more key translations here as needed. Consider how to handle ambiguous or missing mappings.
    return new_value
  }

  /**
   * Returns the value of a trigger or bind translated from macOS to Windows.
   * @param old_value The trigger / bind value to be translated.
   * @returns The translated value for the current OS.
   */
  private macToWindows(old_value: string): string {
    let new_value = old_value

    // Translate macOS-specific keys to Windows equivalents
    if (old_value === MacKey.CommandLeft) {
      new_value = WinKey.WinLeft
    } else if (old_value === MacKey.CommandRight) {
      new_value = WinKey.WinRight
    } else if (old_value === MacKey.Control) {
      /// @todo Since macOS only has one Control key, default to left Control on Windows. This is not a great solution.
      new_value = WinKey.CtrlLeft
    } else if (old_value === MacKey.OptionLeft) {
      new_value = WinKey.AltLeft
    } else if (old_value === MacKey.OptionRight) {
      new_value = WinKey.AltRight
    } else {
      log.info(`No translation needed for macOS key ${old_value} to Windows.`)
    }

    /// @todo Add more key translations here as needed. Consider how to handle ambiguous or missing mappings.
    return new_value
  }

  /**
   * Because some binds have multiple nested binds, we need to recursively process them all.
   * This will drill down until it finds a bind with a single value string, then translate that.
   * @param bind The bind to be processed.
   * @param incoming_OS The operating system the profile was created on.
   * @param target_OS The OS to translate the profile to, usually the current OS.
   */
  private processBindRecursive(bind: B.Bind, incoming_OS: string, target_OS: string): void {
    if (bind instanceof B.Macro_Bind || bind instanceof B.TimedMacro_Bind) {
      for (const single_bind of bind.binds) {
        this.processBindRecursive(single_bind, incoming_OS, target_OS)
      }
    }
    // Repeat bind contains a single bind called value, not an array
    else if (bind instanceof B.Repeat_Bind) {
      this.processBindRecursive(bind.value, incoming_OS, target_OS)
    }
    // All other bind types have a single value string. BASE CASE
    else if (
      bind instanceof B.PressKey ||
      bind instanceof B.ReleaseKey ||
      bind instanceof B.TapKey
    ) {
      bind.value = this.processRemapValue(bind.value, incoming_OS, target_OS)
    } else {
      log.warn(
        `Unknown bind type during ${incoming_OS} to ${target_OS} translation. Bind: ${bind.toString()}`
      )
    }
  }
}

/**
 * Detects the operating system the code is running on.
 * @returns 'macOS', 'Windows', 'Linux', or 'Unknown'
 */
export function detectOS(): 'macOS' | 'Windows' | 'Linux' | 'Unknown' {
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
