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

@Component({
  selector: 'app-gppd-db',
  standalone: true,
  imports: [ChildPagningTableComponent, CommonModule, GppdDbCardComponent],
   templateUrl: './gppd-db.component.html',
  styleUrl: './gppd-db.component.css'
})
export class  GppdDbComponent  implements OnChanges {

  _data: any = { columns: [], rows: [] }; // expected structure
  _currentChildAPIBody: any;
  searchByTable: boolean = false;

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
    // Deep clone to avoid mutating original
    const requestBody = {
      ...this._currentChildAPIBody,
      ...payload
    };
    console.log('Paginated with payload:', payload); // 🧪 Confirm this prints

    console.log('Pagination triggered with payload:', requestBody); // 🧪 Confirm this prints

    this.handleSetLoading.emit(true);

    this.mainSearchService.gppdDbSearchSpecific(requestBody).subscribe({
      next: (result: any) => {
        console.log('Search API Result:---------------', result);
        this._data.rows = result?.data?.data || [];
        this._currentChildAPIBody.count = result?.data?.recordsFiltered ?? result?.data?.recordsTotal;
        this.searchByTable = true;
        this.handleResultTabData.emit(this._data.rows);
        // this.handleResultTabData.emit(this._data.data);

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


}