import {
  Component,
  Input,
  HostBinding,
  ChangeDetectorRef,
  OnChanges
} from "@angular/core";

@Component({
  // selector: '[app-custom-socket]',
  template: `<p>Allow</p>`,
  styleUrls: ["./custom-socket.component.sass"]
})
export class CustomSocketComponent implements OnChanges {
  @Input() data!: any;
  @Input() rendered!: any;

  @HostBinding("title") get title() {
    return this.data.name;
  }

  constructor(private cdr: ChangeDetectorRef) {
    this.cdr.detach();
  }

  ngOnChanges(): void {
    this.cdr.detectChanges();
    requestAnimationFrame(() => this.rendered());
  }
}
