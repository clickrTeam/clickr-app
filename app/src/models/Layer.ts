import { AdvancedModificaiton, Modification } from './Modification'

/**
 * Represents a keyboard layer within a profile
 */
export class Layer {
  /**
   * The name associated with the layer
   */
  layer_name: string

  /**
   * Contains all the associated Triggers and Binds for a layer.
   */
  public remappings: Modification[]

  /**
   * Creates an instance of the Layer class.
   * @param layer_name: The name of the layer
   * @param layer_number: A number associated with the layer
   * @param remappings - (Optional) A Map of trigger to bind mappings.
   */
  constructor(layer_name: string, remappings?: Modification[]) {
    this.layer_name = layer_name
    this.remappings = remappings ?? []
  }

  /**
   * Deletes a remapping from a layer. Should be used in conjunction with addRemapping when changing a key
   * that is already mapped.
   * @param trig The associated trigger object
   * @returns True if the trigger and bind was present and removed, false otherwise.
   */
  deleteRemapping(i: number): boolean {
    if (i >= this.remappings.length) {
      return false
    }
    this.remappings = this.remappings.splice(i, 1)
    return true
  }

  /**
   * Adds a trigger and bind to the remappings map.
   * @param trig The trigger that should be associated with a bind
   * @param bnd The desired bind
   */
  addRemapping(mod: Modification): void {
    this.remappings.push(mod)
  }

  equals(other: Layer): boolean {
    if (JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON())) return true
    return false
  }

  /**
   * Retrieves the mapping from the remapping dictionary
   * @param key The trigger to query
   * @returns The bind associated with that key
   */
  getRemapping(i: number): Modification | undefined {
    return this.remappings[i]
  }

  /**
   * Updates the name of the layer
   * @param new_name What the layer's name will be changed to.
   */
  updateName(new_name: string): void {
    this.layer_name = new_name
  }

  toJSON(): object {
    return {
      layer_name: this.layer_name,
      remappings: this.remappings.map(mod => mod.toJSON())
    }
  }
  toLL(): LLMod[] {
    return this.remappings.map(mod => mod.toLL())
  }

  static fromJSON(obj: {
    layer_name: string
    remappings: { trigger: object; bind: object }[]
  }): Layer {
    return new Layer(
      obj.layer_name,
      obj.remappings.map(AdvancedModificaiton.fromJSON),
    )
  }
}
