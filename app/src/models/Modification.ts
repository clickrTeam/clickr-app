import { deserializeTrigger, Trigger } from "./Trigger"
import { Bind, deserializeBind } from "./Bind"
import { LLRemapping } from "./LowLevelProfile";
export enum ModType {
  Advanced = 'advanced'
}

export abstract class Modification {
  abstract toJSON(): object
  abstract toLL(): LLRemapping
  abstract toString(): string
}

export class AdvancedModificaiton extends Modification {
  trigger: Trigger
  bind: Bind
  constructor(trigger: Trigger, bind: Bind) {
    super();
    this.trigger = trigger;
    this.bind = bind;
  }

  toJSON(): object {
    return {
      type: ModType.Advanced,
      trigger: this.trigger.toJSON(),
      bind: this.bind.toJSON()
    }
  }
  toLL(): LLRemapping {
    let ll_trigger = this.trigger.toLL();
    let ll_bind = this.bind.toLL();
    if ("triggers" in ll_trigger) {
      return {
        ...ll_trigger,
        binds: ll_bind
      }

    } else {
      return {
        trigger: ll_trigger,
        binds: ll_bind,
      }
    }
  }

  toString(): string {
    return `${this.trigger.toString()} → ${this.bind.toString()}`;
  }

  static fromJSON(o: any): AdvancedModificaiton {
    let trigger = deserializeTrigger(o["trigger"])
    let bind = deserializeBind(o["bind"])
    return new AdvancedModificaiton(trigger, bind);
  }
}
