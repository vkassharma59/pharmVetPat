import {
  Component, EventEmitter,
  Input,
  Output,
  OnChanges
} from '@angular/core';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { CommonModule } from '@angular/common';
import { GppdDbCardComponent } from '../gppd-db-card/gppd-db-card.component';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';

// @Component({
//   selector: 'app-gppd-db',
//   standalone: true,
//   imports: [ChildPagingComponent, CommonModule, GppdDbCardComponent],
//   templateUrl: './gppd-db.component.html',
//   styleUrl: './gppd-db.component.css'
// })
// export class GppdDbComponent {
//   @Output() handleResultTabData = new EventEmitter<any>();
//   @Output() handleSetLoading = new EventEmitter<boolean>();
//   @Input() currentChildAPIBody: any;

//   // fir kahi pe

//   @Input()
//   set data(value: any) {
//     this._data = value;
//     // Emit only rows to parent if needed
//     this.handleResultTabData.emit(this._data?.rows || []);
//   }

//   get data() {
//     return this._data;
//   }

//   resultTabs: any = {};
//   _data: any = { columns: [], rows: [] }; // expected structure

//   constructor(private utilityService: UtilityService) {
//     this.resultTabs = this.utilityService.getAllTabsName();
//   }
//   handleFilterApplied(event: any) {
//   this.gppdDbSearch(event, 1);
// }

//    ngOnChanges() {
//     console.log('scientificDocs received data:', this._data);
//     console.log('currentChildAPIBody:', this.currentChildAPIBody);
//     this.handleResultTabData.emit(this.currentChildAPIBody);

//   }
// }
@Component({
  selector: 'app-gppd-db',
  standalone: true,
  imports: [ChildPagingComponent, CommonModule, GppdDbCardComponent],
  templateUrl: './gppd-db.component.html',
  styleUrl: './gppd-db.component.css'
})
export class GppdDbComponent {
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @Input() currentChildAPIBody: any;
  _currentChildAPIBody: any;
  searchByTable: boolean = false;
  @Input()
  set data(value: any) {
    this._data = value;
    this.handleResultTabData.emit(this._data?.rows || []);
  }

  get data() {
    return this._data;
  }

  resultTabs: any = {};
  _data: any = { columns: [], rows: [] };

  constructor(private utilityService: UtilityService, 
    private mainSearchService: MainSearchService) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }

  ngOnChanges() {
    console.log('scientificDocs received data:', this._data);
    console.log('currentChildAPIBody:', this.currentChildAPIBody);
    this.handleResultTabData.emit(this.currentChildAPIBody);
  }

  handleFilterApplied(event: any) {
    this.gppdDbSearch(event, 1); // 👇👇👇 This method MUST exist!
  }

  gppdDbSearch(resultTabData: any, pageNo: number = 1) {
  this.handleSetLoading.emit(true);
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
console.log("resulttabData",resultTabData)
  const updatedBody = {
    ...this.currentChildAPIBody,
     ...resultTabData
    
  };

  // API call
  this.mainSearchService.gppdDbSearchSpecific(updatedBody).subscribe({
    next: (res) => {
      // Yeh _data update kar raha hai
      this._data.rows = res?.data?.rows || [];
      this._data.columns = res?.data?.columns || [];

      this.handleResultTabData.emit(this._data.rows);
      this.handleSetLoading.emit(false);
      window.scrollTo(0, scrollTop);
    },
    error: (err) => {
      console.error('Error in gppdDbSearch:', err);
      this.handleSetLoading.emit(false);
      window.scrollTo(0, scrollTop);
    }
  });
}
  onDataFetchRequest(payload: any) {
 console.log('Pagination triggered with payload:', payload); // 🧪 Confirm this prints
    // Deep clone to avoid mutating original
    const requestBody = {
      ...this._currentChildAPIBody,
      ...payload
    };

    this.handleSetLoading.emit(true);

    this.mainSearchService.spcdbSearchSpecific(requestBody).subscribe({
      next: (result: any) => {
        console.log('Search API Result:---------------', result);
        this._data.rows = result?.data?.data || [];
         this._data.columns = result?.data?.columns || [];
        this._currentChildAPIBody.count = result?.data?.recordsFiltered ?? result?.data?.recordsTotal;
        this.searchByTable = true;
         this.handleResultTabData.emit(this._data.data);
        this.handleSetLoading.emit(false);
      },
      error: (err) => {
        console.error('API Error:', err);
      },
      complete: () => {
        this.handleSetLoading.emit(false);
      }
    });
  }

}


