
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
      const a = new ClassicPreset.Node("Custom");
      a.id = "initial-node" //типа старт ноде - проверки, чтоб ее нельзя было удалить
      a.addOutput("Output", new ClassicPreset.Output(new OutputSocket(), "output"));
      a.addOutput("sadasda", new ClassicPreset.Output(this.socket, "blabla"))
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
      if (node.outputs && Array.isArray(node.outputs)) {
        node.outputs.forEach((output: ClassicPreset.Output<OutputSocket>) => {
            const outputPort = new NodePort();
            outputPort.id = output.id;
            outputPort.multipleConnections = output.multipleConnections!;
            nodeState.outputs.push(outputPort);
        })}

      // const outputs = node.outputs;
      // const outputsJson =  JSON.stringify(outputs)
      // const outputsObject = JSON.parse(outputsJson);
      // const outputsId = outputsObject.Output.id;
      // const multipleConnectionsOutput = outputsObject.Output.multipleConnections;

      // nodeState.outputs.id = outputsId;
      // nodeState.outputs.multipleConnections = multipleConnectionsOutput;

      
      // nodeState.botType = 'telegram';
      this.editorState.nodes.push(nodeState);
      this.nodes = [...this.nodes, node];

      await this.editor.addNode(node);

//     
    this.loadFromNodeData(); // я должен придумать метод создания ноды - который поместит ее в стейт, а метод addNewNode должен получить ее аргументом
                            // тогда я должен этот же аргумент передавать из стейта внутри loadFromNodeData 
    


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
if (context.type === 'nodedragged') {
  const pickedId = context.data.id;
  const Node = this.editor.getNode(pickedId);
  const position = this.area.nodeViews.get(Node.id)?.position;
  console.log(position);
  //так я вечно дергаю координаты, нужно при ноде пикед - дропет. типа когда перестал пикед нод делать
 

  const nodeToUpdate = this.editorState.nodes.find(node => node.id === pickedId);

  if (nodeToUpdate) {
   
    nodeToUpdate.x = position!.x;
    nodeToUpdate.y = position!.y;
    const updatedNodes = this.editorState.nodes.map(node => {
      if (node.id === pickedId) {
        return nodeToUpdate;
      } else {
        return node;
      }
    });

    this.editorState.nodes = updatedNodes;
    updateLocalStorage(this.editorState);

  } else {
    console.error(`Node with ID ${pickedId} not found in EditorState`);
  }
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
      // setTimeout(() => {
      //   if(nodes){
      //     // console.log(nodes)
      //     // console.log(serializedData)
      //   }
      // }, 10, );
      
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

    // const nodesDataLocal = localStorage.getItem('editorNodes');
    const nodesDataLocal = localStorage.getItem('editorState');
    const data = JSON.parse(nodesDataLocal!);
    const nodesData = data.nodes;
    console.log(nodesDataLocal)
   
    const nodesData1 = [
      
      {
        "id": "3fa1e6c619ff9553",
        "label": "3fa1e6c619ff9553",
        "selected": false,
        "botType": "",
        "inputs": {
          "id": "b02703f769d5508c",
          "multipleConnections": true,
          "label": "",
          "socket": "socket"
        },
        "outputs": [
          {
            "id": "8facbe9d967aac77",
            "multipleConnections": false,
            "label": "defind",
            "socket": "socket"
          },
          {
            "id": "009f7313236a76f7",
            "multipleConnections": false,
            "label": "defind",
            "socket": "socket"
          }
        ],
        "x": 189.1875,
        "y": 325.2109375,
        "controls": [
          {
            "id": "b5a397300fd05579",
            "type": "delete",
            "value": ""
          },
          {
            "id": "c112c43261a3b803",
            "type": "text",
            "value": "123"
          }
        ]
      },
      {
        "id": "377e4057d104d4be",
        "label": "377e4057d104d4be",
        "selected": false,
        "botType": "",
        "inputs": {
          "id": "5d4b7512f363d261",
          "multipleConnections": true,
          "label": "",
          "socket": "socket"
        },
        "outputs": [
          {
            "id": "3c5097069e1fb62a",
            "multipleConnections": false,
            "label": "defind",
            "socket": "socket"
          },
          {
            "id": "07b4fefdc3c7ebc3",
            "multipleConnections": false,
            "label": "defind",
            "socket": "socket"
          }
        ],
        "x": 469.52734375,
        "y": 317.41015625,
        "controls": [
          {
            "id": "4f05172b733f34a3",
            "type": "delete",
            "value": ""
          },
          {
            "id": "3a9ced27044d082f",
            "type": "text",
            "value": "234"
          }
        ]
      },
      {
        "id": "f140aecd63f59b5b",
        "label": "f140aecd63f59b5b",
        "selected": false,
        "botType": "",
        "inputs": {
          "id": "450f9c6135f910a4",
          "multipleConnections": true,
          "label": "",
          "socket": "socket"
        },
        "outputs": [
          {
            "id": "b953946e7e01c3b6",
            "multipleConnections": false,
            "label": "defind",
            "socket": "socket"
          },
          {
            "id": "9c7a5d6a24bc52d9",
            "multipleConnections": false,
            "label": "defind",
            "socket": "socket"
          }
        ],
        "x": 636.6953125,
        "y": 147.0390625,
        "controls": [
          {
            "id": "5a82fc264bbce4f7",
            "type": "delete",
            "value": ""
          },
          {
            "id": "df14346281a8e966",
            "type": "text",
            "value": "345"
          }
        ]
      }
    ];
console.log(nodesData)


    nodesData.forEach( async (nodeData: NodeState) => {
      const node = this.nodeCreatorService.createCustomNode(this.socket);
      const nodeId = nodeData.id
      node.id = nodeId
      node.label = nodeId

      const controlsObject: { [id: string]: ClassicPreset.Control } = {};
      if( nodeData.controls ) {
      nodeData.controls.forEach(control => {
          let controlInstance: ClassicPreset.Control;
    
          switch (control.type) {
            case 'text':
              controlInstance = new TextControl(control.value);
              break;
            case 'image':
              controlInstance = new ImageControl(control.value);
              break;
            case 'delete':
              controlInstance = new ButtonControl("delete", "delete", () => {
                console.log("Кнопка нажата"); //не вижу консоль (вижу, упдейт спустя 30 минут)
                // this.area.removeNodeView(selectedNode.id) //можно было бы вызвать метод DeleteNode но он удалит не эту ноду, а ту которая будет выделена.
                                                  //у этой ноды свой selectedNode.id константа у каждого метода своя.
               const connectionsToRemove = this.editor.getConnections().filter(connection => 
                connection.source === node.id || connection.target === node.id
              );
        
              connectionsToRemove.forEach(connection => this.editor.removeConnection(connection.id));
        
              // Удаление ноды из области редактора
              this.area.removeNodeView(node.id);
              const nodeState = this.editorState.nodes.find(n => n.id === node.id);

              // nodeState //тут удаляю из Стейта ноду внутри метода delete 
              const index = this.editorState.nodes.findIndex(n => n.id === nodeState!.id);         

            if (index !== -1) {
                this.editorState.nodes.splice(index, 1);
                // updateLocalStorage(this.editorState);

            }
        
              // Удаление ноды из редактора
              this.editor.removeNode(node.id);
              updateLocalStorage(this.editorState);

              });
              break;
            // Добавьте дополнительные кейсы для других типов, если необходимо
            default:
              controlInstance = new ClassicPreset.Control();
              break;
          }

          controlsObject[control.id!] = controlInstance;
      });}

      const OutputsObject: { [id: string]: ClassicPreset.Output<ClassicPreset.Socket> } = {};

      nodeData.outputs.forEach(output =>{
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
        OutputsObject[output.id] = outputInstance;
        
        ;})

       
         

      node.outputs = OutputsObject;
      node.controls = controlsObject;
      console.log(typeof(node.id))
      // node.id = nodeData.id
      // console.log(typeof(nodeState?.id))
      // node.outputs = nodeData.outputs бля у меня при создании не все попадают в стейт а еще нужно добавленніе добавлять.

      // test add node from state to editor and after to state

      //
    
     await this.editor.addNode(node)
      const areaX = nodeData.x;
      const areaY = nodeData.y;
     await this.area.translate(node.id, { x: areaX, y: areaY });
     this.editorState.nodes.push(nodeData); // походу вот эта вещь повзоялет не перезаписывать стейт, а типа пушить туда агаин
      //тут нужно сделать addNewNode(эта нода, что бы  я ее передал аргументом) а там изменить процесс создания
    });
  
  }
  //nodestate - get node selectednode
    //const nodePort = new nodeport
    //          nodeState.outputs.push(nodePort);
    // классик выглядит так 
    // Output {socket: Socket, label: 'defind', multipleConnections: false, id: 'ba5520077948e402'}
    //кастом выглядит так
    // Output {socket: OutputSocket, label: 'я добавил динамично', multipleConnections: false, id: '53edbbf51079a060'}

  public async addNewNode() { // нужно сделать метод добавления в стейт, а при криет будет вызываться метод addNewNode который будет постить на стол
    const node = this.nodeCreatorService.createCustomNode(this.socket);
    const nodeState = new NodeState();

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
    this.editorState.nodes.push(nodeState);
    this.nodes = [...this.nodes, node];

    await this.editor.addNode(node);
    if (this.nodes.length > 0) {  
      const previousNode = this.editor.getNode(this.socketNodeId)
      // Устанавливаем соединение между отпут нодой и новой нодой
      await this.editor.addConnection(new ClassicPreset.Connection(previousNode, this.socketKey, node, "Input"));
      this.socketNodeId = "";
        this.socketKey = "";
  }
          const areaX = this.area.area.pointer.x;
          const areaY = this.area.area.pointer.y;
          nodeState.x = areaX;
          nodeState.y = areaY;
          await this.area.translate(node.id, { x: areaX, y: areaY });

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