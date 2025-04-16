export type PressKey = {
  kind: "press key"
  key: string,
};

export type RelaseKey = {
  kind: "release key"
  key: string,
};

export type SwitchLayer = {
  kind: "switch layer"
  new_layer: number,
}

export type PrimitiveBind = PressKey | RelaseKey | SwitchLayer;

export type Macro = {
  type: "macro";
  keys: PrimitiveBind[];
  spacing: number[];
}

export type LinkKey = {
  type: "link key";
  key: string;
};

export type Bind = PressKey | RelaseKey | SwitchLayer | LinkKey | Macro;
