import { Modification } from './Modification';
import assert from 'assert';

/**
 * Represents a keyboard layer within a profile
 */
export class Layer {
  /**
   * Used to generate unique identifiers
   */
  private static next_id = 0;

  /**
   * A unique identifier for the layer.
   */
  readonly id: number;

  /**
   * The name associated with the layer
   */
  name: string

  /**
   * Contains all the associated Triggers and Binds for a layer.
   */
  private mods: Map<number, Modification>;


  /**
   * Creates an instance of the Layer class.
   * @param layer_name: The name of the layer
   * @param layer_number: A number associated with the layer
   */
  constructor(name: string) {
    this.id = Layer.next_id++;
    this.name = name
    this.mods = new Map();
  }

  /**
   * Remaps a physical keypress to a Bind
   * @param trig The associated trigger object
   * @param bnd The bind associated the user desires. "enter, double tap"
   */
  addMod(mod: Modification) {
    assert(!this.mods.has(mod.id));
    this.mods.set(mod.id, mod);
  }

  /**
   * Removes a modification from the layer by its ID.
   * @param mod_id The ID of the modification to remove.
   */
  removeMod(mod_id: number) {
    assert(this.mods.delete(mod_id));
  }

  // Static method to create an instance from JSON
  static fromJSON(layerData: any): Layer {
    const layer = new Layer(layerData.name);

    layerData.mods.forEach((modData: any) => {
      const mod = Modification.fromJSON(modData);
      layer.addMod(mod);
    });

    return layer;
  }

  // Method to serialize the Layer instance into JSON
  toJSON(): any {
    const modsArray = Array.from(this.mods.values());

    return {
      name: this.name,
      mods: modsArray, // Include mods as a list of objects
    };
  }
}
