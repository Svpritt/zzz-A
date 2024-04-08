import { Component } from '@angular/core';
import { ImageService } from 'src/app/services/imgUrl.service';

@Component({
  selector: 'app-upload-img',
  templateUrl: './upload-img.component.html',
  styleUrls: ['./upload-img.component.css']
})
export class UploadImgComponent {
    Url: string | null = null;
  
    constructor(private imageService: ImageService) {}
  
    onFileSelected(event: Event, component: UploadImgComponent) {

        const inputElement = event.target as HTMLInputElement;
        const files = inputElement.files;
        if (!files || !files[0]) return;

        const file = files[0];
        const reader = new FileReader();
        
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const target = e.target as FileReader;
          console.log(component.Url)
          component.Url = target.result as string;
          this.imageService.setImgUrl(component.Url)
          console.log("Image loaded successfully");
          console.log("Image URL from service:", this.imageService);
       
        };
        reader.readAsDataURL(file);
      }
  
    
  }

   // this.imageService.imageUrl$.subscribe(imageUrl => {
          //   console.log("Current image URL:", imageUrl);
          // });
                    // this.imageService.imageUrl = component.Url; // Используйте imageUrl вместо set

          // Записываем данные в сервис