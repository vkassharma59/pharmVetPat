import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  // Structure: { [tabName: string]: { [index: number]: boolean } }
  private loadingMap = new BehaviorSubject<{ [tab: string]: { [idx: number]: boolean } }>({});

  setLoading(tab: string, idx: number, value: boolean) {
    const map = { ...this.loadingMap.value };
    if (!map[tab]) map[tab] = {};
    map[tab][idx] = value;
    this.loadingMap.next(map);
  }

  getLoading(tab: string, idx: number): boolean {
    return !!this.loadingMap.value[tab]?.[idx];
  }

  loading$ = this.loadingMap.asObservable();
}
