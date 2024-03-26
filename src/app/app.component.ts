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
    // Вызываем метод addNewNode() из инжектированного сервиса MyEditor
    // this.myEditor.addNewNode();
    // const socket = new ClassicPreset.Socket("socket");
    // const socket = new ClassicPreset.Socket("socket"); // Создание экземпляра socket

    this.editorService.addNewNode();

  }
}
