import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CasRnState {
  type: 'intermediate' | 'synthesis' | null;
  CAS_RN: string;
  chemicalName: string;
}

@Injectable({ providedIn: 'root' })
export class CasRnService {

  private casRnSource = new BehaviorSubject<CasRnState>({
    type: null,
    CAS_RN: '',
    chemicalName: ''
  });

  casRn$ = this.casRnSource.asObservable();

  setCasRn(
    type: 'intermediate' | 'synthesis',
    CAS_RN?: string,
    chemicalName?: string
  ) {
    this.casRnSource.next({
      type,
      CAS_RN: CAS_RN?.trim() || '',
      chemicalName: chemicalName?.trim() || ''
    });
  }
  getCasRn(): CasRnState {
    return this.casRnSource.value;
  }
}

