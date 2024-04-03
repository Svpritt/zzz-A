
import { Injector, Injectable } from "@angular/core";

import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions, } from "rete-area-plugin";
import {
  ClassicFlow,

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
import { Signal, Pipe, Scope } from 'rete';
import { ControlContainer } from "@angular/forms";


// 
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
    private textStateService: TextStateService,
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
    this.area.addPipe(context => { // Добавление обработчика событий в область редактора
      if (context.type === 'nodepicked') { // Проверка типа события
        const pickedId = context.data.id; // Получение id выбранного узла из данных события
        const Node = this.editor.getNode(pickedId);
        console.log(pickedId)
       console.log(this.editor.getNode(pickedId))//нужно проверить как достать данные из контролов
       if (Node.hasControl("TextBox")){
        // const Text = this.editor.getNode(pickedId).controls["TextBox"]?.id;
        const Text = this.editor.getNode(pickedId).controls;
        const contetn = this.nodes.find(n => pickedId)
        //єто id controla - найти метод как достать данніе типа гетконтролс.айди 
        //в итоге я помещаю их в стейт без этого..
        console.log(this.editor.getNode(pickedId).controls["TextBox"]?.id)
        const textControl = Text["TextBox"];
        if (textControl instanceof TextControl) {
        const textValue = textControl.text;
        console.log(textValue + "получилось"); // *&%^&*.то шо надо наконец. нельзя сделать Text.text *&^*& потому что надо InstanceOF спасибо типизации))))
        this.textStateService.setText(textValue!+"1") //кидаем в стейт единичка дает понимание что стейт рили изменился 
        console.log(this.textStateService.getText() + "со стейта данные")
  } }
}
  
      if (context.type === "nodepicked") {
const outputId = context.data.id
console.log(outputId + "1")
      }
      return context; // Возвращаем контекст обратно
    });

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
      },


   }}));

   this.editor.addPipe(context => {
    if (context.type === "connectioncreate") {
        const outputId = context.data.sourceOutput
      console.log(outputId)
      //когда кликаю на output должен проверить входит ли он в инпут, если нет, ты вызвать создание ноды, и сделать инпут в нее
      //это не из селектед, а из того output.id  которой я беру 
      // возможно оутпут будет не из ноды а из ее элемента.(контрола)
      const nodes = this.editor.getNodes()
      const connections = this.editor.getNodes()
      setTimeout(() => {
        if(nodes){
          console.log(nodes)
        }
      }, 10, );
      
    }
    return context
  })

    return () => this.area.destroy();
  }

  public async addNewNode() {
    const node = this.nodeCreatorService.createCustomNode(this.socket);
    this.nodes = [...this.nodes, node];
    console.log(node.id);
    await this.editor.addNode(node);


    if (this.nodes.length >1) {
        //так надо.
      await this.editor.addConnection(new ClassicPreset.Connection(this.nodes[this.nodes.length - 2], "a", this.nodes[this.nodes.length - 1], "b"));
      //я соединяю предпоследнюю с вновь созданой
    }
  

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
        // this.area.removeNodeView(node1.id) //можно было бы вызвать метод DeleteNode но он удалит не эту ноду, а ту которая будет выделена.
                                          //у этой ноды свой node1.id константа у каждого метода своя.
       const connectionsToRemove = this.editor.getConnections().filter(connection => 
        connection.source === node1.id || connection.target === node1.id
      );
      connectionsToRemove.forEach(connection => this.editor.removeConnection(connection.id));

      // Удаление ноды из области редактора
      this.area.removeNodeView(node1.id);
      
      // Удаление ноды из редактора
      this.editor.removeNode(node1.id);
      })
      );
      console.log(AreaExtensions.accumulateOnCtrl())
      console.log(AreaExtensions.selector())

      this.area.update("control", node1.id)
      this.area.update('node', node[0].id); //эта штука обновляет нужно указывать что.
      }
  }

  public async DeleteNode() {  //Пример контрола по идее на каждый "обькт " свой

    //метод который нигде не вызывается вроде как
    const node = this.editor.getNodes().filter(node => node.selected) 
    console.log(      this.editor.getConnection(node[0].id)
    )
    if(node !== undefined){
      console.log(node[0].id); //не сразу понял что node это список из 1 экземпляра он всего []
      const node1 = node[0]
     
      node1.removeInput
      node1.removeOutput
      this.area.removeConnectionView(node1.id);
      this.editor.removeConnection(node1.id)
      this.area.removeNodeView(node1.id) //метода работает, но не работае в кнопке которую я создаю
      this.area.update('node', node[0].id); //эта штука обновляет нужно указывать что.
      this.area.update
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


public async addTextBoxComponent() {
  const selectedNode = this.editor.getNodes().find(node => node.selected);
  const text = await this.textStateService.getText(); // Ждем получения текста из сервиса

  if (selectedNode && text !== null) {
    const control = new TextControl(text);
    selectedNode.removeControl("TextBox");
    selectedNode.addControl("TextBox", control);
    this.area.update("node", selectedNode.id);
  }
}


}


