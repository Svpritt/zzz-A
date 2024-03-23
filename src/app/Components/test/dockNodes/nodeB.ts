import { ClassicPreset } from "rete";

export class NodeB extends ClassicPreset.Node {
  constructor(socket: ClassicPreset.Socket) {
    super("Alala");
    this.addControl("b", new ClassicPreset.InputControl("text", { initial: "Начальное значение" }));
    this.addInput("b", new ClassicPreset.Input(socket));
    return this;
  }
}
