import log from 'electron-log';
import { Bind, Macro_Bind } from '../../../../models/Bind';
import { Layer } from '../../../../models/Layer';
import { Profile } from '../../../../models/Profile';
import { Trigger, KeyPress } from '../../../../models/Trigger';



// ProfileController class with comprehensive profile management
export class ProfileController {
  public activeLayer: Layer;

  constructor(public profile: Profile, public editedProfileIndex: number, public onUpSave: (profileControler: ProfileController) => void) {
    this.activeLayer = this.profile.layers[0];
    log.debug(`ProfileController initialized for profile: ${this.profile.profile_name}`);
  }

  onSave(): void {
    log.verbose(`Profile has been updated and saved. Updated profile: ${this.profile.profile_name}`)
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

    this.activeLayer.addRemapping(trigger, new Macro_Bind(binds)) // TODO support multiple triggers
    this.onSave();
  }

  removeBind(trigger: Trigger | null, setBind: (bind: Bind[]) => void): void {
    if (!trigger) {
      log.warn('No trigger provided to removeBind. Aborting.');
      return;
    }
    log.debug('Removing bind from trigger:', trigger);

    setBind([]);
    this.activeLayer.deleteRemapping(trigger);
    this.onSave();
  }

  setLayer(index: number): void {
    log.debug('Setting active layer to index:', index);
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
    const bind = this.activeLayer.getRemapping(trigger);
    log.debug('Found binds for trigger:', bind);
    if (bind instanceof Macro_Bind) {
      setBind(bind.binds);
    } else if (bind) {
      setBind([bind]);
    } else {
      log.warn('No bind found for selected key:', selectedKey);
      setBind([]);
    }
  }

  getActiveRemappings(): Map<Trigger, Bind> {
    if (!this.activeLayer) {
      log.warn('No active layer found. Returning empty remappings.');
      return new Map();
    }
    return this.activeLayer.remappings;
  }

  getProfile(): Profile {
    return this.profile;
  }
}
