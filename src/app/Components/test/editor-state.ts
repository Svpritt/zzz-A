export class EditorState {
    public nodes: NodeState[] = [];
    public connections: ConnectionState[] = [];
}

export class NodeState {
    public id: string = '';
    public label: string = '';
    public selected: boolean = false;

    // public inputs:
    // public outputs:


    public botType: string = '';

    public x: number = 0;
    public y: number = 0;

    public controls: ControlState[] = [];
}

export class ControlState {
    public id: string = '';
    public type: string = '';
    public onClick!: () => void;
    public value: string = '';
}

export class ConnectionState {
    public id: string = '';
    public fromNodeId: string = '';
    public toNodeId: string = '';
}

