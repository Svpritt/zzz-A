// node-creator.service.ts

import { Injectable } from '@angular/core';
import { ClassicPreset } from 'rete';
import { NodeEditor } from 'rete';
import { CustomNodeComponent } from './dockNodes/custom-node/custom-node.component';


@Injectable({
  providedIn: 'root'
})
export class NodeCreatorService {

  constructor() {

   }
   handleNodePicked(event: CustomEvent) {
    // Обработка события nodepicked
    console.log('Node picked event:', event.detail);
  }


  createCustomNode(socket: ClassicPreset.Socket): ClassicPreset.Node {
    const customNode = new ClassicPreset.Node("Custom");
console.log(customNode.id)
if(customNode.selected){
  console.log("selected", customNode.id)
}
    customNode.addControl("a", new ClassicPreset.InputControl("text", { initial: "first" }));
    customNode.addOutput("a", new ClassicPreset.Output(socket));


    return customNode;
  }
}
