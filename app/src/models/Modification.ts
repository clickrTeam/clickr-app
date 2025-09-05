import { Trigger } from "./Trigger"
import { Bind } from "./Bind"
export enum ModType {
  Advanced = 'advanced'
}

//TOOD: Should this be an abstract class or just an interface
export abstract class Modification {
  abstract toJSON(): object
  abstract toLL(): LLMod
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
  toLL(): LLMod {
    return {
      from: this.trigger.toLL(),
      to: this.bind.toLL(),
      //todo: how should this be set
      priority: 1
    };
  }

  static fromJSON(o: object): AdvancedModificaiton {
    throw new Error("")

  }

}
