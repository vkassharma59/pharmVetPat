import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CasRnService {
  private casRnSource = new BehaviorSubject<{
    type: 'intermediate' | 'synthesis';
    CAS_RN?: string;
    chemicalName?: string;
  } | null>(null);

  casRn$ = this.casRnSource.asObservable();

  setCasRn(type: 'intermediate' | 'synthesis', CAS_RN?: string, chemicalName?: string) {
    this.casRnSource.next({ type, CAS_RN, chemicalName });
  }
}

