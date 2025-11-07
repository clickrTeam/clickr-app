import log from 'electron-log';
import { Bind, Macro } from '../../../../models/Bind';
import { Layer } from '../../../../models/Layer';
import { Profile } from '../../../../models/Profile';
import { Trigger, KeyPress } from '../../../../models/Trigger';

export type ProfileStateChangeCallback = (binds: Macro, trigger: Trigger) => void;

// ProfileController class with comprehensive profile management
export class ProfileController {
  public footerOpen: boolean = false;
  private _currentBinds: Macro = new Macro([]);
  private _currentTrigger: Trigger = new KeyPress('UNDEFINED');
  private stateChangeCallbacks: Set<ProfileStateChangeCallback> = new Set();

  public activeLayer?: Layer;
  public profile?: Profile;
  private editedProfileIndex?: number;
  private onUpSave?: ((profileController: ProfileController) => void);

  setup(_profile: Profile, _editedProfileIndex: number, _onUpSave: (profileController: ProfileController) => void) {
    this.profile = _profile;
    this.editedProfileIndex = _editedProfileIndex;
    this.onUpSave = _onUpSave;
    this.activeLayer = _profile.layers[0];
    log.debug(`ProfileController initialized for profile: ${_profile.profile_name}`);
  }

  get currentBinds(): Macro {
    return this._currentBinds;
  }

  set currentBinds(binds: Macro) {
    if (binds === this.currentBinds) return;
    log.debug('Setting currentBinds:', binds);
    this._currentBinds = binds;
    if (this.currentTrigger && binds.binds.length > 0) {
      this.addBind();
    }
    this.notifyStateChange();
  }

  get currentTrigger(): Trigger {
    return this._currentTrigger;
  }

  set currentTrigger(trigger: Trigger) {
    if (trigger === this.currentTrigger) return;
    log.debug('Setting currentTrigger:', trigger);
    this._currentTrigger = trigger;
    if (this.currentBinds.binds.length > 0) {
      this.addBind();
    }
    this.notifyStateChange();
  }

  clearMapping(): void {
    log.debug('Clearing current mapping.');
    this.currentBinds = new Macro([]);
    this.currentTrigger = new KeyPress('UNDEFINED');
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

  private saveTimeout: NodeJS.Timeout | null = null;

  onSave(): void {
    if (!this.profile || this.editedProfileIndex === undefined || !this.onUpSave || !this.editedProfileIndex) {
      log.warn('ProfileController not properly initialized for saving. Aborting onSave.');
      return;
    }
    // Clear any existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Set new timeout
    this.saveTimeout = setTimeout(() => {
      log.debug(`Profile is being updated and saved. Updated profile: ${this.profile!.profile_name}`)
      window.api.updateProfile(this.editedProfileIndex!, this.profile!.toJSON())
      this.onUpSave!(this);
      this.saveTimeout = null;
    }, 350);
  }

  addBind(): void {
    if (!this.currentTrigger) {
      log.warn('No trigger provided to addBind. Aborting.');
      return;
    }
    else if ((this.currentTrigger as { value?: string }).value === 'UNDEFINED') {
      log.warn('Current trigger is UNDEFINED. Aborting addBind:', this.currentTrigger);
      return;
    }
    else if (this.currentBinds.binds.length === 0) {
      log.warn('No binds provided to addBind. Aborting.');
      return;
    }
    log.debug('Adding bind:', this.currentBinds, 'to trigger:', this.currentTrigger);

    this.activeLayer!.addRemapping(this.currentTrigger, this.currentBinds);
    this.onSave();
  }

  removeBind(trigger: Trigger | null): void {
    if (!trigger) {
      log.warn('No trigger provided to removeBind. Aborting.');
      return;
    }
    log.debug('Removing bind from trigger:', trigger);

    this.currentBinds = new Macro([]);
    this.activeLayer!.deleteRemapping(trigger);
    this.onSave();
  }

  clearBinds(): void {
    log.debug('Clearing all binds from active layer.');
    this._currentBinds = new Macro([]);
    this.notifyStateChange();
  }

  swapToMapping(mapping: [Trigger, Bind]): void {
    console.log('Swap to mapping', mapping);
    this._currentTrigger = mapping[0];
    this._currentBinds = mapping[1] instanceof Macro ? mapping[1] : new Macro([mapping[1]]);
    this.notifyStateChange();
  }

  setLayer(index: number): void {
    log.silly('Setting active layer to index:', index);
    this.activeLayer = this.profile!.layers[index];
  }

  setSelectedKey(selectedKey: string | null): void {
    log.silly('Setting selected key:', selectedKey);

    if (!selectedKey || selectedKey === '') {
      this.clearMapping();
      return;
    }
    if (selectedKey === 'UNDEFINED') {
      return;
    }

    const cur_triggers = this.getMappings(selectedKey);
    if (cur_triggers.length > 0) {
      const [trigger, _bind] = cur_triggers[0];
      log.debug('Found trigger for selected key:', trigger);
      this._currentTrigger = trigger;
      const bind = this.activeLayer!.getRemapping(trigger);
      log.debug('Found binds for trigger:', bind);
      if (bind instanceof Macro) {
        this.currentBinds = bind;
      } else if (bind) {
        this.currentBinds = new Macro([bind]);
      } else {
        log.warn('No bind found for selected key:', selectedKey);
        this.currentBinds = new Macro([]);
      }
    } else {
      log.debug('No trigger found for selected key, creating new KeyPress trigger.');
      this._currentTrigger = new KeyPress(selectedKey);
      log.warn('No bind found for selected key:', selectedKey);
      this.currentBinds = new Macro([]);
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
    return this.profile!;
  }

  getMappings(selectedKey: string | null): Array<[Trigger, Bind]> {
    if (!selectedKey) return [];
    return Array.from(this.activeLayer!.remappings.entries())
      .filter(([trigger, _bind]) => {
        const triggerKey = (trigger as { value?: string }).value;
        return typeof triggerKey === 'string' && triggerKey === selectedKey;
      });
  }

  changeTrigger(newTrigger: Trigger) {
    log.debug('Changing trigger to:', newTrigger, 'with binds:', this._currentBinds);

    this.activeLayer!.deleteRemapping(this.currentTrigger);
    this.currentTrigger = newTrigger;
  }

  setLayerName(value: string) {
    this.activeLayer!.layer_name = value;
    log.debug('Layer name set to:', value);
    this.onSave();
  }
}

const profileController = new ProfileController();
export default profileController;
