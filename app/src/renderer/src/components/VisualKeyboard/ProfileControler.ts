import log from 'electron-log'
import { Bind, Macro } from '../../../../models/Bind'
import { Layer } from '../../../../models/Layer'
import { Profile } from '../../../../models/Profile'
import { Trigger, KeyPress, createTrigger, TriggerType } from '../../../../models/Trigger'

export type ProfileStateChangeCallback = (binds: Macro, trigger: Trigger) => void

// ProfileController class with comprehensive profile management
export class ProfileController {
  public footerOpen: boolean = false
  private _currentBinds: Macro = new Macro([])
  private _currentTrigger: Trigger = new KeyPress('UNDEFINED')
  private stateChangeCallbacks: Set<ProfileStateChangeCallback> = new Set()

  public activeLayer?: Layer
  public profile?: Profile
  private editedProfileIndex?: number
  private onUpSave?: ((profileController: ProfileController) => void)

  private _radialSelectedTriggerType: TriggerType | undefined
  get radialSelectedTriggerType(): TriggerType {
    if (!this._radialSelectedTriggerType) {
      log.error("Trying to grab radialSelectedTriggerType without setting")
      return TriggerType.KeyPress
    }
    return this._radialSelectedTriggerType
  }
  set radialSelectedTriggerType(trigger_type: TriggerType) {
    this._radialSelectedTriggerType = trigger_type
  }

  setup(_profile: Profile, _editedProfileIndex: number, _onUpSave: (profileController: ProfileController) => void) {
    if (this.profile?.profile_name == _profile.profile_name) {
      log.debug('ProfileControler already has this profile loaded ignoring.')
      return
    }
    this.profile = _profile
    this.editedProfileIndex = _editedProfileIndex
    this.onUpSave = _onUpSave
    this.activeLayer = _profile.layers[0]
    log.debug(`ProfileController initialized for profile: ${_profile.profile_name}`)

    if (!this.activeLayer) {
      log.error('FAILED TO SETUP PROFILECONTROLER, NO ACTIVE LAYER!!!')
    }
  }

  get currentBinds(): Macro {
    return this._currentBinds
  }

  set currentBinds(binds: Macro) {
    if (binds === this.currentBinds) return
    if (!(binds instanceof Macro)) {
      binds = new Macro([binds])
    }
    log.silly('Setting currentBinds:', binds);
    this._currentBinds = binds
    if (this.currentTrigger && binds.binds.length > 0) {
      this.addBind()
    }
    this.notifyStateChange()
  }

  get currentTrigger(): Trigger {
    return this._currentTrigger
  }

  set currentTrigger(trigger: Trigger) {
    if (trigger === this.currentTrigger) return
    log.silly('Setting currentTrigger:', trigger)
    this._currentTrigger = trigger
    if (this.currentBinds.binds.length > 0) {
      this.addBind()
    }
    this.notifyStateChange()
  }

  clearMapping(): void {
    log.debug('Clearing current mapping.')
    this.currentBinds = new Macro([])
    this.currentTrigger = new KeyPress('UNDEFINED')
  }

  addStateChangeListener(callback: ProfileStateChangeCallback): () => void {
    this.stateChangeCallbacks.add(callback)
    log.silly('Added state change listener, current count:', this.stateChangeCallbacks.size)
    return () => {
      this.stateChangeCallbacks.delete(callback)
      log.silly('Removed state change listener, current count:', this.stateChangeCallbacks.size)
    }
  }

