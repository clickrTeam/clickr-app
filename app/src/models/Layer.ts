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
   * @param remappings - (Optional) A Map of trigger to bind mappings.
   */
  constructor(layer_name: string, layer_number: number, remappings?: Map<TB.Trigger, TB.Bind>) {
    this.layer_name = layer_name
    this.layer_number = layer_number

    if (remappings) {
      this.remappings = remappings
    } else {
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
  }

  /**
   * Remaps a physical keypress to a Bind
   * @param new_trig The associated trigger object
   * @param new_bnd The bind associated the user desires. "enter, double tap"
   */
  setRemapping(old_trig: TB.Trigger, new_trig: TB.Trigger, new_bnd: TB.Bind): void {
    // Keys are by reference, so unless the exact Trigger object is indexed, you won't ever delete anything.
    // Using .equals will allow old_trig to be a different instance
    for (const existing_trig of this.remappings.keys()) {
      if (existing_trig.equals(old_trig)) {
        this.remappings.delete(existing_trig)
        break
      }
    }
    this.remappings.set(new_trig, new_bnd)
  }

  /**
   * Retrieves the mapping from the remapping dictionary
   * @param key The trigger to query
   * @returns The bind associated with that key
   */
  getRemapping(trig: TB.Trigger): TB.Bind | undefined {
    return this.remappings.get(trig)
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
