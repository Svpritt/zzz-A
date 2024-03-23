import { ClassicPreset } from "rete";

export class NodeA extends ClassicPreset.Node {
  constructor(socket: ClassicPreset.Socket) {
    super("Ololo");
    this.addControl("a", new ClassicPreset.InputControl("text", {}));
    this.addOutput("a", new ClassicPreset.Output(socket));
    return this;
  }
}
