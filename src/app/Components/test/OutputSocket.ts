import { ClassicPreset } from "rete";

export class OutputSocket extends ClassicPreset.Socket {
  constructor() {
    super("Action");
  }

  isCompatibleWith(socket1: ClassicPreset.Socket) {
    return socket1 instanceof OutputSocket;
  }
}