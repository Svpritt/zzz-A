import { Component, AfterViewInit } from '@angular/core';
import { TextStateService } from 'src/app/services/text-state.service';
import { EditorControlService } from '../../editorControl.service';

@Component({
  selector: 'app-upload-text',
  templateUrl: './upload-text.component.html',
  styleUrls: ['./upload-text.component.css']
})
export class UploadTextComponent {
  public textValue!: string;

  constructor(private textStateService: TextStateService, private editorService: EditorControlService) { 
    }

 
  uploadText(): void {
    this.textStateService.setText(this.textValue);
    this.editorService.addText();
  }
}
