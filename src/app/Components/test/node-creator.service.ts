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

  createCustomNode(socket: ClassicPreset.Socket): ClassicPreset.Node {
    const customNode = new ClassicPreset.Node("Custom");
    console.log(customNode.id)
    customNode.addControl("a", new ClassicPreset.InputControl("text", { initial: "first" }));
    customNode.addOutput("a", new ClassicPreset.Output(socket));
    customNode.addInput("b", new ClassicPreset.Input(socket, undefined, true)); //мультиконекшн просто тру фалс 3й параметр, но тогда второй обящателен
    return customNode;
  }
}
