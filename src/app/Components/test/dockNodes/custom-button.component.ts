import { Component, Input } from "@angular/core";
import { ClassicPreset } from "rete";

export class ButtonControl extends ClassicPreset.Control {
  constructor(public label: string, public onClick: () => void) {
    super();
  }
}

@Component({
  selector: "app-button",
  template: `<button
    nz-button
    (pointerdown)="$event.stopPropagation()"
    (dblclick)="$event.stopPropagation()"
    (click)="data.onClick()"
  >
    {{ data.label }}
  </button>`
})
export class ButtonComponent {
  @Input() data!: ButtonControl; //ошибка, поставил ! думаю дата по другому сюда не попадет.
}
