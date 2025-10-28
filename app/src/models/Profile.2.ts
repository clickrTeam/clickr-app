import { BindType, TriggerType } from "./Profile.2.enum"

export type Trigger = {
  type: TriggerType
  keys: string[] | null
  waits: number[] | null
  behavior: string | null
  app: string | null
}

export type Bind = {
  type: BindType
  key: string | null
  binds: Bind[] | null
  waits: number[] | null
  execution_times: number | null
  time_delay: number | null
  times_to_execute: number | null
  cancel_trigger: Trigger | null
  layer_number: number | null
  app: string | null
}

export type Mapping = {
  trigger: Trigger
  binds: Bind[]
}

export type Layer = {
  name: string
  mappings: Mapping[]
}

export type Profile = {
  name: string
  layers: Layer[]
  OS: string
}

export const exampleProfile: Profile = {
  name: "Default",
  layers: [
    {
      name: "Base",
      mappings: []
    }
  ],
  OS: ""
}

export const toJson = (p: Profile): string => JSON.stringify(p)
