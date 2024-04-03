import { EventEmitter, Injectable } from '@angular/core';
import { UploadTextComponent } from '../Components/test/dockNodes/upload-text/upload-text.component';

@Injectable({
  providedIn: 'root'
})
export class TextStateService {
  private static text: string;
  textChanged = new EventEmitter<string>();

  constructor() {}

  setText(value: string): void {
    TextStateService.text = value;
    this.textChanged.emit(value); // <-- Emit новое значение
  }

  getText(): string | null {
    return TextStateService.text;
  }

  updateTextArea(): void {
    this.textChanged.emit(TextStateService.text); // Отправить новое значение
    //тут я задумал через эмит сделать обновление Текст.АРеа в независимом от retejs компоненте..
  }

}
