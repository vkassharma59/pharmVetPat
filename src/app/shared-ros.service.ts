import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedRosService {
 private storageKey = 'lastSearchData';
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
   

//  setSearchData(searchType: string, keyword: string, criteria: any): void {
//     const data = { searchType, keyword, criteria };
//     localStorage.setItem('lastSearchData', JSON.stringify(data));
//   }

   setSearchData(searchType: string, keyword: string, criteria: any): void {
    this.clearSearchData();

    let displayValue = '';

    // CASE 1: Advanced Search (criteria is array)
    if (Array.isArray(criteria) && criteria.length > 0) {
      displayValue = criteria.map(c => `${c.column}: ${c.keyword}`).join(', ');
    }
    // CASE 2b: Column-based Simple Search (criteria is string + keyword)
    else if (typeof criteria === 'string' && criteria.trim() !== '' && keyword) {
      displayValue = `${criteria}: ${keyword}`;
    }
    // CASE 2a: Normal Simple Search (only keyword)
    else if (keyword) {
      displayValue = keyword;
    }
    // Fallback
    else {
      displayValue = 'No search data';
    }

    const data = { searchType, keyword, criteria, displayValue };
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
  // Get last search data
  getSearchData(): { searchType: string, keyword: string, criteria: any } | null {
    const data = localStorage.getItem('lastSearchData');
    return data ? JSON.parse(data) : null;
  }

  // Clear
  clearSearchData(): void {
    localStorage.removeItem('lastSearchData');
  }
}
