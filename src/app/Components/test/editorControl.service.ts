import { Injectable, Injector, ElementRef } from '@angular/core';
import { MyEditor } from './editor';
import {GetSchemes, ClassicPreset} from "rete"
import { classic } from 'rete-angular-plugin/presets';
import { NodeCreatorService } from './node-creator.service';
type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;

@Injectable({
  providedIn: 'root'
}) 
export class EditorControlService {

    constructor(private injector: Injector) {

    }
    // nodes: ClassicPreset.Node[] = [];

    private editor!: MyEditor;

  async createEditor(el: HTMLElement) {
    this.editor = new MyEditor(el, this.injector,  new NodeCreatorService());
    
    
    await this.editor.createEditor();
    
 
  
    // this.editor.addControl();
  }
  
  addNewNode() {
    return this.editor.addNewNode();
  }
  
  addControl() {
    return this.editor.addControl();
  }
  
  
}
