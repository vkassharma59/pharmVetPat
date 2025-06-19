import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedRosService {

  // constructor() { }
   private rosCountSubject = new BehaviorSubject<{ agrochemical: number, pharmaceutical: number } | null>(null);

  // Observable to subscribe to
  rosCount$ = this.rosCountSubject.asObservable();

  // Function to update
  setROSCount(count: { agrochemical: number, pharmaceutical: number }) {
    this.rosCountSubject.next(count);
  }
}
