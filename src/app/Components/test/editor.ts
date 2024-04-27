
import { Injector, Injectable, } from "@angular/core";

import { NodeEditor, GetSchemes, ClassicPreset,  } from "rete";
import { AreaPlugin, AreaExtensions, } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets
} from "rete-connection-plugin";
import { AngularPlugin, Presets, AngularArea2D, SocketComponent, } from "rete-angular-plugin/15";
import { MyCustomNode } from "./dockNodes/CustomNode";
import { NodeCreatorService } from './node-creator.service';

import { ButtonComponent, ButtonControl } from "./dockNodes/custom-button.component";
import { ImageComponent, ImageControl } from "./dockNodes/custmon-img.component";
import { ImageService } from "src/app/services/imgUrl.service";
import { TextStateService } from "src/app/services/text-state.service";
import { TextBoxComponent, TextControl } from "./dockNodes/text-box/text-box.component";

import { ConnectionState, ControlState, EditorState, NodePort, NodeState, updateLocalStorage } from "./editor-state";
import { CustomConnectionComponent } from "./dockNodes/customTest/custom-connection/custom-connection.component";
import { CustomSocketComponent } from "./dockNodes/customTest/custom-socket/custom-socket.component";
import { OutputSocket } from "./OutputSocket";
// import { AngularArea2D, AngularPlugin, Presets } from "rete-angular-plugin"; нельзя, импортим 15й

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

      connection() {
        return CustomConnectionComponent;
      },
      socket(context) {
        if (context.payload instanceof OutputSocket){
          return CustomSocketComponent;
        } if (context.payload instanceof ClassicPreset.Socket) {
          return SocketComponent  //быть внимательным корректно работает с импортом АНгуляр 15. хотя мы в 16том. 
        }
        return null
      }

}}));
     this.connection.addPreset(ConnectionPresets.classic.setup());
    this.editor.use(this.area);
    this.area.use(this.connection);
    this.area.use(this.render);
      
