import { Bind } from "./Bind";
import { Trigger } from "./Trigger";

export class Modification {
  private static next_id = 0;

  readonly id: number;
  readonly name: string;
  readonly trigger: Trigger;
  readonly bind: Bind;

  constructor(name: string, trigger: Trigger, bind: Bind) {
    this.id = Modification.next_id++;
    this.name = name;
    this.trigger = trigger;
    this.bind = bind;
  }

  static fromJSON(modData: any): Modification {
    return new Modification(
      modData.name,
      modData.trigger,
      modData.bind,
    );
  }
  toJSON(): object {
    return {
      name: this.name,
      trigger: this.trigger,
      bind: this.bind,
    };
  }
}