  private notifyStateChange(): void {
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback(this._currentBinds, this._currentTrigger)
      } catch (err) {
        log.error('Error in state change callback:', err)
      }
    })
  }

  onSave(): void {
    if (!this.profile || this.editedProfileIndex === undefined || !this.onUpSave || !this.editedProfileIndex) {
      log.warn('ProfileController not properly initialized for saving. Aborting onSave.')
      return
    }

    log.debug(`Profile is being updated and saved. Updated profile: ${this.profile!.profile_name}`)
    window.api.updateProfile(this.editedProfileIndex!, this.profile!.toJSON())
    this.onUpSave!(this)
  }

  addBind(): void {
    if (!this.currentTrigger) {
      log.warn('No trigger provided to addBind. Aborting.')
      return
    }
    else if ((this.currentTrigger as { value?: string }).value === 'UNDEFINED') {
      log.warn('Current trigger is UNDEFINED. Aborting addBind:', this.currentTrigger)
      return
    }
    else if (this.currentBinds.binds.length === 0) {
      log.warn('No binds provided to addBind. Aborting.')
      return
    }
    log.debug('Adding bind:', this.currentBinds, 'to trigger:', this.currentTrigger)

    // Remove any existing remappings that are logically the same trigger (use equals),
    // to avoid duplicate entries when trigger identity differs but semantics are equal
    try {
      const existing = Array.from(this.activeLayer!.remappings.keys()).find((t) => {
        // prefer using equals if available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const maybeEquals = (t as any).equals
        if (typeof maybeEquals === 'function') {
          return (t as any).equals(this.currentTrigger)
        }
        // fallback: shallow compare JSON
        try {
          return JSON.stringify(t) === JSON.stringify(this.currentTrigger)
        } catch (err) {
          return false
        }
      })
      if (existing) {
        log.debug('Found existing equivalent trigger, removing before re-adding:', existing)
        this.activeLayer!.deleteRemapping(existing)
      }
    } catch (err) {
      log.warn('ERROR while checking for existing triggers to dedupe:', err)
    }

    this.activeLayer!.addRemapping(this.currentTrigger, this.currentBinds)
    this.onSave()
  }

  removeBind(trigger: Trigger | null): void {
    if (!trigger) {
      log.warn('No trigger provided to removeBind. Aborting.')
      return
    }
    log.debug('Removing bind from trigger:', trigger)

    this.currentBinds = new Macro([])
    this.activeLayer!.deleteRemapping(trigger)
    this.onSave()
  }

  clearBinds(): void {
    log.debug('Clearing all binds from active layer.')
    this._currentBinds = new Macro([])
    this.notifyStateChange()
  }

  swapToMapping(mapping: [Trigger, Bind]): void {
    console.log('Swap to mapping', mapping)
    this._currentTrigger = mapping[0]
    this._currentBinds = mapping[1] instanceof Macro ? mapping[1] : new Macro([mapping[1]])
    this.notifyStateChange()
  }

  setLayer(index: number): void {
    log.silly('Setting active layer to index:', index)
    this.activeLayer = this.profile!.layers[index]
  }

  setSelectedKey(selectedKey: string | null, trigger_type: TriggerType = TriggerType.KeyPress): void {
    if (trigger_type === TriggerType.AppFocused) return
    if (trigger_type === TriggerType.TapSequence) return
    log.debug('Setting selected key:', selectedKey)

    if (!selectedKey || selectedKey === '') {
      this.clearMapping()
      return
    }
    if (selectedKey === 'UNDEFINED') {
      return
    }

    const cur_triggers = this.getMappings(selectedKey)
    if (cur_triggers.length > 0) {
      const [trigger, _bind] = cur_triggers[0]
      log.debug('Found trigger for selected key:', trigger)
      this._currentTrigger = trigger
      const bind = this.activeLayer!.getRemapping(trigger)
      log.debug('Found binds for trigger:', bind)
      if (bind instanceof Macro) {
        this._currentBinds = bind
      } else if (bind) {
        this._currentBinds = new Macro([bind])
      } else {
        log.warn('No bind found for selected key:', selectedKey)
        this._currentBinds = new Macro([])
      }
    } else {
      log.debug('No trigger found for selected key, creating new KeyPress trigger.')
      const newTrigger = createTrigger(trigger_type, selectedKey)
      if (!newTrigger) {
        log.warn("Profile controller failed to create trigger.")
        return
      }
      this._currentTrigger = newTrigger
      log.warn('No bind found for selected key:', selectedKey)
      this._currentBinds = new Macro([])
    }

    this.notifyStateChange()
  }

  getActiveRemappings(): Map<Trigger, Bind> {
    if (!this.activeLayer) {
      log.warn('No active layer found. Returning empty remappings.')
      return new Map()
    }
    return this.activeLayer.remappings
  }

  getProfile(): Profile {
    return this.profile!
  }

  getMappings(selectedKey: string | null): [Trigger, Bind][] {
    if (!selectedKey) return []
    return Array.from(this.activeLayer!.remappings.entries())
      .filter(([trigger, _bind]) => {
        const triggerKey = (trigger as { value?: string }).value
        return typeof triggerKey === 'string' && triggerKey === selectedKey
      }) ?? []
  }

  changeTrigger(newTrigger: Trigger) {
    log.debug('Changing trigger to:', newTrigger, 'with binds:', this._currentBinds)

    this.activeLayer!.deleteRemapping(this.currentTrigger)
    this.currentTrigger = newTrigger
  }

  setLayerName(value: string) {
    this.activeLayer!.layer_name = value
    log.debug('Layer name set to:', value)
    this.onSave()
  }
}

const profileController = new ProfileController()
export default profileController
