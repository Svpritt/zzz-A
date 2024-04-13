import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReteModule } from "rete-angular-plugin/15";

import { AppComponent } from "./app.component";

import { TestComponent } from "./Components/test/test.component";
import { MyEditor } from "./Components/test/editor";
import { ButtonComponent } from "./Components/test/dockNodes/custom-button.component";

import { ImageComponent } from "./Components/test/dockNodes/custmon-img.component";
import { CustomNodeComponent } from "./Components/test/dockNodes/custom-node/custom-node.component";
import { UploadImgComponent } from "./Components/test/dockNodes/upload-img/upload-img.component";
import { ImageService } from "./services/imgUrl.service";
import { TextBoxComponent } from './Components/test/dockNodes/text-box/text-box.component';
import { UploadTextComponent } from './Components/test/dockNodes/upload-text/upload-text.component';
import { FormsModule } from "@angular/forms";
import { CustomOutputComponent } from './Components/test/dockNodes/custom-output/custom-output.component';
@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    ButtonComponent,
    ImageComponent,
    CustomNodeComponent,
    UploadImgComponent,
    TextBoxComponent,
    UploadTextComponent,
    CustomOutputComponent
    
  ],
  imports: [
    BrowserModule,
    CommonModule,
    ReteModule,
    FormsModule
  ],
  providers: [
    MyEditor,
    ImageService

  ],
  bootstrap: [AppComponent],
  exports:[
  ]
})
export class AppModule {}
