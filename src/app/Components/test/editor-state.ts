export class EditorState {
    public nodes: NodeState[] = [];
    public connections: ConnectionState[] = [];
}

export class NodeState {
    public id: string = '';
    public label: string = '';
    public selected: boolean = false;
    public botType: string = '';
    public inputs: NodePort = new NodePort(); // возможно каждому надо было свой класс создать, но хз
    public outputs: NodePort = new NodePort(); 

    public x: number = 0;
    public y: number = 0;

    public controls: ControlState[] = [];
}

export class NodePort {
    public id: string = '';
    public multipleConnections: boolean = false;
    
}

export class ControlState {
    public id: string = '';
    public type: string = '';
    public onClick!: () => void;
    public value: string = '';
}

export class ConnectionState {
    public id: string = ''; // Идентификатор соединения
    public source: string = ''; // ID узла, являющегося источником соединения
    public sourceOutput: string = ''; // Название выхода узла-источника
    public target: string = ''; // ID узла, являющегося целью соединения
    public targetInput: string = ''; // Название входа узла-цели
}

