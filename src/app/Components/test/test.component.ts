import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Injector,
} from "@angular/core";
import { MyEditor } from "./editor";
import { EditorService } from "./editorControl.service";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements AfterViewInit {

  title = "sucksuck";

  constructor(private editorService: EditorService) {}
    
  @ViewChild("rete") container!: ElementRef;

  async ngAfterViewInit() {
    const el = this.container.nativeElement;

    if (el) {
      this.editorService.createEditor(el);
      await this.editorService.addNewNode();
      await this.editorService.addControl();
    }
  }
  
  
}