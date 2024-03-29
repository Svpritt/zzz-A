import { Injectable, Injector, ElementRef, ApplicationRef, ComponentFactoryResolver } from '@angular/core';
import { MyEditor } from './editor';
import {GetSchemes, ClassicPreset} from "rete"
import { classic } from 'rete-angular-plugin/presets';
import { NodeCreatorService } from './node-creator.service';
import { ImageService } from 'src/app/services/imgUrl.service';
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



    this.editor = new MyEditor(el, this.injector, new NodeCreatorService(), new ImageService());
    console.log(this.editor.getImageUrl());
    this.imageService.imageUrl$.toPromise();

    await this.editor.createEditor();
  }
  
  addNewNode() {
    return this.editor.addNewNode();
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

  
  
  
}
