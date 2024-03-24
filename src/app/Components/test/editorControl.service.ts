import { Injectable, Injector, ElementRef } from '@angular/core';
import { MyEditor } from './editor';

@Injectable({
  providedIn: 'root'
}) 
export class EditorService {

    constructor(private injector: Injector) {}

  myEditor: MyEditor | undefined;

  newEx(){
    const el = this.container.nativeElement;
  }

  createEditor(container: HTMLElement): void {
    this.myEditor = new MyEditor(container, this.injector);
  }
}
