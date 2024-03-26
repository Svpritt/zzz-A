import { ClassicPreset } from "rete";
import {  } from "rete";


export class MyCustomNode extends ClassicPreset.Node {

  
  constructor(socket: ClassicPreset.Socket) {
    super("MyCustomNode");
    this.addControl("text", new ClassicPreset.InputControl("text", { initial: "Введите текст" }));

    this.addInput("in", new ClassicPreset.Input(socket));
    this.addOutput("out", new ClassicPreset.Output(socket));
    this.selected?.valueOf()
    if (this.selected !== undefined) {
      console.log(this.selected.valueOf());
  }
  this.selected?.valueOf()?.toString();
  
  }
  

  public customMethod(): void {
    console.log("Вызван пользовательский метод");
    // Здесь можно добавить свой код
  }
//   onValueChange(input: ClassicPreset.Input) {
//     console.log("Input value changed:", input.value);
//     return true;
//   }
  // Обработчик события изменения значения
//   onValueChange(input: Input<"text">) {
//     const newValue = input.value || ""; // Handle potential undefined value
//     console.log("Text input value changed:", newValue);
//     // Perform actions based on the new text value
//   }
  

//   // Обработчик события подключения к выходу
//   onConnect(output: ClassicPreset.Output, connection: ClassicPreset.Connection) {
//     console.log("Connected:", output.id, connection.id);
//   }

  // ... Добавить другие методы для обработки событий, изменения состояния и т.д. эти пока тоже не ворк))) 
}
