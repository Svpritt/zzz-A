import { Component, Input } from '@angular/core';
import { ClassicPreset } from "rete";


export class TextControl extends ClassicPreset.Control {

  constructor(public text: string | null) {
    super();
  }
}


@Component({
  selector: 'app-text-box',
  templateUrl: './text-box.component.html',
  styleUrls: ['./text-box.component.css']
})
export class TextBoxComponent {
  @Input() data!: TextControl;


}
