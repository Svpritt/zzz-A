import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReteModule } from "rete-angular-plugin/15";

import { AppComponent } from "./app.component";

import { TestComponent } from "./Components/test/test.component";
import { MyEditor } from "./Components/test/editor";
import { ButtonComponent } from "./Components/test/dockNodes/custom-button.component";


@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    ButtonComponent,

  ],
  imports: [BrowserModule, CommonModule, ReteModule,],
  providers: [
    MyEditor

  ],  bootstrap: [AppComponent],
})
export class AppModule {}
