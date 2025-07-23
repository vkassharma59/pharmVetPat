import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedRosService {

  private rosCountSubject = new BehaviorSubject<{ agrochemical: number, pharmaceutical: number, index: any } | null>(null);

  // Observable to subscribe to
  rosCount$ = this.rosCountSubject.asObservable();

  // Function to update
  setROSCount(count: { agrochemical: number, pharmaceutical: number, index: any }) {
    this.rosCountSubject.next(count);
  }
  // ✅ New BehaviorSubject for allDataSets
  private allDataSetsSubject = new BehaviorSubject<any[]>([]);
  allDataSets$ = this.allDataSetsSubject.asObservable();

  setAllDataSets(data: any[]) {
    this.allDataSetsSubject.next(data);
  }

  getAllDataSets(): any[] {
    return this.allDataSetsSubject.getValue();
  }
}
