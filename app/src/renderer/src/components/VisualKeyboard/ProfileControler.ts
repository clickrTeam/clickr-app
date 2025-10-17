import log from 'electron-log';
import { Bind, Macro } from '../../../../models/Bind';
import { Layer } from '../../../../models/Layer';
import { AdvancedModificaiton } from '../../../../models/Modification';
import { Profile } from '../../../../models/Profile';
import { Trigger, KeyPress } from '../../../../models/Trigger';



// ProfileController class with comprehensive profile management
export class ProfileController {
  public activeLayer: Layer;

  constructor(public profile: Profile, public editedProfileIndex: number, public onUpSave: (profileControler: ProfileController) => void) {
    this.activeLayer = this.profile.layers[0];
    log.silly(`ProfileController initialized for profile: ${this.profile.profile_name}`);
  }

  onSave(): void {
    log.debug(`Profile is being updated and saved. Updated profile: ${this.profile.profile_name}`)
    window.api.updateProfile(this.editedProfileIndex, this.profile.toJSON())
    this.onUpSave(this);
  }

  addBind(trigger: Trigger | null, binds: Bind[]): void {
    if (!trigger) {
      log.warn('No trigger provided to addBind. Aborting.');
      return;
    }
    if (binds.length === 0) {
      log.warn('No binds provided to addBind. Aborting.');
      return;
    }
    log.debug('Adding bind:', binds, 'to trigger:', trigger);

    this.activeLayer.addRemapping(new AdvancedModificaiton(trigger, new Macro(binds)));
    this.onSave();
  }

  jemoveBind(trigger: Trigger | null, setBind: (bind: Bind[]) => void): void {
    if (!trigger) {
      log.warn('No trigger provided to removeBind. Aborting.');
      return;
    }
    log.debug('Removing bind from trigger:', trigger);

    setBind([]);
    const indexToDelete = this.activeLayer.remappings.findIndex(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(trigger)
    );

    if (indexToDelete !== -1) {
      this.activeLayer.deleteRemapping(indexToDelete);
      this.onSave();
    } else {
      log.warn('No matching modification found for trigger:', trigger);
    }
  }

  setLayer(index: number): void {
    log.silly('Setting active layer to index:', index);
    this.activeLayer = this.profile.layers[index];
  }

  setSelectedKey(selectedKey: string | null, setBind: (bind: Bind[]) => void, setTrigger: (trigger: Trigger | null) => void): void {
    log.silly('Setting selected key:', selectedKey);

    if (!selectedKey) {
      log.silly('No key selected, clearing binds and trigger.');
      setTrigger(null);
      setBind([]);
      return;
    }
    selectedKey = selectedKey || '';

    const trigger = new KeyPress(selectedKey);
    setTrigger(trigger);

    // Find the modification that matches the trigger
    const foundModification = this.activeLayer.remappings.find(
      (mod) => mod instanceof AdvancedModificaiton && mod.trigger.equals(trigger)
    );

    if (foundModification && foundModification instanceof AdvancedModificaiton) {
      const bind = foundModification.bind;
      log.debug('Found binds for trigger:', bind);
      if (bind instanceof Macro) { // Use Macro instead of Macro_Bind
        setBind(bind.binds);
      } else {
        setBind([bind]);
      }
    } else {
      log.warn('No modification found for selected key:', selectedKey);
      setBind([]);
    }
  }



  getProfile(): Profile {
    return this.profile;
  }
}
