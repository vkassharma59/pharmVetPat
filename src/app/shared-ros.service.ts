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

    console.log('📦 setSearchData()', {
      searchType,
      keyword,
      criteria
    });

    // CASE 1: Advanced search (criteria array)
    if (Array.isArray(criteria) && criteria.length > 0) {
      displayValue = criteria
        .map((c: any) => `${c.column}: ${c.keyword}`)
        .join(', ');
    }
    // CASE 2: Column based search
    else if (typeof criteria === 'string' && criteria.trim() !== '' && keyword) {
      displayValue = `${criteria}: ${keyword}`;
    }
    // CASE 3: Simple search
    else if (keyword) {
      displayValue = keyword;
    }
    // Fallback
    else {
      displayValue = 'No search data';
    }

    const data = {
      searchType,
      keyword,
      criteria,
      displayValue,
      timestamp: Date.now()
    };

    localStorage.setItem(this.storageKey, JSON.stringify(data));

    console.log('✅ Search data stored:', data);
  }

  /**
   * Get last search data (used on BACK)
   */
  getSearchData(): {
    searchType: string;
    keyword: string;
    criteria: any;
    displayValue: string;
  } | null {
    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      console.warn('⚠️ No search data found in storage');
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      console.log('📤 getSearchData()', parsed);
      return parsed;
    } catch (err) {
      console.error('❌ Invalid search data in storage', err);
      return null;
    }
  }

  // Clear
  clearSearchData(): void {
    localStorage.removeItem('lastSearchData');
  }
}
