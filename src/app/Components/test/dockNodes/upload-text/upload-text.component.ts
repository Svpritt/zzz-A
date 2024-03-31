import { Component } from '@angular/core';
import { TextStateService } from 'src/app/services/text-state.service';
import { EditorControlService } from '../../editorControl.service';
@Component({
  selector: 'app-upload-text',
  templateUrl: './upload-text.component.html',
  styleUrls: ['./upload-text.component.css']
})
export class UploadTextComponent {
  textValue: string = ''; // Переменная для хранения введенного текста

  constructor(private textStateService: TextStateService, private editorService: EditorControlService) {}

  // Метод для передачи текста в сервис
  uploadText(): void {
    this.textStateService.setText(this.textValue);
    // console.log(this.textStateService.getText()) //worked
    this.editorService.addText();
    
  }
}
