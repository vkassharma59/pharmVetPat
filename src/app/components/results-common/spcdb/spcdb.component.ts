import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges
} from '@angular/core';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { CommonModule } from '@angular/common';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { SpcdbCardComponent } from '../spcdb-card/spcdb-card.component';
import { MainSearchService } from '../../../services/main-search/main-search.service';

@Component({
  selector: 'chem-spcdb',
  standalone: true,
  imports: [ChildPagingComponent, CommonModule, SpcdbCardComponent],
  templateUrl: './spcdb.component.html',
  styleUrl: './spcdb.component.css'
})
export class SpcdbComponent implements OnChanges {

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
    this.handleResultTabData.emit(this.currentChildAPIBody);
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