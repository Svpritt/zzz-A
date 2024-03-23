import { Component, Input, HostBinding, ElementRef, ChangeDetectorRef, OnChanges } from '@angular/core';
import { ClassicPreset as Classic } from 'rete';
import { Directive } from '@angular/core';
import { KeyValue } from '@angular/common';
import { NodeEditor } from 'rete';


@Directive({
  selector: '[refComponent]'
})
export class RefDirective implements OnChanges {
  @Input() data!: any
  @Input() emit!: any

  constructor(private el: ElementRef) { }

  ngOnChanges() {
    this.emit({ type: 'render', data: { ...this.data, element: this.el.nativeElement } })
  }
}

type SortValue<N extends Classic.Node> = (N['controls'] | N['inputs']  | N['outputs'])[string]
// const editor = new NodeEditor();
// const nodeToRemove = editor.getNode('nodeId'); // Получите узел по ID
// const nodeId = nodeToRemove.id;
// if (nodeId) {
//   editor.removeNode(nodeId); // Pass the ID as a string
// }

@Component({
  selector: 'app-custom-node',
  templateUrl: './custom-node.component.html',
  styleUrls: ['./custom-node.component.scss'],
  host: {
    'data-testid': 'node'
  }
})
export class CustomNodeComponent {
  @Input() data!: Classic.Node;
  @Input() emit!: (data: any) => void
  @Input() rendered!: () => void

  seed = 0

  @HostBinding('class.selected') get selected() {
    return this.data.selected
  }
  private editor = new NodeEditor();
  constructor(private cdr: ChangeDetectorRef)  {
    this.cdr.detach()
  }
  onDeleteClick() {
    const nodeId = this.data.id; // Получите ID узла из data объекта

    if (nodeId) {
      const nodeToRemove = this.editor.getNode(nodeId); // Получите узел по ID
      if (nodeToRemove) {
        this.editor.removeNode(nodeId); // Удалите узел
      }
    }
  }
  ngOnChanges(): void {
    this.cdr.detectChanges()
    requestAnimationFrame(() => this.rendered())
    this.seed++ // force render sockets
  }

  sortByIndex<N extends Classic.Node, I extends KeyValue<string, SortValue<N>>>(a: I, b: I) {
    const ai = a.value?.index || 0
    const bi = b.value?.index || 0

    return ai - bi
  }
  
}