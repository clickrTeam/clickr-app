import { Trigger } from "./Trigger"
import { Bind } from "./Bind"
import { LLRemapping } from "./LowLevelProfile";
export enum ModType {
  Advanced = 'advanced'
}

//TOOD: Should this be an abstract class or just an interface
export abstract class Modification {
  abstract toJSON(): object
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
      trigger: this.trigger,
      bind: this.bind
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


  static fromJSON(o: object): AdvancedModificaiton {
    throw new Error("")
  }
}
