import { ClassicPreset } from "rete";

export class OutputSocket extends ClassicPreset.Socket {
  constructor() {
    super("Action");
  }

  isCompatibleWith(CustomOutputSocket: ClassicPreset.Socket) {
    return CustomOutputSocket instanceof OutputSocket;
  }
}