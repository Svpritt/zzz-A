import { SocketComponent } from "rete-angular-plugin";
import { ClassicPreset } from "rete";
import { Component, Input } from "@angular/core";
import { classic } from "rete-angular-plugin/presets";

// Создание нового класса контрола с внутренним контентом
export class CustomOutputControl extends ClassicPreset.Output<ClassicPreset.Socket> {
  constructor(socket: ClassicPreset.Socket) {
    super(socket);
  }
}

@Component({
  selector: "app-custom-output",
  template: `
    <div>
      <p>{{ data.label }}</p> <!-- Внутренний контент -->
      <div class="socket"></div> <!-- Сокет -->
    </div>
  `,
  styleUrls: ["./custom-output.component.css"]
})
export class CustomOutputComponent {
  @Input() data!: CustomOutputControl;

  //по идее в Дата у меня теперь сидит фулл вся дичь там id label multiconections и все все.
}
