import assert from 'assert';
import { Layer } from './Layer'

/**
 * Represents an entire profile that can contain many layers.
 */
export class Profile {
  /**
   * The name of the profile
   */
  name: string;

  /**
   * Contains all of the layers associated with a profile
   */
  private layers: Map<number, Layer>;

  /**
   * Id of default layer. May not be set immediately
   */
  private default_layer?: number;


  /**
   * Creates an instance of a profile
   * @param profile_name: The name associated with the profile
   */
  constructor(name: string) {
    this.name = name
    this.layers = new Map
    this.default_layer = undefined;
  }

  /**
   * Adds a new layer to the profile so the user can customize it.
   * @param layer_name: The name associated with the layer. "Photoshop"
   */
  addLayer(layer: Layer): void {
    this.layers.set(layer.id, layer);
  }

  setDefaultLayer(layer_id: number) {
    assert(this.layers.has(layer_id));
    this.default_layer = layer_id;
  }

  /**
   * Getter for layers
   * @returns list of all layers.
   */
  getLayers(): Layer[] {
    return Array.from(this.layers.values());
  }

  /**
   * Removes a layer from the profile, effectively deleting it.
   * @param layer_id The id associated with the layer to be removed.
   * @returns True if the layer number was found and the layer removed, false otherwise
   */
  removeLayer(layer_id: number) {
    assert(this.layers.delete(layer_id));
  }

  validate(): boolean {
    if (this.default_layer == undefined) {
      return false;
    }
    // TODO: look for incompatible key binds in each layer
    return true;
  }

  /**
   * Serializes the Profile instance into a JSON string.
   */
  toJSON(): any {
    return {
      name: this.name,
      default_layer: this.default_layer,
      layers: this.getLayers(),
    };
  }

  /**
   * Creates an instance of Profile from a JSON string.
   * @param profileDat A JSON string representing a Profile.
   * @returns A new Profile instance.
   */
  static fromJSON(profileData: any): Profile {
    const profile = new Profile(profileData.name);
    profile.default_layer = profileData.default_layer;

    // Recreate layers from their respective JSON objects using Layer.fromJSON
    profileData.layers.forEach((layerData: any) => {
      profile.addLayer(Layer.fromJSON(layerData));
    });

    return profile;
  }

}
