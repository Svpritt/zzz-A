import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReteModule } from "rete-angular-plugin/15";

import { AppComponent } from "./app.component";

import { TestComponent } from "./Components/test/test.component";
import { CustomNodeComponent } from './Components/test/custom-node/custom-node.component';

@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    CustomNodeComponent,

  ],
  imports: [BrowserModule, CommonModule, ReteModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
