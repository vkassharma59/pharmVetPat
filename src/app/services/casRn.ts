import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CasRnService {
  private casRnSource = new BehaviorSubject<{type: 'intermediate' | 'synthesis', value: string} | null>(null);
  casRn$ = this.casRnSource.asObservable();

  setCasRn(type: 'intermediate' | 'synthesis', value: string) {
    this.casRnSource.next({ type, value });
  }
}
