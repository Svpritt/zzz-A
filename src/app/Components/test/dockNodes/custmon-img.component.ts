import { Component, Input } from "@angular/core";
import { ClassicPreset } from "rete";

export class ImgControl extends ClassicPreset.Control {
  constructor(public label: string, public onClick: () => void) {
    super();
  }
}

@Component({
  selector: "app-img",
  template: `<div
    class="img-container"
    (click)="handleClick($event)"
  >
    <img [src]="imageUrl" alt="Uploaded Image" *ngIf="imageUrl" />
    <span *ngIf="!imageUrl">Click to Upload Image</span>
  </div>`,
  styleUrls: ["./img.component.css"]
})
export class ImgComponent {
  @Input() data!: ImgControl;
  imageUrl: string | null = null;

  handleClick(event: MouseEvent) {
    // Здесь вы можете добавить логику для загрузки изображения
    // Например, показать диалоговое окно выбора файла
    // Или использовать HTMLInputElement для выбора файла и обработки его
    // После загрузки изображения, установите его URL в imageUrl
  }
}
    