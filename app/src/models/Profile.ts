/* eslint-disable @typescript-eslint/no-explicit-any */
import { Layer } from './Layer'
import * as T from './Trigger'
import * as B from './Bind'
import * as K from './Keys'
import log from 'electron-log'
import { LLProfile } from './LowLevelProfile'
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
   * @param translate Bool to determine if OS translation should occur. Defaults to true.
   * @returns A Profile instance.
   * @throws Error if the JSON is malformed.
   */
  static fromJSON(obj: any, translate: boolean = true): Profile {
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

    if (translate) {
      if (profile.OS !== obj.OS) {
        log.info(
          `Profile OS "${obj.OS}" does not match current OS "${profile.OS}". Translating keys to current OS.`
        )
        profile.translateToTargetOS(obj.OS, detectOS())
      } else {
        log.silly(
          `Profile OS "${obj.OS}" matches current OS "${profile.OS}". No translation needed.`
        )
      }
      log.silly(
        `<<<<<< Deserialization of profile "${profile.profile_name}" completed with ${profile.layer_count} layers.`
      )
    }

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
          trigger instanceof T.Hold
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
        else if (bind instanceof B.Macro || bind instanceof B.TimedMacro) {
          for (const single_bind of bind.binds) {
            this.processBindRecursive(single_bind, incoming_OS, target_OS)
          }
        }
        // Need recursive call here for nested bind
        else if (bind instanceof B.Repeat) {
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

    if (old_value === K.LinuxKey.SuperLeft) {
      new_value = K.WinKey.WinLeft
    } else if (old_value === K.LinuxKey.SuperRight) {
      new_value = K.WinKey.WinRight
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
    if (old_value === K.LinuxKey.SuperLeft) {
      new_value = K.MacKey.CommandLeft
    } else if (old_value === K.LinuxKey.SuperRight) {
      new_value = K.MacKey.CommandRight
    }
    /// @todo This is a problem, because there are two Ctrl keys on Linux, but only one Control key on macOS.
    /// possible solutions include not allowing both Ctrl keys to be mapped in the UI (having them both be Ctrl), or mapping both to Control on macOS.
    else if (old_value === K.LinuxKey.CtrlLeft || old_value === K.LinuxKey.CtrlRight) {
      new_value = K.MacKey.Control
    } else if (old_value === K.LinuxKey.AltLeft) {
      new_value = K.MacKey.OptionLeft
    } else if (old_value === K.LinuxKey.AltRight) {
      new_value = K.MacKey.OptionRight
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

    if (old_value === K.WinKey.WinLeft) {
      new_value = K.LinuxKey.SuperLeft
    } else if (old_value === K.WinKey.WinRight) {
      new_value = K.LinuxKey.SuperRight
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
    if (old_value === K.WinKey.WinLeft) {
      new_value = K.MacKey.CommandLeft
    } else if (old_value === K.WinKey.WinRight) {
      new_value = K.MacKey.CommandRight
    }
    /// @todo This is a problem, because there are two Ctrl keys on Windows, but only one Control key on macOS.
    /// possible solutions include not allowing both Ctrl keys to be mapped in the UI (having them both be Ctrl), or mapping both to Control on macOS.
    else if (old_value === K.WinKey.CtrlLeft || old_value === K.WinKey.CtrlRight) {
      new_value = K.MacKey.Control
    } else if (old_value === K.WinKey.AltLeft) {
      new_value = K.MacKey.OptionLeft
    } else if (old_value === K.WinKey.AltRight) {
      new_value = K.MacKey.OptionRight
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
    if (old_value === K.MacKey.CommandLeft) {
      new_value = K.LinuxKey.SuperLeft
    } else if (old_value === K.MacKey.CommandRight) {
      new_value = K.LinuxKey.SuperRight
    } else if (old_value === K.MacKey.Control) {
      /// @todo Since macOS only has one Control key, default to left Control on Windows. This is not a great solution.
      new_value = K.LinuxKey.CtrlLeft
    } else if (old_value === K.MacKey.OptionLeft) {
      new_value = K.LinuxKey.AltLeft
    } else if (old_value === K.MacKey.OptionRight) {
      new_value = K.LinuxKey.AltRight
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
    if (old_value === K.MacKey.CommandLeft) {
      new_value = K.WinKey.WinLeft
    } else if (old_value === K.MacKey.CommandRight) {
      new_value = K.WinKey.WinRight
    } else if (old_value === K.MacKey.Control) {
      /// @todo Since macOS only has one Control key, default to left Control on Windows. This is not a great solution.
      new_value = K.WinKey.CtrlLeft
    } else if (old_value === K.MacKey.OptionLeft) {
      new_value = K.WinKey.AltLeft
    } else if (old_value === K.MacKey.OptionRight) {
      new_value = K.WinKey.AltRight
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
    if (bind instanceof B.Macro || bind instanceof B.TimedMacro) {
      for (const single_bind of bind.binds) {
        this.processBindRecursive(single_bind, incoming_OS, target_OS)
      }
    }
    // Repeat bind contains a single bind called value, not an array
    else if (bind instanceof B.Repeat) {
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

  /**
   * Processes all shortcut binds and converts them to sequences of press and releases
   * for the lower level profile
   */
  __iterateThroughBinds(): void {
    log.debug(`Checking profile ${this.profile_name} for binds that contain shortcuts
    and converting them to a lower level form.`)

    for (const layer of this.layers) {
      const remappingsCopy = Array.from(layer.remappings.entries())

      for (const [trigger, bind] of remappingsCopy) {
        if (
          bind instanceof B.PressKey ||
          bind instanceof B.ReleaseKey ||
          bind instanceof B.TapKey
        ) {
          if (Object.values(K.ShortcutAction).includes(bind.value as K.ShortcutAction)) {
            layer.deleteRemapping(trigger)
            layer.addRemapping(trigger, this.convertShortcutToLL(bind))
          }
        } else {
          const converted = this.processShortcutBindRecursive(bind)
          layer.deleteRemapping(trigger)
          layer.addRemapping(trigger, converted)
        }
      }
    }
  }

  /**
   * Determines if a bind needs to be processed as a shortcut, then calls the appropriate
   * function if necessary. Will update the bind to be compliant with lower level profiles.
   * @param bind will be checked to see if it is a shortcut, then converted if necessary
   * @returns Bind object, converted or not
   */
  private processShortcutBindRecursive(bind: B.Bind): B.Bind {
    if (bind instanceof B.Macro || bind instanceof B.TimedMacro) {
      for (let i = 0; i < bind.binds.length; i++) {
        bind.binds[i] = this.processShortcutBindRecursive(bind.binds[i])
      }
      return bind
    }
    // BASE CASE
    else if (
      bind instanceof B.PressKey ||
      bind instanceof B.ReleaseKey ||
      bind instanceof B.TapKey
    ) {
      return this.convertShortcutToLL(bind)
    } else {
      log.info('This bind cannot be processed as a shortcut at this time:', bind)
      return bind
    }
  }

  /**
   * Performs the conversion from a shortcut like 'Copy' to a sequence of Press and Release
   * based on operating system
   * @param higher_level_bind The original bind that is represented at a higher level
   * @returns A macro that contains the sequence of Press and Release needed.
   */
  private convertShortcutToLL(higher_level_bind: B.Bind): B.Bind {
    let ll_bind = higher_level_bind

    const ctrl =
      this.OS === 'Windows'
        ? K.WinKey.CtrlLeft
        : this.OS === 'Linux'
          ? K.LinuxKey.CtrlLeft
          : this.OS === 'macOS'
            ? K.MacKey.CommandLeft
            : K.WinKey.CtrlLeft

    const shift = K.Modifier.ShiftLeft
    const alt =
      this.OS === 'Windows'
        ? K.WinKey.AltLeft
        : this.OS === 'Linux'
          ? K.LinuxKey.AltLeft
          : this.OS === 'macOS'
            ? K.MacKey.OptionLeft
            : K.WinKey.AltLeft

    const prntscrn =
      this.OS === 'Windows'
        ? K.WinKey.PrintScreen
        : this.OS === 'Linus'
          ? K.LinuxKey.SysReq
          : 'No Key Avaliable'

    if (
      higher_level_bind instanceof B.TapKey ||
      higher_level_bind instanceof B.PressKey ||
      higher_level_bind instanceof B.ReleaseKey
    ) {
      switch (higher_level_bind.value) {
        case K.ShortcutAction.Copy:
          log.info('Converting Copy to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.C),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.C)
          ])
          break

        case K.ShortcutAction.Paste:
          log.info('Converting Paste to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.V),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.V)
          ])
          break

        case K.ShortcutAction.Cut:
          log.info('Converting Cut to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.X),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.X)
          ])
          break

        case K.ShortcutAction.Undo:
          log.info('Converting Undo to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.Z),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.Z)
          ])
          break

        case K.ShortcutAction.Redo:
          log.info('Converting Redo to lower level')
          if (this.OS === 'macOS') {
            ll_bind = new B.Macro([
              new B.PressKey(ctrl),
              new B.PressKey(K.Modifier.ShiftLeft),
              new B.PressKey(K.Letters.Z),
              new B.ReleaseKey(ctrl),
              new B.ReleaseKey(shift),
              new B.ReleaseKey(K.Letters.Z)
            ])
          } else {
            ll_bind = new B.Macro([
              new B.PressKey(ctrl),
              new B.PressKey(K.Letters.Y),
              new B.ReleaseKey(ctrl),
              new B.ReleaseKey(K.Letters.Y)
            ])
          }
          break

        case K.ShortcutAction.SelectAll:
          log.info('Converting SelectAll to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.A),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.A)
          ])
          break

        case K.ShortcutAction.DeleteLine:
          log.info('Converting DeleteLine to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(shift),
            new B.PressKey(K.Letters.K),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(shift),
            new B.ReleaseKey(K.Letters.K)
          ])
          break

        case K.ShortcutAction.Find:
          log.info('Converting Find to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.F),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.F)
          ])
          break

        case K.ShortcutAction.FindNext:
          log.info('Converting FindNext to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.G),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.G)
          ])
          break

        case K.ShortcutAction.Replace:
          log.info('Converting Replace to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(shift),
            new B.PressKey(K.Letters.H),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(shift),
            new B.ReleaseKey(K.Letters.H)
          ])
          break

        case K.ShortcutAction.GoToLine:
          log.info('Converting GoToLine to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.G),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.G)
          ])
          break

        case K.ShortcutAction.MoveToLineStart:
          log.info('Converting MoveToLineStart to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(K.Navigation.Home),
            new B.ReleaseKey(K.Navigation.Home)
          ])
          break

        case K.ShortcutAction.MoveToLineEnd:
          log.info('Converting MoveToLineEnd to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(K.Navigation.End),
            new B.ReleaseKey(K.Navigation.End)
          ])
          break

        case K.ShortcutAction.MoveWordLeft:
          log.info('Converting MoveWordLeft to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Navigation.ArrowLeft),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Navigation.ArrowLeft)
          ])
          break

        case K.ShortcutAction.MoveWordRight:
          log.info('Converting MoveWordRight to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Navigation.ArrowRight),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Navigation.ArrowRight)
          ])
          break

        case K.ShortcutAction.NewFile:
          log.info('Converting NewFile to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.N),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.N)
          ])
          break

        case K.ShortcutAction.OpenFile:
          log.info('Converting OpenFile to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.O),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.O)
          ])
          break

        case K.ShortcutAction.Save:
          log.info('Converting Save to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.S),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.S)
          ])
          break

        case K.ShortcutAction.SaveAs:
          log.info('Converting SaveAs to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(shift),
            new B.PressKey(K.Letters.S),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(shift),
            new B.ReleaseKey(K.Letters.S)
          ])
          break

        case K.ShortcutAction.Print:
          log.info('Converting Print to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.P),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.P)
          ])
          break

        case K.ShortcutAction.CloseWindow:
          log.info('Converting CloseWindow to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.W),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.W)
          ])
          break

        case K.ShortcutAction.QuitApp:
          log.info('Converting QuitApp to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.Q),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.Q)
          ])
          break

        case K.ShortcutAction.PrintScreen:
          log.info('Converting PrintScreen to lower level')
          if (this.OS === 'macOS') {
            ll_bind = new B.Macro([
              new B.PressKey(shift),
              new B.PressKey(K.MacKey.CommandLeft),
              new B.PressKey(K.Digits.Digit3),
              new B.ReleaseKey(shift),
              new B.ReleaseKey(K.MacKey.CommandLeft),
              new B.ReleaseKey(K.Digits.Digit3)
            ])
          } else {
            ll_bind = new B.Macro([new B.PressKey(prntscrn), new B.ReleaseKey(prntscrn)])
          }
          break

        case K.ShortcutAction.NewTab:
          log.info('Converting NewTab to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.T),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.T)
          ])
          break

        case K.ShortcutAction.CloseTab:
          log.info('Converting CloseTab to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.W),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.W)
          ])
          break

        case K.ShortcutAction.ReopenTab:
          log.info('Converting ReopenTab to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(shift),
            new B.PressKey(K.Letters.T),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(shift),
            new B.ReleaseKey(K.Letters.T)
          ])
          break

        case K.ShortcutAction.Refresh:
          log.info('Converting Refresh to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.R),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.R)
          ])
          break

        case K.ShortcutAction.OpenDevTools:
          log.info('Converting OpenDevTools to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(shift),
            new B.PressKey(this.OS === 'macOS' ? alt : K.Letters.I),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(shift),
            new B.ReleaseKey(this.OS === 'macOS' ? alt : K.Letters.I)
          ])
          break

        case K.ShortcutAction.FocusAddressBar:
          log.info('Converting FocusAddressBar to lower level')
          ll_bind = new B.Macro([
            new B.PressKey(ctrl),
            new B.PressKey(K.Letters.L),
            new B.ReleaseKey(ctrl),
            new B.ReleaseKey(K.Letters.L)
          ])
          break

        default:
          log.info(`Unknown shortcut: ${higher_level_bind.value}, returning original bind.`)
      }
    } else {
      log.info('Bind type does not contain a shortcut value')
    }

    return ll_bind
  }

  toLL(): LLProfile {
    const copy_profile = Profile.fromJSON(this.toJSON(), false)
    copy_profile.OS = this.OS
    copy_profile.__iterateThroughBinds()
    return {
      profile_name: copy_profile.profile_name,
      default_layer: 0,
      layers: copy_profile.layers.map((l) => l.toLL())
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
