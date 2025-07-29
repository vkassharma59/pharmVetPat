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
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { ChildPagningTableComponent } from '../../../commons/child-pagning-table/child-pagning-table.component';
import { GppdDbCardComponent } from '../gppd-db-card/gppd-db-card.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { TruncatePipe } from '../../../pipes/truncate.pipe';

@Component({
  selector: 'app-gppd-db',
  standalone: true,
  imports: [ChildPagningTableComponent, CommonModule, GppdDbCardComponent, TruncatePipe],
  templateUrl: './gppd-db.component.html',
  styleUrl: './gppd-db.component.css'
})
export class GppdDbComponent implements OnChanges {
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
  _data: any = { columns: [], rows: [] };
  _currentChildAPIBody: any = { page: 1, pageSize: 25, filters: {} };
  searchByTable: boolean = false;
  isFilterApplied: boolean = false;
  count: number = 0;
  totalPages: number = 0;

  get pageSize(): number {
    return this._currentChildAPIBody?.pageSize || 25;
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
    this._currentChildAPIBody = value || { page: 1, pageSize: 25, filters: {} };
    if (value) {
      this.gppdApiBody = JSON.parse(JSON.stringify(value)) || value;
      this.handleFetchFilters();
    }
  }
  @Input() index: any;
  @Input() tabName?: string;
  resultTabs: any = {};
  gppdApiBody: any;
  gppdFilters: any = {};
  lastClickedFilterKey: string | null = null;


  filterConfigs = [
    {
      key: 'country',
      label: 'All Country',
      dataKey: 'countryFilters',
      filterType: 'country',
      dropdownState: false
    },
    {
      key: 'company',
      label: 'All company',
      dataKey: 'companyFilters',
      filterType: 'company',
      dropdownState: false
    }
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

  // ngOnInit(): void {
  //   this.gppdApiBody = { ...this._currentChildAPIBody };
  //   this.gppdApiBody.filters = this.gppdApiBody.filters || {};
  //   this.handleFetchFilters();
  // }

  ngOnChanges() {
    console.log('scientificDocs received data:', this._data);
    this.handleResultTabData.emit(this._data);
  }

  onDataFetchRequest(payload: any) {
    this.isFilterApplied = !!(payload?.search || payload?.columns);

    if (!('columns' in payload)) delete this._currentChildAPIBody.columns;
    if (!('search' in payload)) delete this._currentChildAPIBody.search;

    const requestBody = {
      ...this._currentChildAPIBody,
      ...payload
    };

    this._currentChildAPIBody = requestBody;
    this.handleSetLoading.emit(true);
    console.log("final API body", requestBody);
    this.mainSearchService.gppdDbSearchSpecific(requestBody).subscribe({
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
    this.gppdApiBody.filter_enable = true;

    this.mainSearchService.gppdDbSearchSpecific(this.gppdApiBody).subscribe({
      next: (res: any) => {
        
        const countryFilters = res?.data?.country?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const companyFilters = res?.data?.company?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];

        this.gppdFilters = {
          countryFilters: countryFilters,
          companyFilters: companyFilters
        };

        this.gppdApiBody.filter_enable = false;
      },
      error: (err) => {
        console.error('Error fetching gppd data filters:', err);
        this.gppdApiBody.filter_enable = false;
      }
    });
  }

  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map(item => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'company': label = 'All Company'; break;
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
    this.gppdApiBody.filters = this.gppdApiBody.filters || {};

    if (value === '') {
      delete this.gppdApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.gppdApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, name || '');
    }

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
      ...this.gppdApiBody,
      filters: { ...this.gppdApiBody.filters },
      //  columns: updatedColumns,
      draw: 1
    };

    console.log("final API body----------------", this._currentChildAPIBody);

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.gppdDbSearchSpecific(this._currentChildAPIBody).subscribe({
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
  // clear() {
  //   // Reset filter labels
  //   this.filterConfigs = this.filterConfigs.map(config => {
  //     let defaultLabel = '';
  //     switch (config.key) {
  //       case 'company': defaultLabel = 'All Company'; break;
  //       case 'country': defaultLabel = 'All Country'; break;
  //     }
  //     return { ...config, label: defaultLabel, dropdownState: false };
  //   });

  //   // Clear filters
  //   this.gppdApiBody.filters = {};

  //   // Reset page number and start
  //   this._currentChildAPIBody = {
  //     ...this.gppdApiBody,
  //     filters: {},
  //     page_no: 1,
  //     start: 0
  //   };
  //   console.log("final API body", this._currentChildAPIBody);
  //   this.handleSetLoading.emit(true);
  //   this.mainSearchService.gppdDbSearchSpecific(this._currentChildAPIBody).subscribe({

  //     next: (res) => {
  //       this._currentChildAPIBody.count = res?.data?.recordsTotal;
  //       this._data.rows = res?.data?.data || [];
  //       // const resultData = res?.data.data;
  //       // this._data = {
  //       //   columns: resultData?.columns ,   // <-- Ensure this is set
  //       //   rows: resultData?.data 
  //       // };
  //       this.count = this._currentChildAPIBody.count;
  //       this.totalPages = Math.ceil(this.count / this.pageSize); // Recalculate pagination
  //       this.searchByTable = true;
  //       this.handleResultTabData.emit(this._data.rows);
  //       this.handleSetLoading.emit(false);
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       this._currentChildAPIBody.filter_enable = false;
  //       this.handleSetLoading.emit(false);
  //     }
  //   });

  //   window.scrollTo(0, 0);
  // }
  clear() {
    // Reset filter labels
    this.filterConfigs = this.filterConfigs.map(config => {
      let defaultLabel = '';
      switch (config.key) {
        case 'company': defaultLabel = 'All Company'; break;
        case 'country': defaultLabel = 'All Country'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

   // Clear filters
    this.gppdApiBody.filters = {};

    const payload = {
      ...this.gppdApiBody,
      filters: {},
      page_no: 1,
      start: 0,
    };

    console.log("final API body from clear:", payload);

    this.onDataFetchRequest(payload); // This will fetch data and update pagination
    window.scrollTo(0, 0);
  }


}