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
  filterOrSearchSource: 'filter' | 'search' | null = null;
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
    if (value) {
      this.eximApiBody = JSON.parse(JSON.stringify(value)) || value;
      this.handleFetchFilters();
    }
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
    // {
    //   key: 'order_by',
    //   label: 'Order By',
    //   dataKey: 'orderByFilters',
    //   filterType: 'order_by',
    //   dropdownState: false
    // },
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
    console.log("🔹 [onDataFetchRequest] Incoming payload:", payload);
  
    // ✅ Check if filter/search applied
    this.isFilterApplied = !!(payload?.search || payload?.columns);
    console.log("✅ isFilterApplied:", this.isFilterApplied);
  
    // ✅ Remove empty fields from current API body
    if (!('columns' in payload)) {
      console.log("🗑️ Removing columns from _currentChildAPIBody");
      delete this._currentChildAPIBody.columns;
    }
    if (!('search' in payload)) {
      console.log("🗑️ Removing search from _currentChildAPIBody");
      delete this._currentChildAPIBody.search;
    }
  
    // ✅ Prepare final request body
    const requestBody = {
      ...this._currentChildAPIBody,
      ...payload
    };
    console.log("📦 Final Request Body sent to API:", requestBody);
  
    // ✅ Save back to current API body
    this._currentChildAPIBody = requestBody;
  
    // ✅ Emit loading true
    this.handleSetLoading.emit(true);
    console.log("⏳ API Call started...");
  
    // ✅ API Call
    this.mainSearchService.EximDataSearchSpecific(requestBody).subscribe({
      next: (result: any) => {
        console.log("✅ API Response received:", result);
  
        // ✅ Extract rows and counts
        this._data.rows = result?.data?.data || [];
        this.count = result?.data?.recordsFiltered ?? result?.data?.recordsTotal;
        this.totalPages = Math.ceil(this.count / this.pageSize);
        this._currentChildAPIBody.count = this.count;
        this.searchByTable = true;
  
        console.log("📊 Rows received:", this._data.rows.length);
        console.log("📊 Total Count:", this.count);
        console.log("📊 Total Pages:", this.totalPages);
  
        // ✅ Emit result
        this.handleResultTabData.emit(this._data.rows);
        this.handleSetLoading.emit(false);
        console.log("📤 Data emitted to parent");
      },
      error: (err) => {
        console.error("❌ API Error:", err);
        this.handleSetLoading.emit(false);
      },
      complete: () => {
        console.log("✅ API Call completed");
        this.handleSetLoading.emit(false);
      }
    });
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

        const chapterFilters = res?.data?.CHAPTER?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];

        const typeFilters = res?.data?.TYPE?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];

        const yearmonthFilters =
          res?.data?.yearmonth?.map(item => ({
            name: item.name,
            value: item.value
          })) || [];
        const exporterFilters = res?.data?.exporter_name?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];

        const ImporterFilters = res?.data?.importer_name?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const orderFilters = ['Latest First', 'Oldest First'];


        this.eximFilters = {
          chapterFilters: chapterFilters,
          typeFilters: typeFilters,
          orderByFilters: orderFilters,
          yearmonthFilters: yearmonthFilters,
          exporterFilters: exporterFilters,
          ImporterFilters: ImporterFilters,
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
    this.filterOrSearchSource = 'filter';
    this.handleSetLoading.emit(true);
    this.eximApiBody.filters = this.eximApiBody.filters || {};

    // ✅ Update filters
    if (value === '') {
      console.log(`🧹 Clearing filter for key: ${filterKey}`);
      delete this.eximApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      console.log(`✅ Applying filter - ${filterKey}:`, value);
      this.eximApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, name || '');
    }
    this.isFilterApplied = Object.keys(this.eximApiBody.filters).length > 0;

    // ✅ Close all dropdowns
    this.filterConfigs = this.filterConfigs.map(item => ({
      ...item,
      dropdownState: false
    }));

    // ✅ Maintain updated columns (no duplicates)
    const existingColumns = this._currentChildAPIBody?.columns || [];
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

    console.log('🧾 Updated Columns:', updatedColumns);

    // ✅ Optional: Sorting (only if filterKey is 'order')
    let order: any[] = [];
    if (filterKey === 'order') {
      const orderDataKey = value.split('_')[0];
      const dir = value.endsWith('desc') ? 'desc' : 'asc';
      order = [
        {
          column: 0, // Make dynamic if needed
          dir: dir
        }
      ];
      console.log('🔃 Order applied:', order);
    }

    // ✅ Prepare updated API body
    this._currentChildAPIBody = {
      ...this.eximApiBody,
      filters: { ...this.eximApiBody.filters },
      // columns: updatedColumns,
      order: order,
      draw: 1
    };

    console.log('📦 Final API Body:', this._currentChildAPIBody);

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // ✅ Make API call
    this.mainSearchService.EximDataSearchSpecific(this._currentChildAPIBody).subscribe({
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
      error: (err) => {
        console.error('❌ API Error:', err);
        this._currentChildAPIBody.filter_enable = false;
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      }
    });
  }

  clear() {
    this.filterConfigs = this.filterConfigs.map(config => {
      this.filterOrSearchSource = null;
      let defaultLabel = '';
      switch (config.key) {
        case 'CHAPTER': defaultLabel = 'All Chapter'; break;
        case 'TYPE': defaultLabel = 'All Type'; break;
        case 'yearmonth': defaultLabel = 'All Year-Month'; break;
        case 'exporter_name': defaultLabel = 'All Exporter'; break;
        case 'importer_name': defaultLabel = 'All Importer'; break;
        // case 'order_by': defaultLabel = 'Order  By'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.eximApiBody.filters = {};
    const payload = {
      ...this.eximApiBody,
      filters: {}
    };
    this.onDataFetchRequest(payload); // This will fetch data and update pagination

    // this.handleSetLoading.emit(true);
    // this.mainSearchService.EximDataSearchSpecific(this._currentChildAPIBody).subscribe({
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

    window.scrollTo(0, 0);
  }

}