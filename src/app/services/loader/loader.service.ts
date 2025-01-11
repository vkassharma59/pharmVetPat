import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class LoaderService {
  constructor() {}
  public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  show() {
    this.isLoading.next(true);
    // console.log('loader is displayed');
  }

  hide() {
    this.isLoading.next(false);
    // console.log('loader is  not displaying on screen');
  }
}
