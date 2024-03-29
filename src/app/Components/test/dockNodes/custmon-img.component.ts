import { Component, Input, OnInit } from "@angular/core";
import { ClassicPreset } from "rete";
import { Preset } from "rete-connection-plugin";
import { RenderPreset } from "rete-angular-plugin/15";
import { AfterViewInit } from '@angular/core';
import { ImageService } from "src/app/services/imgUrl.service";

export class ImageControl extends ClassicPreset.Control {

  constructor(public imageUrl: string | null) {
    super();
    // imageUrl: null;
  }
}

@Component({
  selector: "app-image-component",
  template: `
  <div>
    <img *ngIf="imageUrl" [src]="imageUrl" alt="Uploaded Image" style="width:100px; height:100px"/>
</div>

     `
})
export class ImageComponent implements OnInit{
  // implements OnInit
  // imageUrl: string | null = null;
  @Input() data!: ImageControl; //ошибка, поставил ! думаю дата по другому сюда не попадет.

  constructor(private imageService: ImageService) {}

  ngOnInit() {
    console.log(this.data)
    this.imageService.imageUrl$.subscribe(url => {
      this.imageUrl = url;
    });

  }
  imageUrl: string | null = null;

  // constructor() {}

  
}

  
  // imageUrl: string | null = null;
  // constructor() {
  //   // Додавання обробника подій під час ініціалізації компоненту
  //   this.onFileSelected = this.onFileSelected.bind(this);
  // }

  // onFileSelected(event: Event) {
  //   const inputElement = event.target as HTMLInputElement;
  //   const files = inputElement.files;
  //   if (!files || !files[0]) return;

  //   const file = files[0];
  //   const reader = new FileReader();
    
  //   reader.onload = (e: ProgressEvent<FileReader>) => {
  //     const target = e.target as FileReader;
  //     this.imageUrl = target.result as string;
  //     console.log("Image loaded successfully");
  //   };

  //   reader.readAsDataURL(file);
  // }

  // onFileSelected(event: Event, component: ImageComponent) {
  //   const inputElement = event.target as HTMLInputElement;
  //   const files = inputElement.files;
  //   if (!files || !files[0]) return;
  
  //   const file = files[0];
  //   const reader = new FileReader();
    
  //   reader.onload = (e: ProgressEvent<FileReader>) => {
  //     const target = e.target as FileReader;
  //     component.imageUrl = target.result as string;
  //     console.log("Image loaded successfully");
  //   };
  
  //   reader.readAsDataURL(file);
  // }