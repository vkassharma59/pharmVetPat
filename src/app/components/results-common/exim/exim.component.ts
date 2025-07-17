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
import { SpcdbCardComponent } from '../spcdb-card/spcdb-card.component';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { ChildPagningTableComponent } from '../../../commons/child-pagning-table/child-pagning-table.component';
import { EximCardComponent } from '../exim-card/exim-card.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';

@Component({
  selector: 'chem-exim',
  standalone: true,
  imports: [ChildPagningTableComponent, CommonModule, EximCardComponent, TruncatePipe],
  templateUrl: './exim.component.html',
  styleUrl: './exim.component.css',
})
export class EximComponent implements OnChanges {
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;

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
    console.log("hdhdhdhhdhhd", this._data);
  }

  get data() {
    console.log("hdhdhdhhdhhd------", this._data);
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
  constructor(private utilityService: UtilityService,
    private mainSearchService: MainSearchService,
    public loadingService: LoadingService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }
  eximApiBody: any;
  eximFilters: any = {};
  lastClickedFilterKey: string | null = null;

  filterConfigs = [
    {
      key: 'CHAPTER',
      label: 'All Chapter',
      dataKey: 'chapterFilters',
      filterType: 'CHAPTER',
      dropdownState: false
    },
    {
      key: 'TYPE',
      label: 'All Type',
      dataKey: 'typeFilters',
      filterType: 'TYPE',
      dropdownState: false
    },
    {
      key: 'order_by',
      label: 'Order By',
      dataKey: 'orderByFilters',
      filterType: 'order_by',
      dropdownState: false
    },
    {
      key: 'yearmonth',
      label: 'All Year-Month',
      dataKey: 'yearmonthFilters',
      filterType: 'yearmonth',
      dropdownState: false
    },
    {
      key: 'exporter_name',
      label: 'All Exporter',
      dataKey: 'exporterFilters',
      filterType: 'exporter_name',
      dropdownState: false
    },
    {
      key: 'importer_name',
      label: 'All Importer',
      dataKey: 'ImporterFilters',
      filterType: 'importer_name',
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

    this.mainSearchService.EximDataSearchSpecific(requestBody).subscribe({
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

  ngOnInit(): void {
    this.eximApiBody = { ...this.currentChildAPIBody };
    this.eximApiBody.filters = this.eximApiBody.filters || {};

    console.log('[ngOnInit] Initial eximApiBody:', JSON.stringify(this.eximApiBody, null, 2));

    this.handleFetchFilters();
  }


  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'CHAPTER': label = 'All Chapter'; break;
            case 'TYPE': label = 'All Type'; break;
            case 'yearmonth': label = 'All Year-Month'; break;
            case 'exporter_name': label = 'All Exporter'; break;
            case 'importer_name': label = 'All Importer'; break;
            case 'order_by': label = 'Order By'; break;
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
    this.eximApiBody.filter_enable = true;


    this.mainSearchService.EximDataSearchSpecific(this.eximApiBody).subscribe({
      next: (res: any) => {
        const hcData = res?.data?.data || [];

        const getUnique = (arr: any[]) => [...new Set(arr.filter(v => !!v && typeof v === 'string' && v.trim().length > 0))];

        const chapterFilters = hcData.map(item => item?.CHAPTER);
        const typeFilters = getUnique(hcData.map(item => item?.TYPE));
        const yearmonthFilters = getUnique(hcData.map(item => item?.yearmonth));
        const exporterFilters = getUnique(hcData.map(item => item?.exporter_name));
        const ImporterFilters = getUnique(hcData.map(item => item?.importer_name));
        const orderFilters = ['Latest First', 'Oldest First'];

        console.log('All CHAPTER values:', hcData.map(item => item?.CHAPTER));

        this.eximFilters = {
          chapterFilters: chapterFilters.map(value => ({ name: value, value })),
          typeFilters: typeFilters.map(value => ({ name: value, value })),
          orderByFilters: orderFilters.map(value => ({ name: value, value })),
          yearmonthFilters: yearmonthFilters.map(value => ({ name: value, value })),
          exporterFilters: exporterFilters.map(value => ({ name: value, value })),
          ImporterFilters: ImporterFilters.map(value => ({ name: value, value }))
        };

        this.eximApiBody.filter_enable = false;


      },
      error: (err) => {
        console.error('Error fetching exim data filters:', err);
        this.eximApiBody.filter_enable = false;

      }
    });
  }


  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    this.handleSetLoading.emit(true);
    this.eximApiBody.filters = this.eximApiBody.filters || {};

    if (value === '') {
      delete this.eximApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.eximApiBody.filters[filterKey] = value;
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
    if (filterKey === 'order') {
      const orderDataKey = value.split('_')[0];
      const dir = value.endsWith('desc') ? 'desc' : 'asc';

      const orderColumnIndex = updatedColumns.findIndex(col => col.data === orderDataKey);

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
        ...this.eximApiBody,
        filters: { ...this.eximApiBody.filters },
        columns: updatedColumns,
        order: [
          {
            column: 0,  // numeric index of the column you want to sort
            dir: 'asc'                 // or 'desc'
          }
        ],
        draw: 1
      };
    }
    console.log('All CHAPTER values:', this._currentChildAPIBody);

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.EximDataSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        let resultData = res?.data || {};
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
        case 'CHAPTER': defaultLabel = 'All Chapter'; break;
        case 'TYPE': defaultLabel = 'All Type'; break;
        case 'yearmonth': defaultLabel = 'All Year-Month'; break;
        case 'exporter_name': defaultLabel = 'All Exporter'; break;
        case 'importer_name': defaultLabel = 'All Importer'; break;
        case 'order': defaultLabel = 'Sort By'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.eximApiBody.filters = {};
    this._currentChildAPIBody = {
      ...this.eximApiBody,
      filters: {}
    };

    this.handleSetLoading.emit(true);
    this.mainSearchService.EximDataSearchSpecific(this._currentChildAPIBody).subscribe({
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