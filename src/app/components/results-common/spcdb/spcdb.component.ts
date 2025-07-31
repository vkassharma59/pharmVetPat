import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  ViewChildren,
  QueryList,
  ElementRef,
  HostListener
} from '@angular/core';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { CommonModule } from '@angular/common';
import { SpcdbCardComponent } from '../spcdb-card/spcdb-card.component';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { ChildPagningTableComponent } from '../../../commons/child-pagning-table/child-pagning-table.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';

@Component({
  selector: 'chem-spcdb',
  standalone: true,
  imports: [ChildPagningTableComponent, CommonModule, SpcdbCardComponent, TruncatePipe],
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
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;

  get pageSize(): number {
    return this._currentChildAPIBody?.length || 25;
  }
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @Input() index: any;
  @Input() tabName?: string;

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
      this.spcdApiBody = JSON.parse(JSON.stringify(value)) || value;
      this.handleFetchFilters();
    }
  }
  resultTabs: any = {};
  spcdApiBody: any;
  spcdFilters: any = {};
  lastClickedFilterKey: string | null = null;
  filterConfigs = [
    {
      key: 'country',
      label: 'All Country',
      dataKey: 'countryFilters',
      filterType: 'country',
      dropdownState: false
    },
  ];
  constructor(
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService,
    public loadingService: LoadingService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }
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
    this._currentChildAPIBody = requestBody;
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

  handleFetchFilters() {
    this.spcdApiBody.filter_enable = true;
    this.mainSearchService.spcdbSearchSpecific(this.spcdApiBody).subscribe({
      next: (res: any) => {
        const countryFilters = res?.data?.country?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        this.spcdFilters = {
          countryFilters: countryFilters,
        };

        this.spcdApiBody.filter_enable = false;
      },
      error: (err) => {
        console.error('Error fetching gppd data filters:', err);
        this.spcdApiBody.filter_enable = false;
      }
    });
  }

  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map(item => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'country': label = 'All Country'; break;
          }
        }
        return { ...item, label };
      }
      return item;
    });
  }

  onFilterButtonClick(filterKey: string) {
    this.lastClickedFilterKey = filterKey;
    this.filterConfigs = this.filterConfigs.map(item => ({
      ...item,
      dropdownState: item.key === filterKey ? !item.dropdownState : false
    }));
  }

  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    this.handleSetLoading.emit(true);
    this.spcdApiBody.filters = this.spcdApiBody.filters || {};

    if (value === '') {
      delete this.spcdApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.spcdApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, name || '');
    }
    this.isFilterApplied = Object.keys(this.spcdApiBody.filters).length > 0;

    // ✅ Close dropdowns
    this.filterConfigs = this.filterConfigs.map(item => ({
      ...item,
      dropdownState: false
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
      ...this.spcdApiBody,
      filters: { ...this.spcdApiBody.filters },
      draw: 1
    };
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.mainSearchService.spcdbSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        const resultData = res?.data;
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
    // Reset filter labels
    this.filterConfigs = this.filterConfigs.map(config => {
      let defaultLabel = '';
      switch (config.key) {
        case 'country': defaultLabel = 'All Country'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });
    // Clear filters
    this.spcdApiBody.filters = {};
    this.isFilterApplied = false;
    const payload = {
      ...this.spcdApiBody,
      filters: {},
      page_no: 1,
      start: 0,
    };
    this.onDataFetchRequest(payload); // This will fetch data and update pagination
    window.scrollTo(0, 0);
  }
}