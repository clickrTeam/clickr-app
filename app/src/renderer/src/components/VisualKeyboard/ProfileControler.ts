import log from 'electron-log';
import { Layer } from '../../../../models/Layer';
import { Profile } from '../../../../models/Profile';
import * as T from '../../../../models/Trigger';
import * as B from '../../../../models/Bind';



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

  addBind(trigger: T.Trigger | null, binds: B.Bind[]): void {
    if (!trigger) {
      log.warn('No trigger provided to addBind. Aborting.');
      return;
    }
    if (binds.length === 0) {
      log.warn('No binds provided to addBind. Aborting.');
      return;
    }
    log.debug('Adding bind:', binds, 'to trigger:', trigger);

    this.activeLayer.addRemapping(trigger, new B.Macro_Bind(binds)) // TODO support multiple triggers
    this.onSave();
  }

  removeBind(trigger: T.Trigger | null, setBind: (bind: B.Bind[]) => void): void {
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

  setSelectedKey(selectedKey: string | null, setBind: (bind: B.Bind[]) => void, setTrigger: (trigger: T.Trigger | null) => void): void {
    log.silly('Setting selected key:', selectedKey);

    if (!selectedKey) {
      log.silly('No key selected, clearing binds and trigger.');
      setTrigger(null);
      setBind([]);
      return;
    }
    selectedKey = selectedKey || '';

    const trigger = new T.KeyPress(selectedKey);
    setTrigger(trigger);
    const bind = this.activeLayer.getRemapping(trigger);
    log.debug('Found binds for trigger:', bind);
    if (bind instanceof B.Macro_Bind) {
      setBind(bind.binds);
    } else if (bind) {
      setBind([bind]);
    } else {
      log.warn('No bind found for selected key:', selectedKey);
      setBind([]);
    }
  }

  getActiveRemappings(): Map<T.Trigger, B.Bind> {
    if (!this.activeLayer) {
      log.warn('No active layer found. Returning empty remappings.');
      return new Map();
    }
    return this.activeLayer.remappings;
  }

  getProfile(): Profile {
    return this.profile;
  }

  public getDisplayForTrigger(trigger: T.Trigger): string | null {
  const bind = this.activeLayer.getRemapping(trigger)
  let display_val = null

  if (bind?.bind_type != undefined) {
    log.info(`Getting display for trigger. Associated bind is of type ${bind?.bind_type}`)
    log.info('bind raw:', bind)
    log.info('keys:', Object.keys(bind ?? {}))
    log.info('bind.type:', (bind as any)?.type, 'bind.bind_type:', (bind as any)?.bind_type)
    log.info('proto:', Object.getPrototypeOf(bind))
    log.info('ctor:', bind ? Object.getPrototypeOf(bind).constructor.name : 'none')

  }

  // simple key binds
  if (bind?.bind_type === B.BindType.PressKey || 
    bind?.bind_type === B.BindType.ReleaseKey || 
    bind?.bind_type === B.BindType.TapKey) {
    display_val = (bind as B.PressKey | B.TapKey | B.ReleaseKey).value.toUpperCase()
  }
  else if (bind instanceof B.SwapLayer) {
    // @todo Probably should add a small logo here. This is verbose.
    display_val = "Swap to Layer " + (bind as B.SwapLayer).layer_number 
  }
  else if (bind === undefined) {
    // do nothing
  }
    
  else {
    // Bind is a macro, this would be difficult to communicate visually
    display_val = "Macro"
  }

  return display_val
}
}
