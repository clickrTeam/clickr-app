export enum TimedKeyBehavior {
  Capture = "capture",
  Release = "release",
  Default = "default",
}

export type Link = {
  type: "link";
  key: string;
};

export type Hold = {
  type: "hold";
  key: string;
  wait: number
};

export type TapSequence = {
  type: "tap_sequence";
  keys: string[];
  tap_timeout: number;
  sequence_timeout: number;
  behavior: TimedKeyBehavior;
};

export type Macro = {
  type: "macro";
  keys: string[];
  sequence_timeout: number;
  behavior: TimedKeyBehavior;
};

export type Trigger = Link | TapSequence | Macro | Hold;

