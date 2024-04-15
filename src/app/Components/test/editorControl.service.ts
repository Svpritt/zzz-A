import { Injectable, Injector, ElementRef, ApplicationRef, ComponentFactoryResolver } from '@angular/core';
import { MyEditor } from './editor';
import {GetSchemes, ClassicPreset} from "rete"
import { classic } from 'rete-angular-plugin/presets';
import { NodeCreatorService } from './node-creator.service';
import { ImageService } from 'src/app/services/imgUrl.service';
import { TextStateService } from 'src/app/services/text-state.service';
import { NodeFactory } from 'rete-context-menu-plugin/_types/presets/classic/types';



type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;

@Injectable({
  providedIn: 'root'
}) 
export class EditorControlService {

    constructor(private injector: Injector,
      private appRef: ApplicationRef,
    private resolver: ComponentFactoryResolver,
    private imageService: ImageService // Внедрите ImageService
    ) {
    }
    private editor!: MyEditor;

  async createEditor(el: HTMLElement) {

    this.editor = new MyEditor(el, this.injector, new NodeCreatorService(), new ImageService(), new TextStateService(),);
  //  this.editor.nodes.push()
    
    await this.editor.createEditor();
    
  }
  log(){
    
    return     this.editor.area.area.content.holder  //возразает HTML со всем контентом... хз как это использовать. оставлю пока тут
  }
  
  addNewNode() {
    return   this.editor.addNewNode();
  }
  
  addControl() {
    return this.editor.addControl();
  }

  addButton(){
    return this.editor.addButton();
  }
  
  addImage(){
    return this.editor.addImageComponent();
  }

  addText(){
    return this.editor.addTextBoxComponent();
  }
  
  addOutputControl(){
    return this.editor.addNewOutputControl();
  }
  
}
