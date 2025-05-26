import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges
} from '@angular/core';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { CommonModule } from '@angular/common';
import { SpcdbCardComponent } from '../spcdb-card/spcdb-card.component';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { ChildPagningTableComponent } from '../../../commons/child-pagning-table/child-pagning-table.component';

@Component({
  selector: 'chem-spcdb',
  standalone: true,
  imports: [ChildPagningTableComponent, CommonModule, SpcdbCardComponent],
  templateUrl: './spcdb.component.html',
  styleUrl: './spcdb.component.css'
})
export class SpcdbComponent implements OnChanges {

  _data: any = { columns: [], rows: [] }; // expected structure
  _currentChildAPIBody: any;
  searchByTable: boolean = false;
  isFilterApplied: boolean = false; // agar filter lagana hai to true karenge
count: number = 0;
totalPages: number = 0;

get pageSize(): number {
  return this._currentChildAPIBody?.length || 25;
}

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();

  @Input()
  set data(value: any) {
    this._data = value;
    this.handleResultTabData.emit(this._data?.rows || []);
  }

  get data() {
    return this._data;
  }

  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
  }

  resultTabs: any = {};

  constructor(private utilityService: UtilityService,
    private mainSearchService: MainSearchService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }

  ngOnChanges() {
    console.log('scientificDocs received data:', this._data);
    this.handleResultTabData.emit(this._data);
  }

  onDataFetchRequest(payload: any) {
  this.isFilterApplied = !!(payload?.search || payload?.columns);

  const requestBody = {
    ...this._currentChildAPIBody,
    ...payload
  };

  this.handleSetLoading.emit(true);

  this.mainSearchService.spcdbSearchSpecific(requestBody).subscribe({
    next: (result: any) => {
      this._data.rows = result?.data?.data || [];
      this.count = result?.data?.recordsFiltered ?? result?.data?.recordsTotal;
      this.totalPages = Math.ceil(this.count / this.pageSize);
      this._currentChildAPIBody.count = this.count;
      this.searchByTable = true;
      this.handleResultTabData.emit(this._data.rows);
      this.handleSetLoading.emit(false);
    },
    error: (err) => {
      console.error('API Error:', err);
      this.handleSetLoading.emit(false);
    },
    complete: () => {
      this.handleSetLoading.emit(false);
    }
  });
}

  // onDataFetchRequest(payload: any) {
  // this.isFilterApplied = !!(payload?.search || payload?.columns);    
  // // Deep clone to avoid mutating original
  //   const requestBody = {
  //     ...this._currentChildAPIBody,
  //     ...payload
  //   };
  // console.log(this.isFilterApplied)
  //   console.log('Paginated with payload:', payload); // 🧪 Confirm this prints
  //   console.log('Pagination triggered with payload:', requestBody); // 🧪 Confirm this prints
  //   this.handleSetLoading.emit(true);
  //   this.mainSearchService.spcdbSearchSpecific(requestBody).subscribe({
  //     next: (result: any) => {
  //       console.log('Search API Result:---------------', result);
  //       this._data.rows = result?.data?.data || [];
  //       this._currentChildAPIBody.count = result?.data?.recordsFiltered ?? result?.data?.recordsTotal;
  //       this.searchByTable = true;
  //       this.handleResultTabData.emit(this._data.rows);
  //       // this.handleResultTabData.emit(this._data.data);

  //       this.handleSetLoading.emit(false);
  //     },
  //     error: (err) => {
  //       console.error('API Error:', err);
  //        this.handleSetLoading.emit(false);
  //     },
  //     complete: () => {
  //       this.handleSetLoading.emit(false);
  //     }
  //   });
  // }


}