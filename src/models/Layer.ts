import { Trigger } from './Trigger'
import { Bind } from './Trigger'
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
   * Contains all the associated keys and binds for a layer.
   */
  remappings: Record<string, Bind> //TODO: Figure out trigger as key

  /**
   * Creates an instance of the Layer class.
   * @param layer_name: The name of the layer
   * @param layer_number: A number associated with the layer
   */
  constructor(layer_name: string, layer_number: number) {
    this.layer_name = layer_name
    this.layer_number = layer_number
    this.remappings = {}

    // Sets qwerty as the default values for a layer.
    for (const row of defaultQwertyLayout) {
      for (const key of row) {
        this.remappings[key.physical_key] = {
          values: [key.physical_key],
          bind_type: 'tap',
          time_delay: 0
        }
      }
    }
  }

  /**
   * Remaps a physical keypress to a Bind
   * @param key The physical key on the keyboard. "spacebar"
   * @param value The bind associated the user desires. "enter, double tap"
   */
  setRemapping(key: string, value: Bind): void {
    this.remappings[key] = value
  }

  /**
   * Retrieves the mapping from the remapping dictionary
   * @param key The physical key to query
   * @returns The bind associated with that key
   */
  getRemapping(key: string): Bind | undefined {
    return this.remappings[key]
  }
}
