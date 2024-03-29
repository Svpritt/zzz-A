import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextStateService {
  private static text: string | null = null;

  constructor() {}

  setText(value: string): void {
    TextStateService.text = value;
  }

  getText(): string | null {
    return TextStateService.text;
  }
}
