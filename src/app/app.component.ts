// Ваш компонент, из которого вы хотите вызвать метод addNewNode()

import { Component } from '@angular/core';
import { EditorControlService } from './Components/test/editorControl.service';
import { SocketComponent } from 'rete-angular-plugin';
import { ClassicPreset } from 'rete';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

})
export class AppComponent {
  constructor(private editorService: EditorControlService) {} 
  
  addOnClick() {
    this.editorService.addNewNode();
  }
  addControltoSelectNode(){
    this.editorService.addControl();
  }
  addRemoveBtn() {
    this.editorService.addButton();
  }
  addImage(){
    this.editorService.addImage();
  }
  addText(){
    this.editorService.addText();
  }

}
