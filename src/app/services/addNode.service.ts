// import { Injectable, Injector } from '@angular/core';
// import { MyEditor } from '../Components/test/editor';
// import { NodeEditor, GetSchemes, ClassicPreset } from "rete";

// @Injectable({
//   providedIn: 'root'
// })
// export class MyService {
//     private socket: ClassicPreset.Socket | undefined;
//     private nodes: ClassicPreset.Node[] = [];
//   constructor(private editor: MyEditor) { }
//   public async addNewNode() {

//     function createCustomNode(socket: ClassicPreset.Socket): ClassicPreset.Node {
//       const customNode = new ClassicPreset.Node('CustomNodeLabel'); // Создание экземпляра узла с меткой 'CustomNodeLabel'
//       customNode.addControl("a", new ClassicPreset.InputControl("text", {initial: "first"})); // Добавление контроля
//       customNode.addOutput("a", new ClassicPreset.Output(socket)); // Добавление выхода
//       // Добавляем метод для удаления выхода
//       customNode.removeOutput = function(key: keyof ClassicPreset.Node['outputs']): void {
//         delete this.outputs[key];
//       };
    
//       // Добавляем метод для добавления контрола
//       customNode.addControl = function<K extends keyof ClassicPreset.Node['controls']>(key: K, control: ClassicPreset.Node['controls'][K]): void {
//         this.controls[key] = control;
//       };
    
//       return customNode; // Возвращение созданного узла
//     }
  
//     const node = createCustomNode(this.editor.socket);
  
//     this.nodes = [...this.nodes, node];
  
//     // this.editor.addNewNode();
//   }
// }
