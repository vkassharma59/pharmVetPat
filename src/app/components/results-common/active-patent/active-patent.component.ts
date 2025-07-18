import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  HostListener,
  ElementRef,
  ViewChildren,
  QueryList
} from '@angular/core';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { CommonModule } from '@angular/common';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { ChildPagningTableComponent } from '../../../commons/child-pagning-table/child-pagning-table.component';
import { ActivePatentCardComponent } from "../active-patent-card/active-patent-card.component";
import { LoadingService } from '../../../services/loading-service/loading.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';

@Component({
  selector: 'chem-active-patent',
  standalone: true,
  imports: [ChildPagningTableComponent, CommonModule, ActivePatentCardComponent, TruncatePipe],
  templateUrl: './active-patent.component.html',
  styleUrl: './active-patent.component.css'
})
export class ActivePatentComponent implements OnChanges {

  _data: any = { columns: [], rows: [] };
  _currentChildAPIBody: any;
  searchByTable: boolean = false;
  isFilterApplied: boolean = false;
  count: number = 0;
  totalPages: number = 0;

  get pageSize(): number {
    return this._currentChildAPIBody?.length || 25;
  }

  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
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

  @Input() index: any;
  @Input() tabName?: string;
  resultTabs: any = {};

  constructor(
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService,
    public loadingService: LoadingService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }

  ngOnChanges() {
    this.handleResultTabData.emit(this._data);
  }
  ngOnInit(): void {
    console.log('get data called', this._data);
    this.activePatentApiBody = { ...this.currentChildAPIBody };
    this.activePatentApiBody.filters = this.activePatentApiBody.filters || {};

    console.log('[ngOnInit] Initial vetenaryusApiBody:', JSON.stringify(this.activePatentApiBody, null, 2));

    this.handleFetchFilters();
  }
  onDataFetchRequest(payload: any) {
    this.isFilterApplied = !!(payload?.search || payload?.columns);

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
    this._currentChildAPIBody = requestBody;
    this.handleSetLoading.emit(true);

    this.mainSearchService.activePatentSearchSpecific(requestBody).subscribe({
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

  activePatentApiBody: any;
  activePatentFilters: any = {};
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
      key: 'patent_type',
      label: 'Patent Type',
      dataKey: 'patentFilters',
      filterType: 'patent_type',
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
            case 'patent_type': label = 'Patent Type'; break;
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
    console.log('[handleFetchFilters] Fetching filters...');

    this.activePatentApiBody.filter_enable = true;
    console.log('[handleFetchFilters] API Body before request:', this.activePatentApiBody);

    this.mainSearchService.activePatentSearchSpecific(this.activePatentApiBody).subscribe({
      next: (res: any) => {
        console.log('[handleFetchFilters] API Response:', res);

        const hcData = res?.data?.data || [];
        console.log('[handleFetchFilters] Extracted green_book_us_data:', hcData);

        const getUnique = (arr: any[]) => [...new Set(arr.filter(v => !!v && typeof v === 'string' && v.trim().length > 0))];

        const order = ['Latest First', 'Oldest First']; // Static sort options
        // const patentFilters = getUnique(hcData.map(item => item.patent_type));
        //   console.log('[handleFetchFilters] Unique patent types:', patentFilters);
        const patentFilters = res?.data?.patent_type?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        this.activePatentFilters = {
          order,
          patentFilters: patentFilters,
        };

        this.activePatentApiBody.filter_enable = false;
        console.log('[handleFetchFilters] Filter options set:', this.activePatentFilters);
      },
      error: (err) => {
        console.error('[handleFetchFilters] API call failed:', err);
        this.activePatentApiBody.filter_enable = false;
      }
    });
  }


  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    this.handleSetLoading.emit(true);
    this.activePatentApiBody.filters = this.activePatentApiBody.filters || {};

    if (value === '') {
      delete this.activePatentApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.activePatentApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, name || '');
    }

    // Close dropdown
    this.filterConfigs = this.filterConfigs.map((item) => ({
      ...item,
      dropdownState: item.key === filterKey ? false : item.dropdownState
    }));
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
      ...this.activePatentApiBody,
      filters: { ...this.activePatentApiBody.filters },
      // columns: updatedColumns,
      draw: 1,
      start: 0,
      pageno: 1,
    };

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.activePatentSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        const resultData = res?.data || {};
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
        case 'patent_type': defaultLabel = 'Patent Type'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.activePatentApiBody.filters = {};
    this._currentChildAPIBody = {
      ...this.activePatentApiBody,
      filters: {}
    };

    this.handleSetLoading.emit(true);
    this.mainSearchService.activePatentSearchSpecific(this._currentChildAPIBody).subscribe({
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
