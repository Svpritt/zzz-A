// node-creator.service.ts

import { Injectable } from '@angular/core';
import { ClassicPreset } from 'rete';

@Injectable({
  providedIn: 'root'
})
export class NodeCreatorService {

  constructor() {

   }

  createCustomNode(socket: ClassicPreset.Socket): ClassicPreset.Node {
    const customNode = new ClassicPreset.Node("Custom");
    // console.log(customNode.id)
    customNode.addControl("a", new ClassicPreset.InputControl("text", { initial: customNode.id }));
    customNode.label = customNode.id;
    const classicOutput = new ClassicPreset.Output(socket, "defind", false);
    const outputsJson =  JSON.stringify(classicOutput)
    const outputsObject = JSON.parse(outputsJson);

    customNode.addOutput(outputsObject.id, classicOutput ); //сокет имеет уникальный нейм или кей поэтому при создании сокета
    // customNode.addOutput(outputsObject.id, new ClassicPreset.Output(socket, "defind", false)); // надо давать ему лейбл и кей===лейбл+id как то так уникализировать
    customNode.addInput("Input", new ClassicPreset.Input(socket, undefined, true)); //мультиконекшн просто тру фалс 3й параметр, но тогда второй обящателен
    return customNode;
  }
  
}
