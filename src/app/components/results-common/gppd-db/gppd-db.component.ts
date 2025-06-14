import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges
} from '@angular/core';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { CommonModule } from '@angular/common';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { GppdDbCardComponent } from '../gppd-db-card/gppd-db-card.component';
import { ChildPagningTableComponent } from '../../../commons/child-pagning-table/child-pagning-table.component';
import { LoaderComponent } from "../../../commons/loader/loader.component";

@Component({
  selector: 'app-gppd-db',
  standalone: true,
  imports: [ChildPagningTableComponent, CommonModule, GppdDbCardComponent, LoaderComponent],

  templateUrl: './gppd-db.component.html',

   styleUrl: './gppd-db.component.css'
})
export class GppdDbComponent implements OnChanges {

  _data: any = { columns: [], rows: [] };
  _currentChildAPIBody: any;

  loading = false;
  searchByTable: boolean = false;
  isFilterApplied: boolean = false;

  count: number = 0;
  totalPages: number = 0;


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

  get pageSize(): number {
    return this._currentChildAPIBody?.length || 25;
  }

  constructor(
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }

  resultTabs: any = {};

  ngOnChanges() {
    console.log('scientificDocs received data:', this._data);
    this.handleResultTabData.emit(this._data);
  }


  handleLoadingState(data: any) {
    this.loading = data;
  }

  get dataProcessing(): boolean {
    return this.loading && !this.searchByTable;
  }

  onDataFetchRequest(payload: any) {

    this.isFilterApplied = !!(payload?.search || payload?.columns);

    // Reset loading + state
    this.loading = true;
    this.searchByTable = false;

    // Sanitize payload
    if (!('columns' in payload)) {
      delete this._currentChildAPIBody.columns;
    }
    if (!('search' in payload)) {
      delete this._currentChildAPIBody.search;
    }

    const requestBody = {
      ...this._currentChildAPIBody,
      ...payload
    };

    this.mainSearchService.gppdDbSearchSpecific(requestBody).subscribe({
      next: (result: any) => {
        this._data.rows = result?.data?.data || [];
        this._data.columns = result?.data?.columns || [];

        this.count = result?.data?.recordsFiltered ?? result?.data?.recordsTotal;
        this.totalPages = Math.ceil(this.count / this.pageSize);
        this._currentChildAPIBody.count = this.count;

        this.searchByTable = true;
        this.loading = false;
        this.handleResultTabData.emit(this._data.rows);
      },
      error: (err) => {
        console.error('API Error:', err);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
