// node-creator.service.ts

import { Injectable } from '@angular/core';
import { ClassicPreset } from 'rete';
import { NodeEditor } from 'rete';


@Injectable({
  providedIn: 'root'
})
export class NodeCreatorService {

  constructor() { }

  createCustomNode(socket: ClassicPreset.Socket): ClassicPreset.Node {
    const customNode = new ClassicPreset.Node("Custom");
    customNode.addControl("a", new ClassicPreset.InputControl("text", { initial: "first" }));
    customNode.addOutput("a", new ClassicPreset.Output(socket));



    return customNode;
  }
}
