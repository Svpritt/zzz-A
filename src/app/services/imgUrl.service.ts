import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private _imageUrl: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  get imageUrl$(): Observable<string | null> {
    return this._imageUrl.asObservable();
  }



  set imageUrl(value: string | null) {
    this._imageUrl.next(value);
  }

  get imageUrl(): string | null {
    return this._imageUrl.getValue();
  }

}
