import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { TruncatePipe } from '../../../pipes/truncate.pipe';
import { CommonModule } from '@angular/common';
import { DmfCardComponent } from '../dmf-card/dmf-card.component';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { Component, EventEmitter, Input, Output, ElementRef, ViewChild, HostListener, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core'
@Component({
  selector: 'app-dmf',
  standalone: true,
  imports: [CommonModule, TruncatePipe, DmfCardComponent, ChildPagingComponent],
  templateUrl: './dmf.component.html',
  styleUrl: './dmf.component.css'
})


export class DmfComponent {
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @ViewChild('dropdownMenu') dropdownMenuRef!: ElementRef;
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
  filterOrSearchSource: 'filter' | 'search' | null = null;
  searchThrough: string = '';
  resultTabs: any = {};
  isOpen: boolean = false;
  _data: any = [];
  _currentChildAPIBody: any = {};
  ImpurityBody: any;
  category_filters: any;
  category_value: any = 'Select Category';
  @Input() tabName?: string;
  @Input() index: any;
  searchByTable: boolean = false;
  dmfApiBody: any;
  dmfFilters: any = {};
  lastClickedFilterKey: string | null = null;
  countryConfigRaw: any[] = [];
  @Input()
  get data() {
    console.log('Getting data in Component:', this._data);
    return this._data;
  }
  set data(value: any) {
    console.log('setting data in ImpurityComponent:', this._data);
    this._data = value;
  }

  @Input()
  get currentChildAPIBody() {

    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    if (value) {
      this.dmfApiBody = JSON.parse(JSON.stringify(this._currentChildAPIBody)) || this._currentChildAPIBody;
      this.handleFetchFilters();
    }
  }

  filterConfigs = [
    {
      key: 'country_dmf_holder',
      label: 'Select Country',
      dataKey: 'countryFilters',
      filterType: 'country_dmf_holder',
      dropdownState: false
    },
    {
      key: 'stock_status',
      label: 'DMF TYPE ',
      dataKey: 'stockstatusFilters',
      filterType: 'stock_status',
      dropdownState: false
    },
    {
      key: 'dmf_holder',
      label: 'DMF Holder',
      dataKey: 'dmfholderFilters',
      filterType: 'dmf_holder',
      dropdownState: false
    }
  ];

  constructor(
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService,
    public loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
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

  onFilterButtonClick(filterKey: string) {
    this.lastClickedFilterKey = filterKey;

    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        return { ...item, dropdownState: !item.dropdownState };
      }
      return { ...item, dropdownState: false };
    });
  }
  // handleFetchFilters() {
  //   this.dmfApiBody.filter_enable = true;
  //   this.mainSearchService.dmfSearchSpecific(this.dmfApiBody).subscribe({
  //     next: (result: any) => {
  //       const countryConfig = result?.data?.country_dmf_holder || [];
  //       this.countryConfigRaw = countryConfig;
  //       const countryFilters = result?.data?.country_dmf_holder?.map(item => ({
  //         name: item.name,
  //         value: item.value
  //       })) || [];
  //       const stockstatusFilters = result?.data?.stock_status?.map(item => ({
  //         name: item.name,
  //         value: item.value
  //       })) || [];
  //       const dmfholderFilters = result?.data?.dmf_holder?.map(item => ({
  //         name: item.name,
  //         value: item.value
  //       })) || [];
  //       this.dmfFilters = {
  //         countryFilters: countryFilters, // ← Fix here
  //         stockstatusFilters: stockstatusFilters,
  //         dmfholderFilters: dmfholderFilters,
  //       };
  //       this.dmfApiBody.filter_enable = false;
  //     },
  //     error: (err) => {
  //       console.error('Error fetching dmf filters:', err);
  //       this.dmfApiBody.filter_enable = false;
  //     }
  //   });
  // }

  handleFetchFilters() {
    this.dmfApiBody.filter_enable = true;
    this.mainSearchService.dmfSearchSpecific(this.dmfApiBody).subscribe({
      next: (result: any) => {
        const countryConfig = result?.data?.country_dmf_holder || [];
        this.countryConfigRaw = countryConfig;
        const countryFilters = result?.data?.country_dmf_holder?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const stockstatusFilters = result?.data?.stock_status?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const dmfholderFilters = result?.data?.dmf_holder?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        this.dmfFilters = {
          countryFilters: countryFilters, // ← Fix here
          stockstatusFilters: stockstatusFilters,
          dmfholderFilters: dmfholderFilters,
        };
        console.log('DMF Filters:', this.dmfFilters);
        this.dmfApiBody.filter_enable = false;
      },
      error: (err) => {
        console.error('Error fetching dmf filters:', err);
        this.dmfApiBody.filter_enable = false;
      }
    });
  }

  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'country_dmf_holder': label = 'Country'; break;
            case 'stock_status': label = 'Select Stock Status'; break;
            case 'dmf_holder': label = 'DMF Holder Filters'; break;
          }
        }
        return { ...item, label: label };
      }
      return item;
    });
  }
  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    this.filterOrSearchSource = 'filter';
    this.handleSetLoading.emit(true);
    // this.dmfApiBody.filters = this.dmfApiBody.filters || {};
    if (value === '') {
      delete this.dmfApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.dmfApiBody.filters[filterKey] = value;  // ✅ Only value goes in filters
      this.setFilterLabel(filterKey, name || '');
    }
    // ✅ Close dropdowns
    this.filterConfigs = this.filterConfigs.map(item => ({
      ...item,
      dropdownState: false
    }));
    // Log constructed filter object

    this._currentChildAPIBody = {
      ...this.dmfApiBody,
      filters: { ...this.dmfApiBody.filters }
    };
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.mainSearchService.dmfSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        const resultData = res?.data || {};
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: resultData?.tech_supplier_count
        };
        this._data = resultData?.tech_supplier_data || [];

        // ✅ Emit updated data to parent (optional)
        this.handleResultTabData.emit(resultData);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: (err) => {
        console.error("❌ Error while filtering data", err);
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          filter_enable: false
        };
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
        case 'country_dmf_holder': defaultLabel = 'Country'; break;
        case 'stock_status': defaultLabel = 'Select Stock Status'; break;
        case 'dmf_holder': defaultLabel = 'DMF Holder Filters'; break;

      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.dmfApiBody.filters = {};
    this._currentChildAPIBody = {
      ...this.dmfApiBody,
      filters: {}
    };

    this.handleSetLoading.emit(true);
    this.mainSearchService.dmfSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {

        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.tech_supplier_count
        };
        this._data = res?.data?.tech_supplier_data || [];

        this.handleResultTabData.emit(res?.data);
        this.handleSetLoading.emit(false);
      },
      error: (err) => {
        console.error("❌ Error while refetching after clear:", err);
        this._currentChildAPIBody.filter_enable = false;
        this.handleSetLoading.emit(false);
      }
    });

  window.scrollTo(0, 0);
  }
  onChildPagingDataUpdate(eventData: any) {
    this._data = eventData?.tech_supplier_data || [];

    this._currentChildAPIBody = {
      ...this._currentChildAPIBody,
      count: eventData?.tech_supplier_count
    };

    this.cdr.detectChanges(); // Optional — use only if UI isn't updating as expected
    this.handleResultTabData.emit(eventData); // Optional — needed if parent needs it
  }
  copyText(elementId: string, event: Event) {
    const el = event.currentTarget as HTMLElement;
    const textToCopy = document.getElementById(elementId)?.innerText;

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        if (el.classList.contains('fa-copy')) {
          el.classList.remove('fa-copy');
          el.classList.add('fa-check');
          setTimeout(() => {
            el.classList.remove('fa-check');
            el.classList.add('fa-copy');
          }, 1500);
        }
      }).catch(err => {
        console.error('[copyText] ❌ Failed to copy text:', err);
      });
    }
  }
}














