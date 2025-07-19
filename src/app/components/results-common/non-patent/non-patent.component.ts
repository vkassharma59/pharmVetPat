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
    this.isFilterApplied = !!(payload?.search || payload?.columns);
    // Remove stale filters from _currentChildAPIBody if they are not in payload
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
    console.log("dsjfdbdf bn", requestBody)
    console.log("request body dsjfdbdf bn", requestBody)
    this._currentChildAPIBody = requestBody;
    this.handleSetLoading.emit(true);

    this.mainSearchService.NonPatentSearchSpecific(requestBody).subscribe({
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
  nonPatentApiBody: any;
  nonPatentFilters: any = {};
  lastClickedFilterKey: string | null = null;

  filterConfigs = [
    {
      key: 'order',
      label: 'Order By',
      dataKey: 'order',
      filterType: 'order',
      dropdownState: false
    },
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
    console.log('[handleFetchFilters] Starting to fetch Non-Patent filters...');
    this.nonPatentApiBody.filter_enable = true;

    this.mainSearchService.NonPatentSearchSpecific(this.nonPatentApiBody).subscribe({
      next: (res: any) => {
        const hcData = res?.data || [];
        console.log('[handleFetchFilters] Extracted records:', hcData);

        const getUnique = (arr: any[]) => [...new Set(arr.filter(Boolean))];

        const order = ['Latest First', 'Oldest First'];
        const conceptFilters = res?.data?.concepts?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];

        console.log('[handleFetchFilters] Unique concept filters:', conceptFilters);
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
      draw: 1, start: 0,
      pageno: 1,
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
        case 'order': defaultLabel = 'Order By'; break;
        case 'concepts': defaultLabel = 'Concept Filter'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.nonPatentApiBody.filters = {};
    this._currentChildAPIBody = {
      ...this.nonPatentApiBody,
      filters: {}
    };

    this.handleSetLoading.emit(true);
    this.mainSearchService.NonPatentSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody.count = res?.data?.recordsTotal;
        this._data.rows = res?.data?.data || [];
        this.count = this._currentChildAPIBody.count;
        this.totalPages = Math.ceil(this.count / this.pageSize); // Recalculate pagination
        this.searchByTable = false;
        this.handleResultTabData.emit(this._data.rows);
        this.handleSetLoading.emit(false);
      },
      error: (err) => {
        console.error(err);
        this._currentChildAPIBody.filter_enable = false;
        this.handleSetLoading.emit(false);
      }
    });

    window.scrollTo(0, 0);
  }

}