//     
    this.loadFromNodeData(); // я должен придумать метод создания ноды - который поместит ее в стейт, а метод addNewNode должен получить ее аргументом
                            // тогда я должен этот же аргумент передавать из стейта внутри loadFromNodeData 



    this.area.addPipe(context => { // Добавление обработчика событий в область редактора
      if (context.type === 'nodepicked') { // Проверка типа события
        const pickedId = context.data.id; // Получение id выбранного узла из данных события
        const Node = this.editor.getNode(pickedId);
        console.log(pickedId)

       const connections = this.editor.getConnections();
       const nodeConnections = connections.filter(connection => 
           connection.source === Node.id || connection.target === Node.id
       );
       console.log(nodeConnections);


}
if (context.type === 'nodedragged') {
  const pickedId = context.data.id;
  const nodeToUpdate = this.editorState.nodes.find(node => node.id === pickedId);
  if (nodeToUpdate) {
    const position = this.area.nodeViews.get(pickedId)!.position;
    nodeToUpdate.x = position.x;
    nodeToUpdate.y = position.y;
  } else {
    console.error(`Node with ID ${pickedId} not found in EditorState`);
  }
}

if (context.type === 'nodedragged' || context.type === 'nodepicked') {
  updateLocalStorage(this.editorState);
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
        updateLocalStorage(this.editorState);

      
      }
      if (context.type === "connectionremoved"){
        const connectionIdToRemove = context.data.id; // Идентификатор соединения для удаления

        // Фильтрация массива connectionsState для удаления соединения с заданным идентификатором
        this.editorState.connections = this.editorState.connections.filter(connection => connection.id !== connectionIdToRemove);
        updateLocalStorage(this.editorState);

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

    }
    
    return context
  })
  this.connection.addPipe(context => {
    if (context.type === 'connectionpick') { // when the user clicks on the socket
        console.log(context.data.socket.key )
        console.log(context.data.socket.nodeId)
        this.socketNodeId = context.data.socket.nodeId;
        this.socketKey = context.data.socket.key;
      
    }

    if (context.type === 'connectiondrop') { 
      if (!context.data.socket) { 
        console.log(context.data.created.valueOf())
        
        const startNode = this.editor.getNode(this.socketNodeId)
        const connectionsSoket = this.editor.getConnections();
        console.log(connectionsSoket)
    
        if(startNode.hasOutput(this.socketKey) ){
          this.addNewNode();
          console.log(this.editor.getConnections())

        }
        else{
          console.log("нет такого output")
        }
        
        updateLocalStorage(this.editorState);

      }
    }
    return context
  })

  // this.socketNodeId = "";
  // this.socketKey = "";

    return () => this.area.destroy();
  }
  public async addNewOutputControl(){
    const node = this.editor.getNodes().filter(node => node.selected) ;
    const selectedNode = node[0];

    
              const Outputs = selectedNode.outputs;
              const OutputsNumber = Object.keys(Outputs).length + 1; //катовасия потому что нейм уникальный он как id в БД 
              const OutputName =  "Output" + OutputsNumber;
              console.log(OutputsNumber)


              const CustomOutput =  new ClassicPreset.Output(new OutputSocket(), "я добавил динамично", false)

              const outputsJson =  JSON.stringify(CustomOutput)
              const outputsObject = JSON.parse(outputsJson);
              console.log(outputsObject)
              const nodeToUpdate = this.editorState.nodes.find(node => node.id === selectedNode.id);
              // {socket: {…}, label: 'я добавил динамично', multipleConnections: false, id: '76effbeddd5eba2f'} this
              // {socket: {…}, label: 'defind', multipleConnections: false, id: 'aa78d02ee7ad465b'} another
              //  console.log(outputsObject.output.socket) 
              if (nodeToUpdate) {
                const nodePort = new NodePort();
                nodePort.id = outputsObject.id;
                nodePort.multipleConnections = outputsObject.multipleConnections;
                nodePort.label = outputsObject.label;
                nodePort.socket = outputsObject.socket.name;
                // Добавление каждого выхода в массив nodeState.outputs
                // nodeState.outputs.push(nodePort);
                nodeToUpdate.outputs.push(nodePort);
            } else {
                console.error(`Node with id "${selectedNode.id}" not found.`);
            }

              console.log(CustomOutput)
    

    selectedNode.addOutput(OutputName, CustomOutput); //сокет имеет уникальный нейм или кей поэтому при создании сокета
    this.area.update("node", selectedNode.id);
    updateLocalStorage(this.editorState);

  }
  
  private async loadFromNodeData (){

    const nodesDataLocal = localStorage.getItem('editorState');

    if (nodesDataLocal) {
      const data = JSON.parse(nodesDataLocal);
      const nodesData = data.nodes;
      const connectionsData = data.connections;

      for (const nodeData of nodesData) {
        const node = this.nodeCreatorService.createCustomNode(this.socket);
        node.id = nodeData.id;
        node.label = nodeData.id;

        const controlsObject: { [id: string]: ClassicPreset.Control } = {};
        if (nodeData.controls) {
          for (const control of nodeData.controls) {
            let controlInstance: ClassicPreset.Control;
            switch (control.type) {
              case 'text':
                controlInstance = new TextControl(control.value);
                break;
              case 'image':
                controlInstance = new ImageControl(control.value);
                break;
              case 'delete':
                controlInstance = new ButtonControl('delete', 'delete', () => {
                  const connectionsToRemove = this.editor.getConnections().filter((connection) =>
                    connection.source === node.id || connection.target === node.id
                  );
                  connectionsToRemove.forEach((connection) => this.editor.removeConnection(connection.id));
                  this.area.removeNodeView(node.id);
                  const nodeState = this.editorState.nodes.find((n) => n.id === node.id);
                  const index = this.editorState.nodes.findIndex((n) => n.id === nodeState!.id);
                  if (index !== -1) {
                    this.editorState.nodes.splice(index, 1);
                  }
                  this.editor.removeNode(node.id);
                  updateLocalStorage(this.editorState);
                });
                break;
              default:
                controlInstance = new ClassicPreset.Control();
                break;
            }
            controlsObject[control.id!] = controlInstance;
          }
        }

        const outputsObject: { [id: string]: ClassicPreset.Output<ClassicPreset.Socket> } = {};
        for (const output of nodeData.outputs) {
          let outputInstance: ClassicPreset.Output<ClassicPreset.Socket>;
          switch (output.socket) {
            case 'socket':
              outputInstance = new ClassicPreset.Output(this.socket, output.label, output.multipleConnections);
              break;
            case 'Action':
              outputInstance = new ClassicPreset.Output(new OutputSocket(), output.label, output.multipleConnections);
              break;
            default:
              outputInstance = new ClassicPreset.Output(this.socket, output.label, output.multipleConnections);
              break;
          }
          outputsObject[output.id] = outputInstance;
        }
        node.outputs = outputsObject;
        node.controls = controlsObject;

        await this.editor.addNode(node);

        const areaX = nodeData.x;
        const areaY = nodeData.y;
        await this.area.translate(node.id, { x: areaX, y: areaY });

        this.editorState.nodes.push(nodeData);
      }

      for (const connectionData of connectionsData) {
        const sourceNode = this.editor.getNode(connectionData.source);
        const targetNode = this.editor.getNode(connectionData.target);
        if (sourceNode && targetNode) {
          const newConnection = new ClassicPreset.Connection(
            sourceNode,
            connectionData.sourceOutput,
            targetNode,
            connectionData.targetInput
          );
          this.editor.addConnection(newConnection);
        }
      }
    } 

    else {
      const a = new ClassicPreset.Node("Custom");
      a.id = "initial-node" //типа старт ноде - проверки, чтоб ее нельзя было удалить
      a.addOutput("Output", new ClassicPreset.Output(new OutputSocket(), "output"));
      a.addOutput("Second", new ClassicPreset.Output(this.socket, "Second"))
      a.addInput("a", new ClassicPreset.Input(this.socket));

      const node = this.nodeCreatorService.createCustomNode(this.socket);
      const nodeState = new NodeState();
      node.id = "initial-node"
      node.label = node.id;
      nodeState.id = node.id;
      nodeState.label = node.label;
    
      const inputs = node.inputs;
      const inputJson =  JSON.stringify(inputs)
      const inputObject = JSON.parse(inputJson);
      const inputsId = inputObject.Input.id;
      const multipleConnectionsInput = inputObject.Input.multipleConnections;

      nodeState.inputs.id = inputsId
      nodeState.inputs.multipleConnections = multipleConnectionsInput
      const outputs = node.outputs; 
      const outputsJson =  JSON.stringify(outputs)
      const outputsObject = JSON.parse(outputsJson);
      console.log(outputsObject)
      console.log(outputsJson)
  
      for (const key in outputsObject) {
        if (outputsObject.hasOwnProperty(key)) {
            const output = outputsObject[key];
            console.log(output)
            const nodePort = new NodePort();
            const ousok = output.socket.name
            console.log(ousok)
            nodePort.id = output.id;
            nodePort.multipleConnections = output.multipleConnections;
            nodePort.label = output.label;
            // Добавление каждого выхода в массив nodeState.outputs
            nodeState.outputs.push(nodePort);
        }
    }

      // nodeState.botType = 'telegram';
      this.editorState.nodes.push(nodeState);
      this.nodes = [...this.nodes, node];

      await this.editor.addNode(node);
      await this.area.translate(node.id, { x: 10, y: 10 });
    }

    
  
  }

  public async addNewNode() { 
    const node = this.nodeCreatorService.createCustomNode(this.socket);
    if (!node || !this.socket) {
      console.error('Failed to create node or socket is null');
      return;
    }

    const nodeState = new NodeState();
    nodeState.id = node.id;
    nodeState.label = node.label;

    const inputs = node.inputs;
    const inputJson = JSON.stringify(inputs);
    let inputObject;
    try {
      inputObject = JSON.parse(inputJson);
    } catch (error) {
      console.error('Failed to parse inputs JSON:', error);
      return;
    }

    if (!inputObject || !inputObject.Input) {
      console.error('Input object or Input property is missing');
      return;
    }

    const { id: inputsId, multipleConnections: multipleConnectionsInput } = inputObject.Input;
    nodeState.inputs.id = inputsId;
    nodeState.inputs.multipleConnections = multipleConnectionsInput;

    const outputs = node.outputs; 
    let outputsObject;
    try {
      const outputsJson = JSON.stringify(outputs);
      outputsObject = JSON.parse(outputsJson);
    } catch (error) {
      console.error('Failed to parse outputs JSON:', error);
      return;
    }

    if (!outputsObject) {
      console.error('Outputs object is missing');
      return;
    }

    for (const key in outputsObject) {
      if (Object.prototype.hasOwnProperty.call(outputsObject, key)) {
        const output = outputsObject[key];
        const nodePort = new NodePort();
        const ousok = output.socket?.name;
        if (!ousok) {
          console.error('Socket name is missing for output:', key);
          continue;
        }
        nodePort.id = output.id;
        nodePort.multipleConnections = output.multipleConnections;
        nodePort.label = output.label;
        nodeState.outputs.push(nodePort);
      }
    }

    this.editorState.nodes.push(nodeState);
    this.nodes.push(node);

    try {
      await this.editor.addNode(node);
      if (this.nodes.length > 0) {  
        const previousNode = this.editor.getNode(this.socketNodeId);
        if (!previousNode) {
          console.error('Previous node is missing');
          return;
        }
        await this.editor.addConnection(new ClassicPreset.Connection(previousNode, this.socketKey, node, "Input"));
        this.socketNodeId = "";
        this.socketKey = "";
      }
      const areaX = this.area.area.pointer.x;
      const areaY = this.area.area.pointer.y;
      nodeState.x = areaX;
      nodeState.y = areaY;
      await this.area.translate(node.id, { x: areaX, y: areaY });
    } catch (error) {
      console.error('Failed to add node or establish connection:', error);
    }

    updateLocalStorage(this.editorState);
  }
  public async addControl() {  //Пример контрола по идее на каждый "обькт " свой
    const node = this.editor.getNodes().filter(node => node.selected) //наверное учитывая что в списке selected может быть 
                                                                      // максимум 1 нода есть более простой способ ее получить. я его не нашел.
    if(node !== undefined){
      const selectedNode = node[0];
      const control = new ClassicPreset.InputControl("text", {initial: "WTF lorem ipsum 10"});
      const controlState = new ControlState();
      controlState.id = control.id;
      controlState.type = control.type;
      controlState.value = control.value ?? '';
      const nodeState = this.editorState.nodes.find(n => n.id === selectedNode.id);
      if (nodeState) {
        nodeState.controls.push(controlState);
      }
      selectedNode.addControl("ab", control);
      this.area.update('node', node[0].id); //эта штука обновляет нужно указывать что.

    }
    updateLocalStorage(this.editorState);

  }
  public async addButton(){
      const node = this.editor.getNodes().filter(node => node.selected) 
      //наверное учитывая что в списке selected может быть 
      // максимум 1 нода есть более простой способ ее получить. я его не нашел.
      
      if(node !== undefined && node[0].id !== "initial-node"){        // if(node[0].id = "initial-node") return //тупо запрещаем добавление баттона на первыую ноду

      console.log(node[0].id); 
      const selectedNode = node[0];
      const nodeState = this.editorState.nodes.find(n => n.id === selectedNode.id);

      const control = new ButtonControl("delete", "delete", () => {
        console.log("Кнопка нажата"); //не вижу консоль (вижу упдейт спустя 30 минут)
        // this.area.removeNodeView(selectedNode.id) //можно было бы вызвать метод DeleteNode но он удалит не эту ноду, а ту которая будет выделена.
                                          //у этой ноды свой selectedNode.id константа у каждого метода своя.
       const connectionsToRemove = this.editor.getConnections().filter(connection => 
        connection.source === selectedNode.id || connection.target === selectedNode.id
      );

      connectionsToRemove.forEach(connection => this.editor.removeConnection(connection.id));

      // Удаление ноды из области редактора
      this.area.removeNodeView(selectedNode.id);
      
      // nodeState //тут удаляю из Стейта ноду внутри метода delete 
      const index = this.editorState.nodes.findIndex(n => n.id === nodeState!.id);
    if (index !== -1) {
        this.editorState.nodes.splice(index, 1);
    }

      // Удаление ноды из редактора
      this.editor.removeNode(selectedNode.id);
      })
      const controlState = new ControlState();
      controlState.id = control.id;
      controlState.type = control.type;
      
      console.log(control)
      if (nodeState) {

        nodeState.controls = nodeState.controls.filter(c => c.type !== "delete");

        nodeState.controls.push(controlState);
      }

      
      selectedNode.addControl("delete", control  );//этот метод написан не верно, пока не понимаю почему, что-то происходит в окне но нет кнпоки.
    
      console.log(AreaExtensions.accumulateOnCtrl())
      console.log(AreaExtensions.selector())

      this.area.update("control", selectedNode.id)
      this.area.update('node', node[0].id); //эта штука обновляет нужно указывать что.
      } else {
        console.log("Нельзя добавить кнопку на initial-node ноду")
      }
      updateLocalStorage(this.editorState);

  }

  public async DeleteNode() {  //Пример контрола по идее на каждый "обькт " свой

    //метод который нигде не вызывается вроде как
    const node = this.editor.getNodes().filter(node => node.selected) 
    console.log(      this.editor.getConnection(node[0].id)
    )
    if(node !== undefined){
      console.log(node[0].id); //не сразу понял что node это список из 1 экземпляра он всего []
      const selectedNode = node[0]
     
      selectedNode.removeInput
      selectedNode.removeOutput
      this.area.removeConnectionView(selectedNode.id);
      this.editor.removeConnection(selectedNode.id)
      this.area.removeNodeView(selectedNode.id)
      this.area.update('node', node[0].id); //эта штука обновляет нужно указывать что.
      this.area.update
    }
    updateLocalStorage(this.editorState);

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
    updateLocalStorage(this.editorState);

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
  updateLocalStorage(this.editorState);

}


}