import log from 'electron-log';
import { Bind, Macro_Bind } from '../../../../models/Bind';
import { Layer } from '../../../../models/Layer';
import { Profile } from '../../../../models/Profile';
import { Trigger, KeyPress } from '../../../../models/Trigger';

export type ProfileStateChangeCallback = (binds: Macro_Bind, trigger: Trigger) => void;


// ProfileController class with comprehensive profile management
export class ProfileController {
  public activeLayer: Layer;
  public footerOpen: boolean = false;
  private _currentBinds: Macro_Bind = new Macro_Bind([]);
  private _currentTrigger: Trigger = new KeyPress('UNDEFINED');
  private stateChangeCallbacks: Set<ProfileStateChangeCallback> = new Set();

  constructor(public profile: Profile, public editedProfileIndex: number, public onUpSave: (profileControler: ProfileController) => void) {
    this.activeLayer = this.profile.layers[0];
    log.silly(`ProfileController initialized for profile: ${this.profile.profile_name}`);
  }

  get currentBinds(): Macro_Bind {
    return this._currentBinds;
  }

  set currentBinds(binds: Macro_Bind) {
    this._currentBinds = binds;
    this.notifyStateChange();
  }

  get currentTrigger(): Trigger {
    return this._currentTrigger;
  }

  set currentTrigger(trigger: Trigger) {
    this._currentTrigger = trigger;
    this.notifyStateChange();
  }

  clearMapping(): void {
    log.silly('Clearing current mapping.');
    this._currentBinds = new Macro_Bind([]);
    this._currentTrigger = new KeyPress('UNDEFINED');
    this.notifyStateChange();
  }

  addStateChangeListener(callback: ProfileStateChangeCallback): () => void {
    this.stateChangeCallbacks.add(callback);
    log.silly('Added state change listener, current count:', this.stateChangeCallbacks.size);
    return () => {
      this.stateChangeCallbacks.delete(callback);
      log.silly('Removed state change listener, current count:', this.stateChangeCallbacks.size);
    };
  }

  private notifyStateChange(): void {
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback(this._currentBinds, this._currentTrigger);
      } catch (err) {
        log.error('Error in state change callback:', err);
      }
    });
  }

  onSave(): void {
    log.debug(`Profile is being updated and saved. Updated profile: ${this.profile.profile_name}`)
    window.api.updateProfile(this.editedProfileIndex, this.profile.toJSON())
    this.onUpSave(this);
  }

  addBind(trigger: Trigger, binds: Macro_Bind): void {
    if (!trigger) {
      log.warn('No trigger provided to addBind. Aborting.');
      return;
    }
    if (binds.binds.length === 0) {
      log.warn('No binds provided to addBind. Aborting.');
      return;
    }
    log.debug('Adding bind:', binds, 'to trigger:', trigger);

    this.activeLayer.addRemapping(trigger, binds)
    this.onSave();
  }

  removeBind(trigger: Trigger | null, setBind: (bind: Macro_Bind) => void): void {
    if (!trigger) {
      log.warn('No trigger provided to removeBind. Aborting.');
      return;
    }
    log.debug('Removing bind from trigger:', trigger);

    setBind(new Macro_Bind([]));
    this.activeLayer.deleteRemapping(trigger);
    this.onSave();
  }

  setLayer(index: number): void {
    log.silly('Setting active layer to index:', index);
    this.activeLayer = this.profile.layers[index];
  }

  setSelectedKey(selectedKey: string | null): void {
    log.silly('Setting selected key:', selectedKey);

    if (!selectedKey || selectedKey === '') {
      this.clearMapping();
      return;
    }

    const cur_triggers = this.getMappings(selectedKey);
    if (cur_triggers.length > 0) {
      const [trigger, _bind] = cur_triggers[0];
      log.debug('Found trigger for selected key:', trigger);
      this.currentTrigger = trigger;
      const bind = this.activeLayer.getRemapping(trigger);
      log.debug('Found binds for trigger:', bind);
      if (bind instanceof Macro_Bind) {
        this.currentBinds = bind;
      } else if (bind) {
        this.currentBinds = new Macro_Bind([bind]);
      } else {
        log.warn('No bind found for selected key:', selectedKey);
        this.currentBinds = new Macro_Bind([]);
      }
    } else {
      log.debug('No trigger found for selected key, creating new KeyPress trigger.');
      this.currentTrigger = new KeyPress(selectedKey);
      log.warn('No bind found for selected key:', selectedKey);
      this.currentBinds = new Macro_Bind([]);
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

  setBinds(binds: Macro_Bind): void {
    log.debug('Setting currentBinds:', binds);
    this.currentBinds = binds;
    if (this.currentTrigger && binds.binds.length > 0) {
      this.addBind(this.currentTrigger, binds);
    }
  }

  setTrigger(trigger: Trigger): void {
    log.debug('Setting currentTrigger:', trigger);
    this.currentTrigger = trigger;
    if (this.currentBinds.binds.length > 0) {
      this.addBind(trigger, this.currentBinds);
    }
  }

  changeTrigger(newTrigger: Trigger) {
    log.debug('Changing trigger to:', newTrigger, 'with binds:', this.currentBinds);

    this.activeLayer.deleteRemapping(this.currentTrigger);
    this.currentTrigger = newTrigger;
    this.addBind(newTrigger, this.currentBinds);
  }
}
