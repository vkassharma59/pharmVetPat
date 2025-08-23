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
  activePatentApiBody: any;
  activePatentFilters: any = {};
  lastClickedFilterKey: string | null = null;

  searchByTable: boolean = false;
  isFilterApplied: boolean = false;
  count: number = 0;
  totalPages: number = 0;
  filterLoading: { [key: string]: boolean } = {};

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
    if (value) {
      this.activePatentApiBody = JSON.parse(JSON.stringify(value)) || value;
      this.handleFetchFilters();
    }
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

  /** Common API Request */
  onDataFetchRequest(payload: any) {
    console.log('[onDataFetchRequest] Requesting data with payload:', payload);
  
    this.isFilterApplied = !!(payload?.filters && Object.keys(payload.filters).length);
  
    const requestBody = {
      ...this._currentChildAPIBody,
      ...payload
    };
    this._currentChildAPIBody = requestBody;
  
    this.handleSetLoading.emit(true);
  
    this.mainSearchService.activePatentSearchSpecific(requestBody).subscribe({
      next: (result: any) => {
        console.log('[onDataFetchRequest] API response:', result);
  
        const resultData = result?.data || {};
        this._data.rows = resultData?.data || [];
        this.count = resultData?.recordsFiltered ?? resultData?.recordsTotal ?? 0;
        this.totalPages = this.count ? Math.ceil(this.count / this.pageSize) : 0;
        this._currentChildAPIBody.count = this.count;
        this.searchByTable = true;
  
        this.handleResultTabData.emit(this._data.rows);
        this.handleSetLoading.emit(false);
  
        console.log('[onDataFetchRequest] Data rows:', this._data.rows);
        console.log('[onDataFetchRequest] Total records:', this.count);
      },
      error: (err) => {
        console.error('[onDataFetchRequest] API Error:', err);
        this.handleSetLoading.emit(false);
      }
    });
  }

  /** Filter Configs */
  filterConfigs = [
    {
      key: 'patent_type',
      label: 'Patent Type',
      dataKey: 'patentFilters',
      filterType: 'patent_type',
      dropdownState: false
    }
  ];

  quickFilterButtons = [
    { label: 'BIOTECH', value: 'biotech' },
    { label: 'COMBINATION PATENT', value: 'combination' },
    { label: 'MOU PATENT', value: 'mou' },
    { label: 'PROCESS PATENT', value: 'process' },
    { label: 'DEVICE PATENT', value: 'device' },
    { label: 'FORMULATION PATENT', value: 'formulation' },
    { label: 'DISCOVERY ACTIVE INGREDIENTS', value: 'discovery active ingredients' },
    { label: 'POLYMORPH PATENT', value: 'polymorph' },
    { label: 'PLANT VARIETY', value: 'plant variety' },
    { label: 'PARTICAL SIZE', value: 'partical size' },
    { label: 'HYDRATE', value: 'hydrate' }
  ];  

  /** Dropdown outside click close */
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

  /** Update filter label */
  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'patent_type': label = 'Patent Type'; break;
          }
        }
        return { ...item, label: label };
      }
      return item;
    });
  }

  /** Open dropdown */
  onFilterButtonClick(filterKey: string) {
    this.lastClickedFilterKey = filterKey;
    this.filterConfigs = this.filterConfigs.map((item) => ({
      ...item,
      dropdownState: item.key === filterKey ? !item.dropdownState : false
    }));
  }

  /** Fetch available filters */
  handleFetchFilters() {
    this.filterLoading['patentFilters'] = true;
    this.activePatentApiBody.filter_enable = true;

    this.mainSearchService.activePatentSearchSpecific(this.activePatentApiBody).subscribe({
      next: (res: any) => {
        const resultData = res?.data || {};
        const order = ['Latest First', 'Oldest First'];
        const patentFilters = resultData?.patent_type?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];

        this.activePatentFilters = { order, patentFilters };
        this.activePatentApiBody.filter_enable = false;
        this.filterLoading['patentFilters'] = false;
      },
      error: (err) => {
        console.error('[handleFetchFilters] API call failed:', err);
        this.activePatentApiBody.filter_enable = false;
        this.filterLoading['patentFilters'] = false;
      }
    });
  }

  /** Apply dropdown filter */
  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    console.log('[handleSelectFilter] Filter Key:', filterKey);
    console.log('[handleSelectFilter] Selected Value:', value);
    console.log('[handleSelectFilter] Selected Label:', name);
  
    this.activePatentApiBody.filters = this.activePatentApiBody.filters || {};
  
    if (value === '') {
      delete this.activePatentApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.activePatentApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, name || '');
    }
  
    console.log('[handleSelectFilter] Updated Filters:', this.activePatentApiBody.filters);
  
    this.isFilterApplied = Object.keys(this.activePatentApiBody.filters).length > 0;
  
    // Close dropdown
    this.filterConfigs = this.filterConfigs.map((item) => ({
      ...item,
      dropdownState: item.key === filterKey ? false : item.dropdownState
    }));
  
    const payload = {
      ...this.activePatentApiBody,
      filters: { ...this.activePatentApiBody.filters },
      page_no: 1,
      start: 0,
      draw: 1
    };
  
    console.log('[handleSelectFilter] Payload to API:', payload);
  
    this.onDataFetchRequest(payload);
  }
  

  /** Clear filters */
  clear() {
    this.filterConfigs = this.filterConfigs.map(config => {
      let defaultLabel = '';
      switch (config.key) {
        case 'patent_type': defaultLabel = 'Patent Type'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.activePatentApiBody.filters = {};
    this.isFilterApplied = false;

    const payload = {
      ...this.activePatentApiBody,
      filters: {},
      page_no: 1,
      start: 0
    };
    this.onDataFetchRequest(payload);
    window.scrollTo(0, 0);
  }

  /** Apply Quick filter button */
  applyQuickFilter(value: string) {
    console.log('[applyQuickFilter] Button clicked:', value);
    this.activePatentApiBody.filter_enable = true;
    this.activePatentApiBody.filters = { patent_type: value };
    console.log('[applyQuickFilter] Updated filters:', this.activePatentApiBody.filters);
  
    const payload = {
      ...this.activePatentApiBody,
      filters: { ...this.activePatentApiBody.filters },
      page_no: 1,
      start: 0
    };
  
    console.log('[applyQuickFilter] Payload to API:', payload);
  
    this.onDataFetchRequest(payload);
  }
}
