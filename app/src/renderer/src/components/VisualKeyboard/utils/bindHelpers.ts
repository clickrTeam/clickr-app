import { BindType, Bind, TapKey, PressKey, ReleaseKey } from '../../../../../models/Bind'

export function createBindFromType(type: BindType, value: string): Bind {
  switch (type) {
    case BindType.TapKey:
      return new TapKey(value)
    case BindType.PressKey:
      return new PressKey(value)
    case BindType.ReleaseKey:
      return new ReleaseKey(value)
    default:
      throw new Error(`Unsupported bind type for macro UI: ${type}`)
  }
}

export function getBindValue(bind: Bind): string {
  if (bind instanceof TapKey || bind instanceof PressKey || bind instanceof ReleaseKey) {
    return bind.value
  }
  throw new Error('Bind does not have a value property')
}
