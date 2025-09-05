type LLProfile = {
  layers: LLMod[][]
}

type LLMod = {
  from: LLFrom
  to: LLTo
  priority: number
}

type LLFrom = {
  type: "key_up" | "key_down",
  key_code: string,
} | {
  type: "timeout" | "wait"
  ms: number
}

type LLTo = {
  type: "press_key" | "release_key",
  key_code: string,
} | {
  type: "swap_layer"
  layer: number
} | {
  type: "wait"
  ms: number
}
