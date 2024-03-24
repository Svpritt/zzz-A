import { Injectable, Injector, ElementRef } from '@angular/core';
import { MyEditor } from './editor';

@Injectable({
  providedIn: 'root'
}) 
export class EditorService {

    constructor(private injector: Injector) {}

    private editor!: MyEditor;

  createEditor(el: HTMLElement) {
    this.editor = new MyEditor(el, this.injector);
    this.editor.createEditor();
    
  }
  addNewNode() {
    this.editor.addNewNode();
  }
  
  addControl() {
    this.editor.addControl();
  }
  
}
