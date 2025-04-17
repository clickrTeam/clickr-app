import * as TB from './Trigger_and_Bind'

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
   * @param remappings - (Optional) A Map of trigger to bind mappings.
   */
  constructor(layer_name: string, layer_number: number, remappings?: Map<TB.Trigger, TB.Bind>) {
    this.layer_name = layer_name
    this.layer_number = layer_number

    if (remappings) {
      this.remappings = remappings
    } else {
      this.remappings = new Map<TB.Trigger, TB.Bind>()
    }
  }

  /**
   * Deletes a remapping from a layer. Should be used in conjunction with addRemapping when changing a key
   * that is already mapped.
   * @param trig The associated trigger object
   * @returns True if the trigger and bind was present and removed, false otherwise.
   */
  deleteRemapping(trig: TB.Trigger): boolean {
    // Keys are by reference, so unless the exact Trigger object is indexed, you won't ever delete anything.
    // Using .equals will allow old_trig to be a different instance
    for (const existing_trig of this.remappings.keys()) {
      if (existing_trig.equals(trig)) {
        return this.remappings.delete(existing_trig)
      }
    }
    return false
  }

  /**
   * Adds a trigger and bind to the remappings map.
   * @param trig The trigger that should be associated with a bind
   * @param bnd The desired bind
   */
  addRemapping(trig: TB.Trigger, bnd: TB.Bind): void {
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
      layer_number: this.layer_number,
      remappings: remappingsToJSON(this.remappings)
    }
  }

  static fromJSON(obj: {
    layer_name: string
    layer_number: number
    remappings: { trigger: object; bind: object }[]
  }): Layer {
    const remappings = remappingsFromJSON(obj.remappings)
    return new Layer(obj.layer_name, obj.layer_number, remappings)
  }
}

/**
 * Turns the map of remapping into an object that can be JSON.Stringify()
 * @param map The remapping map
 * @returns An array of triggers and binds
 */
function remappingsToJSON(map: Map<TB.Trigger, TB.Bind>): { trigger: object; bind: object }[] {
  const arr: { trigger: object; bind: object }[] = []
  for (const [trigger, bind] of map.entries()) {
    arr.push({
      trigger: trigger.toJSON(),
      bind: bind.toJSON()
    })
  }
  return arr
}

/**
 * Converts JSON into a map<Trigger,Bind> for use in the layer object
 * @param arr Array of triggers and binds
 * @returns Map object
 */
function remappingsFromJSON(arr: { trigger: object; bind: object }[]): Map<TB.Trigger, TB.Bind> {
  const map = new Map<TB.Trigger, TB.Bind>()
  for (const entry of arr) {
    const trigger = TB.deserializeTrigger(entry.trigger)
    const bind = TB.deserializeBind(entry.bind)
    map.set(trigger, bind)
  }
  return map
}
