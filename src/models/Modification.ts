import { Bind } from "./Bind";
import { Trigger } from "./Trigger";

export class Modification {
  private static next_id = 0;

  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly trigger: Trigger;
  readonly bind: Bind;

  constructor(name: string, description: string, trigger: Trigger, bind: Bind) {
    this.id = Modification.next_id++;
    this.name = name;
    this.description = description;
    this.trigger = trigger;
    this.bind = bind;
  }

  static fromJSON(modData: any): Modification {
    return new Modification(
      modData.name,
      modData.description,
      modData.trigger,
      modData.bind
    );
  }
  toJSON(): string {
    return JSON.stringify({
      name: this.name,
      description: this.description,
      trigger: this.trigger,
      bind: this.bind,
    });
  }
}
