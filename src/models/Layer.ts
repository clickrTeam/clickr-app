import * as TB from './Trigger_and_Bind'
import { defaultQwertyLayout } from './DefaultLayout'

/**
 * Represents a keyboard layer within a profile
 */
export class Layer {
  /**
   * The name associated with the layer
   */
  layer_name: string

  /**
   * The number associated with the layer. Must be unique from other layer numbers. Serves as an identifier
   */
  layer_number: number

  /**
   * Contains all the associated Triggers and Binds for a layer.
   */
  remappings: Map<TB.Trigger, TB.Bind>

  /**
   * Creates an instance of the Layer class.
   * @param layer_name: The name of the layer
   * @param layer_number: A number associated with the layer
   */
  constructor(layer_name: string, layer_number: number) {
    this.layer_name = layer_name
    this.layer_number = layer_number
    this.remappings = new Map<TB.Trigger, TB.Bind>()

    // Sets qwerty as the default values for a layer.
    for (const row of defaultQwertyLayout) {
      for (const key of row) {
        //TODO: I think at some point it would be a good idea to use the user's layer0 as a default, instead of QWERTY.
        const trig = new TB.Link_Trigger(key.value)
        const bnd = new TB.Link_Bind(key.value)
        this.remappings.set(trig, bnd)
      }
    }
  }

  /**
   * Remaps a physical keypress to a Bind
   * @param trig The associated trigger object
   * @param bnd The bind associated the user desires. "enter, double tap"
   */
  setRemapping(trig: TB.Trigger, bnd: TB.Bind): void {
    this.remappings.set(trig, bnd)
  }

  /**
   * Retrieves the mapping from the remapping dictionary
   * @param key The trigger to query
   * @returns The bind associated with that key
   */
  getRemapping(trig: TB.Trigger): TB.Bind | undefined {
    return this.remappings.get(trig)
  }
}
