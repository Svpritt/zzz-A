import { ClassicPreset } from "rete";
import {  } from "rete";


export class MyCustomNode extends ClassicPreset.Node {

  
  constructor(socket: ClassicPreset.Socket) {
    super("MyCustomNode");
    this.addControl("text", new ClassicPreset.InputControl("text", { initial: "Введите текст" }));

    this.addInput("in", new ClassicPreset.Input(socket));
    this.addOutput("out", new ClassicPreset.Output(socket));
    
  }
  

}
