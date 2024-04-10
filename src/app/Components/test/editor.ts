
import { Injector, Injectable, Input } from "@angular/core";

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
import { ConnectionState, ControlState, EditorState, NodeState } from "./editor-state";

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
  editorState: EditorState = new EditorState();

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
        const serializedNode = JSON.stringify(this.editor, null, 2);
    
        // console.log(serializedNode)
        const editorStateToJSON = JSON.stringify(this.editorState.nodes, null, 2)
        const editorStateToJSONConnections = JSON.stringify(this.editorState.connections, null, 2)
        console.log(editorStateToJSONConnections)
        console.log(editorStateToJSON)
      //  console.log(this.editor.getNode(pickedId).controls)//нужно проверить как достать данные из контролов я их все достал
      //  const controls = this.editor.getNode(pickedId).controls;

       const connections = this.editor.getConnections();
       const nodeConnections = connections.filter(connection => 
           connection.source === Node.id || connection.target === Node.id
       );
       console.log(nodeConnections);

  //      if (Node.hasControl("TextBox")){
  //       const Text = this.editor.getNode(pickedId).controls;
  //       const contetn = this.nodes.find(n => pickedId)
       
  //       console.log(this.editor.getNode(pickedId).controls["TextBox"])
  //       const textControl = Text["TextBox"];
  //       if (textControl instanceof TextControl) {
  //       const textValue = textControl.text;
  //       console.log(textValue + "получилось"); // *&%^&*.то шо надо наконец. нельзя сделать Text.text *&^*& потому что надо InstanceOF спасибо типизации))))
  //       this.textStateService.setText(textValue!+"1") //кидаем в стейт единичка дает понимание что стейт рили изменился 
  //       console.log(this.textStateService.getText() + "со стейта данные")
  // } }
}
  
      if (context.type === "nodepicked") {
const outputId = context.data.id
      }
      if (context.type === "connectioncreated"){ //добавляем в стейт коннект каждый раз когда образуется ЛЮБАЯ связь.

        console.log(context.data); //заебись

        const connectionState = new ConnectionState();
        connectionState.id = context.data.id
        connectionState.source = context.data.source
        connectionState.sourceOutput = context.data.sourceOutput
        connectionState.target = context.data.target
        connectionState.targetInput = context.data.targetInput

        this.editorState.connections.push(connectionState)
        console.log(this.editorState.connections)
        console.log(`connection ${context.data.id} is created`)
      
      }
      if (context.type === "connectionremoved"){
        const connectionIdToRemove = context.data.id; // Идентификатор соединения для удаления

        // Фильтрация массива connectionsState для удаления соединения с заданным идентификатором
        this.editorState.connections = this.editorState.connections.filter(connection => connection.id !== connectionIdToRemove);

        console.log(
          `connection ${connectionIdToRemove} is deleted`
        )
          }
          if (context.type === "pointermove"){
            const areaX = this.area.area.pointer.x //вот эту штуку надо присвоить внутрь эдитора, а от туда доставать в нужный момент и передавать 
            const areaY = this.area.area.pointer.y // в пайп connectionDrop или сразу в функцию addNewNode чтоб она создавалась в месте курсора.
            console.log(`pointer x ${areaX} and poiner y ${areaY}`)

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
      const connections = this.editor.getNodes()
      const serializedData = JSON.stringify(this.editor);


      const nodes = this.editor.getNodes()
      // setTimeout(() => {
      //   if(nodes){
      //     // console.log(nodes)
      //     // console.log(serializedData)
      //   }
      // }, 10, );
      
    }
    if (context.type === "nodecreate"){
      
    }
    return context
  })
  this.connection.addPipe(context => {
    if (context.type === 'connectionpick') { // when the user clicks on the socket
// тут нужно придумать что бы то место откуда конекшн пик (пока в уме)
    }
    if (context.type === 'connectiondrop') { // when the user clicks on the socket or any area
      // console.log(context.data)
      const coords = this.area.container;
      console.log(coords)
      
    
      //взть координаты того места где сейчас курсор, вызвать метод addNewNode 
    // взять новую ноду и поместить по координатам курсора в момент connectiondrop 

    }
    return context
  })

    return () => this.area.destroy();
  }

  // public async addNewNodeFacebook() {
  //   const node = this.nodeCreatorService.createCustomNode(this.socket);

  //   const nodeState = new NodeState();
  //   nodeState.id = node.id;
  //   nodeState.label = node.label;
  //   // nodeState.botType = 'facebook';

  //   this.editorState.nodes.push(nodeState);

  //   this.nodes = [...this.nodes, node];

  //   // console.log(node.id);
  //   await this.editor.addNode(node);
    

  //   if (this.nodes.length >1) {
     
  //     if (this.nodes.length > 1) {
  //       const step = 80; // Шаг смещения
  //       for (let i = 1; i < this.nodes.length; i++) {
  //         const x = 50 + (i - 1) * step; // Рассчитываем координату X относительно первых координат
  //         const y = 50 + (i - 1) * step; // Рассчитываем координату Y придумать как относительно предыдущей ноды..
      
  //         await this.editor.addConnection(new ClassicPreset.Connection(this.nodes[i - 1], "a", this.nodes[i], "b"));
  //         await this.area.translate(node.id, { x, y });
  //       }
  //     }
  //   }
  // }
  public async addNewNode() {
    const node = this.nodeCreatorService.createCustomNode(this.socket);
    const nodeState = new NodeState();
    nodeState.id = node.id;
    nodeState.label = node.label;
    // nodeState.inputs = node.inputs; это не вариант . хотя было бы прикольно
    // nodeState.outputs =node.outputs;
    const inputs = node.inputs;
    const inputJson =  JSON.stringify(inputs)
    const inputObject = JSON.parse(inputJson);
    const inputsId = inputObject.Input.id;
    const multipleConnectionsInput = inputObject.Input.multipleConnections;
    nodeState.inputs.id = inputsId
    nodeState.inputs.multipleConnections = multipleConnectionsInput

    const outputs = node.inputs;
    const outputsJson =  JSON.stringify(outputs)
    const outputsObject = JSON.parse(outputsJson);
    const outputsId = outputsObject.Input.id;
    const multipleConnectionsOutput = inputObject.Input.multipleConnections;
    nodeState.inputs.id = outputsId
    nodeState.inputs.multipleConnections = multipleConnectionsOutput
   
    
    // nodeState.botType = 'telegram';
   
    this.editorState.nodes.push(nodeState);
    this.nodes = [...this.nodes, node];

    await this.editor.addNode(node);
    if (this.nodes.length > 1) { //изначально писал ниже, но логика давала 2 конекта у предыдущей ноды на инпут. 
      const previousNode = this.nodes[this.nodes.length - 2];
      // Устанавливаем соединение между предыдущей нодой и новой нодой
      await this.editor.addConnection(new ClassicPreset.Connection(previousNode, "Output", node, "Input"));
  }
    if (this.nodes.length >1) { 
      
        const step = 80; // Шаг смещения
        for (let i = 1; i < this.nodes.length; i++) {
          
          const x = 50 + (i - 1) * step; // Рассчитываем координату X относительно первых координат
          const y = 50 + (i - 1) * step; // Рассчитываем координату Y придумать как относительно предыдущей ноды..
      
          await this.area.translate(node.id, { x, y });
          
          
        }
      }
  }
  public async addControl() {  //Пример контрола по идее на каждый "обькт " свой
    const node = this.editor.getNodes().filter(node => node.selected) //наверное учитывая что в списке selected может быть 
                                                                      // максимум 1 нода есть более простой способ ее получить. я его не нашел.
    if(node !== undefined){
      console.log(node[0].id); //не сразу понял что node это список из 1 экземпляра он всего [] (упдейт их через контрл можно выбирать... несколько с)
      const node1 = node[0]

      const control = new ClassicPreset.InputControl("text", {initial: "WTF lorem ipsum 10"});

      const controlState = new ControlState();

      controlState.id = control.id;
      controlState.type = control.type;
      controlState.value = control.value ?? '';

      const nodeState = this.editorState.nodes.find(n => n.id === node1.id);

      if (nodeState) {
        nodeState.controls.push(controlState);
      }


      node1.addControl("ab", control);
      this.area.update('node', node[0].id); //эта штука обновляет нужно указывать что.
    }

  }
  public async addButton(){
      const node = this.editor.getNodes().filter(node => node.selected) //наверное учитывая что в списке selected может быть 
      // максимум 1 нода есть более простой способ ее получить. я его не нашел.
      if(node !== undefined){
      console.log(node[0].id); 
      const node1 = node[0];
      const nodeState = this.editorState.nodes.find(n => n.id === node1.id);

      const control = new ButtonControl("delete", () => {
        console.log("Кнопка нажата"); //не вижу консоль (вижу упдейт спустя 30 минут)
        // this.area.removeNodeView(node1.id) //можно было бы вызвать метод DeleteNode но он удалит не эту ноду, а ту которая будет выделена.
                                          //у этой ноды свой node1.id константа у каждого метода своя.
       const connectionsToRemove = this.editor.getConnections().filter(connection => 
        connection.source === node1.id || connection.target === node1.id
      );

      connectionsToRemove.forEach(connection => this.editor.removeConnection(connection.id));

      // Удаление ноды из области редактора
      this.area.removeNodeView(node1.id);
      
      // nodeState //тут удаляю из Стейта ноду внутри метода delete 
      const index = this.editorState.nodes.findIndex(n => n.id === nodeState!.id);
    if (index !== -1) {
        this.editorState.nodes.splice(index, 1);
    }

      // Удаление ноды из редактора
      this.editor.removeNode(node1.id);
      })
      const controlState = new ControlState();
      controlState.id = control.id;
      controlState.onClick = control.onClick;
      controlState.type = "delete";
      

      if (nodeState) {

        nodeState.controls = nodeState.controls.filter(c => c.type !== "delete");

        nodeState.controls.push(controlState);
      }

      
      node1.addControl("delete", control  );//этот метод написан не верно, пока не понимаю почему, что-то происходит в окне но нет кнпоки.
    
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


        if (selectedNode){

     const data = this.imageService.getImgUrl();
     console.log(data)
      const control = new ImageControl(data); // Передаем data в ImageControl
      const controlState = new ControlState();
      controlState.id = control.id;
      controlState.type = "image";
      controlState.value = control.imageUrl ?? '';
      const nodeState = this.editorState.nodes.find(n => n.id === selectedNode.id);

      if (nodeState) {
        // Удаляем существующий контрол из стейта
        nodeState.controls = nodeState.controls.filter(c => c.type !== "image");
        // Добавляем новый контрол в стейт
        nodeState.controls.push(controlState);
    }
      selectedNode.removeControl("image");
      selectedNode.addControl("image", control);
      this.area.update("node", selectedNode.id);
      this.area.update("control", control.id); // Назначаем компонент для контрола
    }
}

public async addTextBoxComponent() {
  const selectedNode = this.editor.getNodes().find(node => node.selected);

  if (selectedNode) {
      const text = await this.textStateService.getText(); // Получаем текст из сервиса
      if (text !== null) {
          const control = new TextControl(text); // Создаем новый текстовый контрол
          const controlState = new ControlState();
          controlState.id = control.id;
          controlState.type = "text";
          controlState.value = control.text ?? '';

          const nodeState = this.editorState.nodes.find(n => n.id === selectedNode.id);

          if (nodeState) {
              // Удаляем существующий текстовый контрол из стейта
              nodeState.controls = nodeState.controls.filter(c => c.type !== "text");
              // Добавляем новый текстовый контрол в стейт
              nodeState.controls.push(controlState);
          }

          // Удаляем существующий текстовый контрол из узла и добавляем новый
          selectedNode.removeControl("text");
          selectedNode.addControl("text", control);

          // Обновляем область редактора
          this.area.update("node", selectedNode.id);
          this.area.update("control", control.id); // Назначаем компонент для контрола
      }
  }
}


}


