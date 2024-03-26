
import {  ElementRef, Injector } from "@angular/core";
import { Injectable } from '@angular/core';

import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets
} from "rete-connection-plugin";
import { AngularPlugin, Presets, AngularArea2D } from "rete-angular-plugin/15";
import { DockPlugin, DockPresets } from "rete-dock-plugin";

import { NodeA } from "./dockNodes/nodeA";
import { NodeB } from "./dockNodes/nodeB";
import { MyCustomNode } from "./dockNodes/CustomNode";

import { NodeCreatorService } from './node-creator.service';
import {
  ContextMenuExtra,
  ContextMenuPlugin,
  Presets as ContextMenuPresets
} from "rete-context-menu-plugin";

type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
type AreaExtra = AngularArea2D<Schemes> | ContextMenuExtra;

@Injectable({
  providedIn: 'root'
}) 
export class MyEditor {

 

  constructor(
    // private elementRef: ElementRef,
    container: HTMLElement,
    injector: Injector,
    private nodeCreatorService: NodeCreatorService // Внедрение NodeCreatorService
    )
  {
     this.socket = new ClassicPreset.Socket("socket");
     this.editor = new NodeEditor<Schemes>();
     this.area = new AreaPlugin<Schemes, AreaExtra>(container);
     this.connection = new ConnectionPlugin<Schemes, AreaExtra>();
     this.render = new AngularPlugin<Schemes, AreaExtra>({ injector });
     this.dock = new DockPlugin<Schemes>();
  } 
  
  socket : ClassicPreset.Socket;
  editor : NodeEditor<Schemes>;
  area : AreaPlugin<Schemes, AreaExtra>;
  connection : ConnectionPlugin<Schemes, AreaExtra>;
  render : AngularPlugin<Schemes, AreaExtra>;
  dock : DockPlugin<Schemes>;

  nodes: ClassicPreset.Node[] = [];

  public async  createEditor() {
    const contextMenu = new ContextMenuPlugin<Schemes>({items: ContextMenuPresets.classic.setup([])})
    

    this.dock.addPreset(DockPresets.classic.setup({ area:this.area , size: 100, scale: 0.6 }));

    AreaExtensions.selectableNodes(this.area, AreaExtensions.selector(), {
      accumulating: AreaExtensions.accumulateOnCtrl()      
    })

    this.render.addPreset(Presets.classic.setup());

    this.connection.addPreset(ConnectionPresets.classic.setup());

    

    //оберка вогру Компонента чтоб создать на его основе нод
    this.render.addPreset(Presets.contextMenu.setup());
    this.editor.use(this.area);
    this.area.use(this.connection);
    this.area.use(this.render);
    this.area.use(this.dock);
    this.area.use(contextMenu);

    this.dock.add(() => new NodeA(this.socket));
    this.dock.add(() => new NodeB(this.socket));
    this.dock.add(()=> new MyCustomNode(this.socket))

    
    AreaExtensions.simpleNodesOrder(this.area);

    AreaExtensions.zoomAt(this.area, this.editor.getNodes());
   
  

    return () => this.area.destroy();
  }
  public async addNewNode() {
    const node = this.nodeCreatorService.createCustomNode(this.socket);
    this.nodes = [...this.nodes, node];
    if(node.selected !== undefined){
      console.log(node.selected.valueOf());

    }
    await this.editor.addNode(node);
  }
  public async addControl() {  //Пример контрола по идее на каждый "обькт " свой
    const node = this.nodes[0];// указать ноду которая выбрана
    node.addControl("ab", new ClassicPreset.InputControl("text", {initial: "hellow"}));

    this.area.update('node', node.id); //обновление
  }
}


  
// public async addNewNode1() { //можно ли вынести в сервис, который встoрится в editorControl
  //   function createCustomNode(socket: ClassicPreset.Socket): ClassicPreset.Node {
  //     const customNode = new ClassicPreset.Node('CustomNodeLabel'); // Создание экземпляра узла с меткой 'CustomNodeLabel'
  //     customNode.addControl("a", new ClassicPreset.InputControl("text", {initial: "first"})); // Добавление контроля
  //     customNode.addOutput("a", new ClassicPreset.Output(socket)); // Добавление выхода
  //     // Добавляем метод для удаления выхода
  //     customNode.removeOutput = function(key: keyof ClassicPreset.Node['outputs']): void {
  //       delete this.outputs[key];
  //     };
  //     // Добавляем метод для добавления контрола
  //     customNode.addControl = function<K extends keyof ClassicPreset.Node['controls']>(key: K, control: ClassicPreset.Node['controls'][K]): void {
  //       this.controls[key] = control;
  //     };
    
  //     return customNode; // Возвращение созданного узла
  //   }
  //   const node = createCustomNode(this.socket);
  //   this.nodes = [...this.nodes, node];
  //   await this.editor.addNode(node);
  // }

  // const editor : NodeEditor<Schemes>();
  // const area = new AreaPlugin<Schemes, AreaExtra>(container);
  // const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  // const render = new AngularPlugin<Schemes, AreaExtra>({ injector });
  // const dock = new DockPlugin<Schemes>();

  
  //this.dock.add(() => createCustomNode(this.socket));
  //createCustomNode(this.socket);

// public updateNode(node: ClassicPreset.Node) {
//   this.render.updateNode(node); // Обновление рендеринга узла
//   this.area.trigger('render'); // Принудительное обновление отрисовки области
// }
