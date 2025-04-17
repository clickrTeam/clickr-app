/* eslint-disable @typescript-eslint/no-explicit-any */
import { Layer } from './Layer'
import * as T from './Trigger'
import * as B from './Bind'
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
   * Creates an instance of a profile
   * @param profile_name: The name associated with the profile
   */
  constructor(profile_name: string) {
    this.profile_name = profile_name
    this.layers = []
    this.layer_count = 0

    this.addLayer('layer 0')
  }

  /**
   * Adds a new layer to the profile so the user can customize it.
   * @param layer_name: The name associated with the layer. "Photoshop"
   */
  addLayer(layer_name: string): void {
    const lyr = new Layer(layer_name, this.layer_count)
    this.layers.push(lyr)
    this.layer_count += 1

    //TODO: Add support for cloning layer 0 when you want to create a new layer.
  }

  /**
   * Removes a layer from the profile, effectively deleting it.
   * @param layer_number The number associated with the layer to be removed. layer_number is unique and as such is used instead of layer_name
   * @returns True if the layer number was found and the layer removed, false otherwise
   */
  removeLayer(layer_number: number): boolean {
    const index = this.layers.findIndex((layer) => layer.layer_number === layer_number)

    if (index === -1) {
      return false // not found
    }

    // Remove the layer
    this.layers.splice(index, 1)

    // Decrement layer_numbers for layers after the removed one
    for (let i = index; i < this.layers.length; i++) {
      this.layers[i].layer_number -= 1
    }

    this.layer_count -= 1
    return true
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
      return false // one or both layers not found
    }

    // Swap the positions in the array
    const temp = this.layers[index1]
    this.layers[index1] = this.layers[index2]
    this.layers[index2] = temp

    // Also swap their layer_number fields to keep them correct
    this.layers[index1].layer_number = num1
    this.layers[index2].layer_number = num2

    return true
  }

  /**
   * NOTE: Just for testing JSON structure.
   */
  ADD_TEST_LAYER(test_layer_name: string): void {
    this.addLayer(test_layer_name)

    const del_f1 = new T.Timed_Trigger(
      [
        ['F1', 1],
        ['F1', 2]
      ],
      true,
      true
    )
    const del_f1_bind = new B.Combo_Bind(['Ctrl', 'C'])
    this.layers[1].addRemapping(del_f1, del_f1_bind)

    //Test deletion and adding
    const new_f1 = new T.Timed_Trigger(
      [
        ['F1', 1],
        ['F1', 3]
      ],
      true,
      true
    )
    const new_f1_bind = new B.Combo_Bind(['Ctrl', 'V'])
    this.layers[1].deleteRemapping(del_f1)
    this.layers[1].addRemapping(new_f1, new_f1_bind)

    const old_f2 = new T.Tap_Trigger('F2')
    const new_f2 = new T.Hold_Trigger('F2', 99)
    const macro1 = new B.Tap_Bind('A')
    const macro2 = new B.Combo_Bind(['Space', 'B', 'C'])
    const new_f2_bind = new B.Macro_Bind([macro1, macro2])
    this.layers[1].deleteRemapping(old_f2)
    this.layers[1].addRemapping(new_f2, new_f2_bind)

    const old_f3 = new T.Tap_Trigger('F3')
    const new_f3 = new T.App_Focus_Trigger('Photoshop', 'F3')
    const new_f3_bind = new B.TimedMacro_Bind([macro1, macro2], [1, 2])
    this.layers[1].deleteRemapping(old_f3)
    this.layers[1].addRemapping(new_f3, new_f3_bind)

    const old_f4 = new T.Tap_Trigger('F4')
    const new_f4 = new T.Tap_Trigger('F4')
    const cancel_trg = new T.Tap_Trigger('Escape')
    const rpt_bnd = new B.Tap_Bind('Enter')
    const new_f4_bind = new B.Repeat_Bind(rpt_bnd, 11, 22, cancel_trg)
    this.layers[1].deleteRemapping(old_f4)
    this.layers[1].addRemapping(new_f4, new_f4_bind)

    const old_f5 = new T.Tap_Trigger('F5')
    const new_f5 = new T.Tap_Trigger('F5')
    const new_f5_bind = new B.SwapLayer_Bind(0)
    this.layers[1].deleteRemapping(old_f5)
    this.layers[1].addRemapping(new_f5, new_f5_bind)

    const old_f6 = new T.Tap_Trigger('F6')
    const new_f6 = new T.Tap_Trigger('F6')
    const new_f6_bind = new B.AppOpen_Bind('Google Chrome')
    this.layers[1].deleteRemapping(old_f6)
    this.layers[1].addRemapping(new_f6, new_f6_bind)
  }

  /**
   * Serializes the Profile instance to a JSON-compatible object.
   */
  toJSON(): object {
    return {
      profile_name: this.profile_name,
      layer_count: this.layer_count,
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
      throw new Error('Profile JSON is not an object')
    }
    if (typeof obj.profile_name !== 'string') {
      throw new Error("Profile JSON missing or invalid 'profile_name'")
    }
    if (!Array.isArray(obj.layers)) {
      throw new Error("Profile JSON missing or invalid 'layers'")
    }

    // Create the Profile instance using the profile name
    const profile = new Profile(obj.profile_name)

    // Deserialize the layers and override defaults if needed.
    profile.layers = obj.layers.map((layerObj: any) => Layer.fromJSON(layerObj))
    profile.layer_count = profile.layers.length

    return profile
  }
}
