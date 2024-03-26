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
    const customNode = new ClassicPreset.Node('CustomNodeLabel');
    customNode.addControl("a", new ClassicPreset.InputControl("text", { initial: "first" }));
    customNode.addOutput("a", new ClassicPreset.Output(socket));
    if (customNode.selected === true){
        console.log("ya")
       } else {
        console.log("na")
       }
    customNode.removeOutput = function (key: keyof ClassicPreset.Node['outputs']): void {
      delete this.outputs[key];
    };

    customNode.addControl = function<K extends keyof ClassicPreset.Node['controls']>(key: K, control: ClassicPreset.Node['controls'][K]): void {
      this.controls[key] = control;
    };

    return customNode;
  }
}
