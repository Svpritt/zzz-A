import { Component, Input, OnInit } from "@angular/core";
import { ClassicPreset } from "rete";

export class ImageControl extends ClassicPreset.Control {
  constructor(public imageUrl: string | null) {
    super();
  }
}
@Component({
  selector: "app-image-component",
  template: `
  <div>
    <img *ngIf="data.imageUrl" [src]="data.imageUrl" alt="Uploaded Image" style="width:100px; height:100px"/>
</div>
     `
})
export class ImageComponent {
  @Input() data!: ImageControl; //ошибка, поставил ! думаю дата по другому сюда не попадет.
}
