import log from 'electron-log';
import { Bind, Macro_Bind } from '../../../../models/Bind';
import { Layer } from '../../../../models/Layer';
import { Profile } from '../../../../models/Profile';
import { Trigger, KeyPress } from '../../../../models/Trigger';



// ProfileController class with comprehensive profile management
export class ProfileController {
  public activeLayer: Layer;
  public footerOpen: boolean = false;

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

    const cur_triggers = this.getMappings(selectedKey);
    if (cur_triggers.length > 0) {
      const [trigger, _bind] = cur_triggers[0];
      log.debug('Found trigger for selected key:', trigger);
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
    } else {
      log.debug('No trigger found for selected key, creating new KeyPress trigger.');
      const trigger = new KeyPress(selectedKey);
      setTrigger(trigger);
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

  getMappings(selectedKey: string | null): Array<[Trigger, Bind]> {
    if (!selectedKey) return [];
    return Array.from(this.activeLayer.remappings.entries())
      .filter(([trigger, _bind]) => {
        const triggerKey = (trigger as { value?: string }).value;
        return typeof triggerKey === 'string' && triggerKey === selectedKey;
      });
  }
}
