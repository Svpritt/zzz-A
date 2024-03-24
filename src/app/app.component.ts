// Ваш компонент, из которого вы хотите вызвать метод addNewNode()

import { Component } from '@angular/core';
import { EditorService } from './Components/test/editorControl.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

})
export class AppComponent {
  constructor(private editorService: EditorService) {} 
  
  addOnClick() {
    // Вызываем метод addNewNode() из инжектированного сервиса MyEditor
    // this.myEditor.addNewNode();
    this.editorService.addNewNode();

  }
}
