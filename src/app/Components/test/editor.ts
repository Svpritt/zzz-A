
import { Injector, Injectable } from "@angular/core";

import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets
} from "rete-connection-plugin";
import { AngularPlugin, Presets, AngularArea2D, ControlComponent } from "rete-angular-plugin/15";
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
import { ButtonComponent, ButtonControl } from "./dockNodes/custom-button.component";
import { ImageComponent, ImageControl } from "./dockNodes/custmon-img.component";
import { CustomNodeComponent } from "./dockNodes/custom-node/custom-node.component";
import { ImageService } from "src/app/services/imgUrl.service";
import { TextStateService } from "src/app/services/text-state.service";
import { TextBoxComponent, TextControl } from "./dockNodes/text-box/text-box.component";
import { NodeId, Root } from 'rete';





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
    container: HTMLElement,
    private injector: Injector,
    private nodeCreatorService: NodeCreatorService, // Внедрение NodeCreatorService
    private imageService: ImageService,
    private textStateService: TextStateService
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
  selector = AreaExtensions.selector();
  accumulating = AreaExtensions.accumulateOnCtrl()


  public async  createEditor() {
    const contextMenu = new ContextMenuPlugin<Schemes>({items: ContextMenuPresets.classic.setup([])})
    
    this.dock.addPreset(DockPresets.classic.setup({ area:this.area , size: 100, scale: 0.6 }));

    AreaExtensions.selectableNodes(this.area, AreaExtensions.selector(), {
      accumulating: AreaExtensions.accumulateOnCtrl(),
  
  });

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
   
   this.render.addPreset(Presets.classic.setup({
    customize: {
        control(context) {
          if(context.payload instanceof TextControl){
            return TextBoxComponent;
          }

          if (context.payload instanceof ImageControl) {
            return ImageComponent; // Повертаємо компонент ImageComponent
          }

        if (context.payload instanceof ButtonControl) {
          return ButtonComponent;
        }
       
        return null
      }
   }}));

   

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
    const node = this.editor.getNodes().filter(node => node.selected) //наверное учитывая что в списке selected может быть 
                                                                      // максимум 1 нода есть более простой способ ее получить. я его не нашел.
    if(node !== undefined){
      console.log(node[0].id); //не сразу понял что node это список из 1 экземпляра он всего [] (упдейт их через контрл можно выбирать... несколько с)
      const node1 = node[0]
      node1.addControl("ab", new ClassicPreset.InputControl("text", {initial: "WTF lorem ipsum 10 WTF lorem ipsum 10 WTF lorem ipsum 10 WTF lorem ipsum 10 WTF lorem ipsum 10 WTF lorem ipsum 10 WTF lorem ipsum 10 WTF lorem ipsum 10 "}));
      this.area.update('node', node[0].id); //эта штука обновляет нужно указывать что.
    }

  }
  public async addButton(){
      const node = this.editor.getNodes().filter(node => node.selected) //наверное учитывая что в списке selected может быть 
      // максимум 1 нода есть более простой способ ее получить. я его не нашел.
      if(node !== undefined){
      console.log(node[0].id); 
      const node1 = node[0]
      node1.addControl("button", //этот метод написан не верно, пока не понимаю почему, что-то происходит в окне но нет кнпоки.
      new ButtonControl("Delete", () => {
        console.log("Кнопка нажата"); //не вижу консоль (вижу упдейт спустя 30 минут)
        this.area.removeNodeView(node1.id) //можно было бы вызвать метод DeleteNode но он удалит не эту ноду, а ту которая будет выделена.
                                          //у этой ноды свой node1.id константа у каждого метода своя.
      })
      );
      console.log(AreaExtensions.accumulateOnCtrl())
      console.log(AreaExtensions.selector())

      this.area.update("control", node1.id)
      this.area.update('node', node[0].id); //эта штука обновляет нужно указывать что.
      }
  }

  public async DeleteNode() {  //Пример контрола по идее на каждый "обькт " свой
    const node = this.editor.getNodes().filter(node => node.selected) 


    
    if(node !== undefined){
      console.log(node[0].id); //не сразу понял что node это список из 1 экземпляра он всего []
      const node1 = node[0]

      this.area.removeNodeView(node1.id) //метода работает, но не работае в кнопке которую я создаю
      this.area.update('node', node[0].id); //эта штука обновляет нужно указывать что.
    }

  }

  public async addImageComponent(){
    const selectedNode = this.editor.getNodes().find(node => node.selected);
    console.log(this.imageService.getImgUrl())
    if (selectedNode){

      console.log(selectedNode.id);
      console.log(this.imageService)
      console.log(this.imageService)

     const data = this.imageService.getImgUrl();
     //this.imageService.imageUrl$;
     console.log(data)
      const control = new ImageControl(data); // Передаем data в ImageControl
      selectedNode.removeControl("image");

      selectedNode.addControl("image", control);
      this.area.update("node", selectedNode.id);
      this.area.update("control", control.id); // Назначаем компонент для контрола
    }
}


public async addTextBoxComponent(){
  const selectedNode = this.editor.getNodes().find(node => node.selected);
  console.log(this.textStateService.getText())
  // if (selectedNode){

  if (selectedNode){
    const text = this.textStateService.getText();
    const control =  new TextControl(text);
    this.textStateService.setText(text!)
    selectedNode.removeControl("TextBox");
    selectedNode.addControl("TextBox", control);
    this.area.update("node", selectedNode.id)
  }

}


}


