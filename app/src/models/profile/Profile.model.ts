import { KeyPress } from '../Trigger';
import { Keycodes, ALL_KEYS, Navigation, Letters } from '../Keys.enum';

export type ProfileStorage = {
  profile_name: string
  OS: string
  layers: Layer[]
};
export type ProfileUI = {
  active_layer_index: number
};
export type Profile = ProfileStorage & ProfileUI;

export const defaultProfileStorage: ProfileStorage = {
  profile_name: 'New Profile',
  OS: 'any',
  layers: []
};
export const defaultProfileUI: ProfileUI = {
  active_layer_index: 0
};
export const defaultProfile: Profile = {
  ...defaultProfileStorage,
  ...defaultProfileUI
}


export type LayerStorage = {
  layer_name: string
  remappings: [Trigger, Bind[]][]
}
export type LayerUI = {};
export type Layer = LayerStorage & LayerUI;

export const defaultLayerStorage: LayerStorage = {
  layer_name: 'New Layer',
  remappings: []
};
export const defaultLayerUI: LayerUI = {};
export const defaultLayer: Layer = {
  ...defaultLayerStorage,
  ...defaultLayerUI
}


export enum TriggerType {
  KeyPress = 'key_press',
  KeyRelease = 'key_release',
  TapSequence = 'tap_sequence',
  Hold = 'hold_trigger',
  AppFocused = 'app_focus_trigger'
}

export type TriggerStorage = {
  type: TriggerType
  value?: Keycodes
  duration?: number
  app_name?: string
};
export type TriggerUI = {};
export type Trigger = TriggerStorage & TriggerUI;

export const defaultTriggerStorage: TriggerStorage = {
  type: TriggerType.KeyPress,
  value: Letters.A
}
export const defaultTriggerUI: TriggerUI = {};
export const defaultTrigger: Trigger = {
  ...defaultTriggerStorage,
  ...defaultTriggerUI
}

export enum BindType {
  PressKey = 'press_key',
  ReleaseKey = 'release_key',
  SwitchLayer = 'switch_layer',
  Wait = 'wait',
  RunScript = 'run_script',
}
const BIND_TYPE_LABELS: Record<BindType, string> = {
  [BindType.PressKey]: 'Key press',
  [BindType.ReleaseKey]: 'Key release',
  [BindType.SwitchLayer]: 'Switch layer',
  [BindType.Wait]: 'Wait',
  [BindType.RunScript]: 'Run Script',
}
export function getBindTypeDisplayName(value: BindType | string): string {
  return BIND_TYPE_LABELS[value] ?? 'Unknown bind'
}
const bindRenderers: Record<BindType, (b: Bind) => string> = {
  [BindType.PressKey]: b => (b as PressKey).value,
  [BindType.ReleaseKey]: b => (b as ReleaseKey).value,
  [BindType.TapKey]: b => (b as TapKey).value,
  [BindType.SwitchLayer]: b => String((b as SwapLayer).layer_number),
  [BindType.Macro]: b => String((b as Macro).binds.length),
  [BindType.TimedMacro]: b => `Timed Macro (${(b as TimedMacro).binds.length} actions)`,
  [BindType.Repeat]: () => 'Repeat Bind',
  [BindType.RunScript]: () => 'Run-Script'
}
export function getBindDisplayName(bind: Bind): string {
  const renderer = bindRenderers[bind.bind_type]
  return renderer ? renderer(bind) : 'Unknown Bind'
}

export type BindStorage = {
  type: string
  key_code: string
};
export type BindUI = {};
export type Bind = BindStorage & BindUI;

export const defaultBindStorage: BindStorage = {
  type: 'KeyPress',
  key_code: ''
};
export const defaultBindUI: BindUI = {};
export const defaultBind: Bind = {
  ...defaultBindStorage,
  ...defaultBindUI
}
