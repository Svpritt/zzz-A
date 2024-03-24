// Ваш компонент, из которого вы хотите вызвать метод addNewNode()

import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

})
export class AppComponent {
  constructor() {} 
  
  addOnClick() {
    // Вызываем метод addNewNode() из инжектированного сервиса MyEditor
    // this.myEditor.addNewNode();
  }
}
