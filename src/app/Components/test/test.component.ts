import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Injector,
} from "@angular/core";
import { MyEditor } from "./editor";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements AfterViewInit {

  title = "sucksuck";

  constructor(private injector: Injector) {
    
  }
  @ViewChild("rete") container!: ElementRef;

  async ngAfterViewInit() {
    const el = this.container.nativeElement;

    if (el) {
     const Editor = new MyEditor(el, this.injector);

      Editor.createEditor();
      await Editor.addNewNode();
      Editor.addControl();
      //await Editor.addNewNode();
    }
  }
}

