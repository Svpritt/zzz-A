import { ClassicPreset } from "rete";

export class NodeB extends ClassicPreset.Node {
  constructor(socket: ClassicPreset.Socket) {
    super("Alala");
    this.addControl("b", new ClassicPreset.InputControl("text", { initial: "Начальное значение" }));
    this.addOutput("a", new ClassicPreset.Output(socket));

    this.addInput("b", new ClassicPreset.Input(socket, undefined, true)); //мультиконекшн просто тру фалс 3й параметр, но тогда второй обящателен
    return this;
  }
}
