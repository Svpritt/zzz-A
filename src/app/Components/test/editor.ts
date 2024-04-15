
import { Injector, Injectable, } from "@angular/core";

import { NodeEditor, GetSchemes, ClassicPreset,  } from "rete";
import { AreaPlugin, AreaExtensions, } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets
} from "rete-connection-plugin";
import { AngularPlugin, Presets, AngularArea2D, } from "rete-angular-plugin/15";

import { MyCustomNode } from "./dockNodes/CustomNode";
import { NodeCreatorService } from './node-creator.service';

import { ButtonComponent, ButtonControl } from "./dockNodes/custom-button.component";
import { ImageComponent, ImageControl } from "./dockNodes/custmon-img.component";
import { ImageService } from "src/app/services/imgUrl.service";
import { TextStateService } from "src/app/services/text-state.service";
import { TextBoxComponent, TextControl } from "./dockNodes/text-box/text-box.component";

import { ConnectionState, ControlState, EditorState, NodeState } from "./editor-state";
import { CustomConnectionComponent } from "./dockNodes/customTest/custom-connection/custom-connection.component";
import { CustomSocketComponent } from "./dockNodes/customTest/custom-socket/custom-socket.component";

type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
type AreaExtra = AngularArea2D<Schemes>;

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
  } 

  socket : ClassicPreset.Socket;
  
  editor : NodeEditor<Schemes>;
  area : AreaPlugin<Schemes, AreaExtra>;
  connection : ConnectionPlugin<Schemes, AreaExtra>;
  render : AngularPlugin<Schemes, AreaExtra>;
  nodes: ClassicPreset.Node[] = [];
  selector = AreaExtensions.selector();
  accumulating = AreaExtensions.accumulateOnCtrl()
  editorState: EditorState = new EditorState();
  socketNodeId: string  = "";
  socketKey: string = "";

  public async  createEditor() {
    AreaExtensions.selectableNodes(this.area, AreaExtensions.selector(), {
      accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  this.render.addPreset(Presets.classic.setup({
    customize: {
        control(context) {
          if(context.payload instanceof TextControl){
            return TextBoxComponent;
          }
          if (context.payload instanceof ImageControl) {
            return ImageComponent; 
          }
        if (context.payload instanceof ButtonControl) {
          return ButtonComponent;
        }
        return null
      },
//вся эта хуйня не работает, и я не ебу почему. вообще ни вместе ни по отдельности НИКАК! UPD ЗАРАБОТАЛО! будем играться.
      connection() {
        return CustomConnectionComponent;
      },
      socket() {
        return CustomSocketComponent;
      }

}}));    this.connection.addPreset(ConnectionPresets.classic.setup());
    this.editor.use(this.area);
    this.area.use(this.connection);
    this.area.use(this.render);



    const a = new ClassicPreset.Node("Custom");
    a.addOutput("a", new ClassicPreset.Output(this.socket));
    a.addInput("a", new ClassicPreset.Input(this.socket));
    await this.editor.addNode(a);


    this.area.addPipe(context => { // Добавление обработчика событий в область редактора
      if (context.type === 'nodepicked') { // Проверка типа события
        const pickedId = context.data.id; // Получение id выбранного узла из данных события
        const Node = this.editor.getNode(pickedId);
        console.log(pickedId)
        // const serializedNode = JSON.stringify(this.editor, null, 2);
        // console.log(serializedNode)
        const editorStateToJSON = JSON.stringify(this.editorState.nodes, null, 2)
        const editorStateToJSONConnections = JSON.stringify(this.editorState.connections, null, 2)
        console.log(editorStateToJSONConnections)
        console.log(editorStateToJSON)

       const connections = this.editor.getConnections();
       const nodeConnections = connections.filter(connection => 
           connection.source === Node.id || connection.target === Node.id
       );
       console.log(nodeConnections);


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
      return context; // Возвращаем контекст обратно
    });

 


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
        console.log(context.data.socket.key )
        console.log(context.data.socket.nodeId)
        this.socketNodeId = context.data.socket.nodeId;
        this.socketKey = context.data.socket.key;
        //сделать перменную ноды, и ее конекшена
        //       await this.editor.addConnection(new ClassicPreset.Connection(previousNode, "Output", node, "Input"));
        //функция внутри создания ноды
        //потом в конекшин дроп - очистить значение скорее через 10мсек
      //в этой функции указать в первом значении эту ноду и ее конекшн - там где оутпут, будет имя конекшена
    }
    if (context.type === 'connectiondrop') { // when the user clicks on the socket or any area
      if (!context.data.socket) { // Если нет активного соединения
        console.log(context.data.created.valueOf())
        
        const startNode = this.editor.getNode(this.socketNodeId)
        const connectionsSoket = this.editor.getConnections();
        console.log(connectionsSoket)
       //короче сюда нужно добавить логику, что если сделал конект то заного лкацнуть на Оутпут нельзя. чтоб не делать Мультиконектов где они стоят false
       //в эту же логику нужно добавить метод который в компоненте при установке связи будет добавлять кнопку Делете - этой самой связли,
       //и вот когда delete будет отрабатывать то его метод будет снова делать актиной сокет оутпута.

       //получается. сначала мне нужно сделать новый контрол, который будет в себе содержать сокет..
        if(startNode.hasOutput(this.socketKey) ){
          this.addNewNode();

        }
        // this.socketNodeId = "";
        // this.socketKey = "";
      }
    }
    return context
  })


    return () => this.area.destroy();
  }
  public async addNewOutputControl(){
    const node = this.editor.getNodes().filter(node => node.selected) ;
    const selectedNode = node[0];
    // const customSocket = new CustomSocketComponent();
    selectedNode.addOutput("Outpu1t", new ClassicPreset.Output(this.socket, "я добавил динамично", false)); //сокет имеет уникальный нейм или кей поэтому при создании сокета
    this.area.update("node", selectedNode.id);

  }

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

    nodeState.outputs.id = outputsId;
    nodeState.outputs.multipleConnections = multipleConnectionsOutput;

    
    // nodeState.botType = 'telegram';
    this.editorState.nodes.push(nodeState);
    this.nodes = [...this.nodes, node];

    await this.editor.addNode(node);
    if (this.nodes.length > 0) { //изначально писал ниже, но логика давала 2 конекта у предыдущей ноды на инпут. 
      // const previousNode = this.nodes[this.nodes.length - 2];
      const previousNode = this.editor.getNode(this.socketNodeId)
      // Устанавливаем соединение между отпут нодой и новой нодой
      // if(this.socketNodeId  !== undefined){
      await this.editor.addConnection(new ClassicPreset.Connection(previousNode, this.socketKey, node, "Input"));
      this.socketNodeId = "";
        this.socketKey = "";
    // }
  }
    // if (this.nodes.length >= 1) { 
      
          const areaX = this.area.area.pointer.x;
          const areaY = this.area.area.pointer.y;

          await this.area.translate(node.id, { x: areaX, y: areaY });
          
      // }
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

