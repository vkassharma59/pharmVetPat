import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  HostListener,
  ElementRef,
  ViewChildren, QueryList
} from '@angular/core';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { CommonModule } from '@angular/common';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { ChildPagningTableComponent } from '../../../commons/child-pagning-table/child-pagning-table.component';
import { NonPatentCardComponent } from '../non-patent-card/non-patent-card.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';

@Component({
  selector: 'app-non-patent',
  standalone: true,
  imports: [ChildPagningTableComponent, CommonModule, NonPatentCardComponent, TruncatePipe],
  templateUrl: './non-patent.component.html',
  styleUrl: './non-patent.component.css'
})
export class NonPatentComponent implements OnChanges {

  _data: any = { columns: [], rows: [] }; // expected structure
  _currentChildAPIBody: any;
  searchByTable: boolean = false;
  isFilterApplied: boolean = false; // agar filter lagana hai to true karenge
  count: number = 0;
  totalPages: number = 0;
  @Input() tabName?: string;

  get pageSize(): number {
    return this._currentChildAPIBody?.length || 25;
  }
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
  @Input() index: any;
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
    if (value) {
      this.nonPatentApiBody = JSON.parse(JSON.stringify(value)) || value;
      this.handleFetchFilters();
    }
  }
  resultTabs: any = {};
  constructor(private utilityService: UtilityService,
    private mainSearchService: MainSearchService,
    public loadingService: LoadingService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }

  ngOnChanges() {
    console.log('scientificDocs received data:', this._data);
    this.handleResultTabData.emit(this._data);
  }

  onDataFetchRequest(payload: any) {
    console.log("📤 Child emitted payload →", payload);
  
    this.isFilterApplied = !!(payload?.search || payload?.columns);
    console.log("🔍 Is filter applied? →", this.isFilterApplied);
  
    // Remove stale filters from _currentChildAPIBody if they are not in payload
    if (!('columns' in payload)) {
      console.log("🧹 Removing stale 'columns' filter from _currentChildAPIBody");
      delete this._currentChildAPIBody.columns;
    }
  
    if (!('search' in payload)) {
      console.log("🧹 Removing stale 'search' filter from _currentChildAPIBody");
      delete this._currentChildAPIBody.search;
    }
  
    const requestBody = {
      ...this._currentChildAPIBody,
      ...payload
    };
    this._currentChildAPIBody = requestBody;
  
    console.log("📦 Final requestBody →", JSON.stringify(requestBody, null, 2));
  
    this.handleSetLoading.emit(true);
  
    this.mainSearchService.spcdbSearchSpecific(requestBody).subscribe({
      next: (result: any) => {
        console.log("✅ API Response →", result);
  
        this._data.rows = result?.data?.data || [];
        console.log("📊 Rows received →", this._data.rows.length, "rows");
  
        this.count = result?.data?.recordsFiltered ?? result?.data?.recordsTotal;
        console.log("🔢 Count (recordsFiltered/recordsTotal) →", this.count);
  
        this.totalPages = Math.ceil(this.count / this.pageSize);
        console.log("📑 Total pages →", this.totalPages);
  
        this._currentChildAPIBody.count = this.count;
  
        this.searchByTable = true;
        console.log("📌 searchByTable flag set →", this.searchByTable);
  
        this.handleResultTabData.emit(this._data.rows);
        console.log("📤 Emitting rows to handleResultTabData");
  
        this.handleSetLoading.emit(false);
      },
      error: (err) => {
        console.error("❌ API Error →", err);
        this.handleSetLoading.emit(false);
      },
      complete: () => {
        console.log("✅ API call completed");
        this.handleSetLoading.emit(false);
      }
    });
  }
  nonPatentApiBody: any;
  nonPatentFilters: any = {};
  lastClickedFilterKey: string | null = null;

  filterConfigs = [
    // {
    //   key: 'order',
    //   label: 'Order By',
    //   dataKey: 'order',
    //   filterType: 'order',
    //   dropdownState: false
    // },
    {
      key: "concepts",
      label: 'View All Non Patent Concepts',
      dataKey: 'conceptFilters',
      filterType: "concepts",
      dropdownState: false
    }
  ];

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInsideAny = this.dropdownRefs?.some((dropdown: ElementRef) =>
      dropdown.nativeElement.contains(event.target)
    );

    if (!clickedInsideAny) {
      this.filterConfigs = this.filterConfigs.map(config => ({
        ...config,
        dropdownState: false
      }));
    }
  }

  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'order': label = 'Order By'; break;
            case 'concepts': label = 'Concept Filter'; break;
          }
        }
        return { ...item, label: label };
      }
      return item;
    });
  }

  onFilterButtonClick(filterKey: string) {
    this.lastClickedFilterKey = filterKey;
    this.filterConfigs = this.filterConfigs.map((item) => ({
      ...item,
      dropdownState: item.key === filterKey ? !item.dropdownState : false
    }));
  }

  handleFetchFilters() {
    this.nonPatentApiBody.filter_enable = true;
    this.mainSearchService.NonPatentSearchSpecific(this.nonPatentApiBody).subscribe({
      next: (res: any) => {
        const order = ['Latest First', 'Oldest First'];
        const conceptFilters = res?.data?.concepts?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        this.nonPatentFilters = {
          order,
          conceptFilters: conceptFilters,
        };
        this.nonPatentApiBody.filter_enable = false;
      },
      error: (err) => {
        console.error('[handleFetchFilters] API call failed:', err);
        this.nonPatentApiBody.filter_enable = false;
      }
    });
  }

  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    this.handleSetLoading.emit(true);
    this.nonPatentApiBody.filters = this.nonPatentApiBody.filters || {};

    if (value === '') {
      delete this.nonPatentApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.nonPatentApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, name || '');
    }
    this.isFilterApplied = Object.keys(this.nonPatentApiBody.filters).length > 0;
    // Close dropdown
    this.filterConfigs = this.filterConfigs.map((item) => ({
      ...item,
      dropdownState: item.key === filterKey ? false : item.dropdownState
    }));
    // ✅ Maintain columns array properly
    const existingColumns = this._currentChildAPIBody.columns || [];

    const updatedColumns = existingColumns.filter((col: any) => col.data !== filterKey);

    if (value) {
      updatedColumns.push({
        data: filterKey,
        searchable: 'true',
        search: {
          value: value
        }
      });
    }
    this._currentChildAPIBody = {
      ...this.nonPatentApiBody,
      filters: { ...this.nonPatentApiBody.filters },
      // columns: updatedColumns,
      draw: 1,
    };
    console.log('Updated _currentChildAPIBody:', this._currentChildAPIBody);
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.NonPatentSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        const resultData = res?.data || {};
        console.log('res data:', res.data);

        this.count = resultData?.recordsFiltered ?? resultData?.recordsTotal;
        this.totalPages = Math.ceil(this.count / this.pageSize);
        this._currentChildAPIBody.count = this.count;
        this._data = {
          ...this._data,
          rows: resultData?.data || []
        };
        this.searchByTable = true;
        this.handleResultTabData.emit(this._data.rows);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: () => {
        this._currentChildAPIBody.filter_enable = false;
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      }
    });
  }

  clear() {
    this.filterConfigs = this.filterConfigs.map(config => {
      let defaultLabel = '';
      switch (config.key) {
        // case 'order': defaultLabel = 'Order By'; break;
        case 'concepts': defaultLabel = 'Concept Filter'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.nonPatentApiBody.filters = {};
    this.isFilterApplied = false;
    const payload = {
      ...this.nonPatentApiBody,
      filters: {},
      page_no: 1,
      start: 0,
    };

    // this.handleSetLoading.emit(true);
    // this.mainSearchService.NonPatentSearchSpecific(this._currentChildAPIBody).subscribe({
    //   next: (res) => {
    //     this._currentChildAPIBody.count = res?.data?.recordsTotal;
    //     this._data.rows = res?.data?.data || [];
    //     this.count = this._currentChildAPIBody.count;
    //     this.totalPages = Math.ceil(this.count / this.pageSize); // Recalculate pagination
    //     this.searchByTable = false;
    //     this.handleResultTabData.emit(this._data.rows);
    //     this.handleSetLoading.emit(false);
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     this._currentChildAPIBody.filter_enable = false;
    //     this.handleSetLoading.emit(false);
    //   }
    // });
    this.onDataFetchRequest(payload);
    window.scrollTo(0, 0);
  }

}