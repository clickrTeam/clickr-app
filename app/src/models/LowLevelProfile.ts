export type LLProfile = {
  profile_name: string
  default_layer: number
  layers: LLLayer[]
}

export type LLLayer = {
  layer_name: string
  remappings: LLRemapping[]
}

export type LLRemapping = LLBasicRemapping | LLSequenceRemapping

export type LLBasicRemapping = {
  trigger: LLBasicTrigger
  binds: LLBind[]
}

export type LLBehavior = 'capture' | 'release' | 'default'
export type LLSequenceRemapping = {
  triggers: LLAdvancedTrigger[]
  binds: LLBind[]
  behavior: LLBehavior
}

export type LLBasicTrigger = LLKeyPress | LLKeyRelease | LLAppFocus

export type LLAdvancedTrigger =
  | LLKeyPress
  | LLKeyRelease
  | LLAppFocus
  | LLMinimumWait
  | LLMaximumWait

export type LLKeyPress = {
  type: 'key_press'
  value: string
}

export type LLKeyRelease = {
  type: 'key_release'
  value: string
}

export type LLAppFocus = {
  type: 'app_focused'
  app_name: string
}

export type LLMinimumWait = {
  type: 'minimum_wait'
  duration: number
}

export type LLMaximumWait = {
  type: 'maximum_wait'
  duration: number
}

export type LLBind = LLPressKey | LLReleaseKey | LLSwapLayer | LLWait | LLRunScript

export type LLPressKey = {
  type: 'press_key'
  value: string
}

export type LLReleaseKey = {
  type: 'release_key'
  value: string
}

export type LLSwapLayer = {
  type: 'switch_layer'
  value: number
}

export type LLWait = {
  type: 'wait'
  duration: number
}
export type LLRunScript = {
  type: 'run_script'
  interpreter: string
  script: string
}
