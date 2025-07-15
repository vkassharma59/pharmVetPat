import { Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { LoadingService } from '../services/loading-service/loading.service';
import { MainSearchService } from '../services/main-search/main-search.service';
import { Auth_operations } from '../Utils/SetToken';
import { TruncatePipe } from '../pipes/truncate.pipe';
import { CommonModule } from '@angular/common';
import { DmfCardComponent } from '../dmf-card/dmf-card.component';
import { UtilityService } from '../services/utility-service/utility.service';
import { ChildPagingComponent } from '../commons/child-paging/child-paging.component';
@Component({
  selector: 'app-dmf',
  standalone: true,
  imports: [CommonModule,TruncatePipe,DmfCardComponent,ChildPagingComponent],
  templateUrl: './dmf.component.html',
  styleUrl: './dmf.component.css'
})
export class DmfComponent {
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  _currentChildAPIBody: any;
  searchThrough: string = '';
  resultTabs: any = {};
  _data: any = [];
  @Input()
  get data() {
    
    return this._data;
  }
  set data(name: any) {
   
    this._data = name;
    this.handleResultTabData.emit(this._data);
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
  dmfApiBody: any;
  dmfFilters: any = {};
  lastClickedFilterKey: string | null = null;

  filterConfigs = [
    {
      key: 'country_dmf_holder',
      label: 'Select Country',
      dataKey: 'CountryFilters',
      filterType: 'country_dmf_holder',
      dropdownState: false
    },
    {
      key: 'dmf_status',
      label: 'Select DMF',
      dataKey: 'dmfFilters',
      filterType: 'dmf_status',
      dropdownState: false
    },
    {
      key: 'tech',
      label: 'Select TECH/API & FORMULATION',
      dataKey: 'techFilters',
      filterType: 'tech',
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

  constructor(
    private utilityService: UtilityService,
    public loadingService: LoadingService,
    private mainSearchService: MainSearchService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }
  patentColumns: any[] = []; // Column list from currentChildAPIBody
  patentData: any[] = [];    // Data from @Input() data

  ngOnChanges() {
    
    if (this._data && !Array.isArray(this._data)) {
      this.patentData = [this._data];
     
    } else if (Array.isArray(this._data)) {
      this.patentData = this._data;
      
    } else {
      console.warn("⚠️ No valid _data received");
    }

    if (this.currentChildAPIBody?.columnList?.patentColumnList?.length) {
      this.patentColumns = this.currentChildAPIBody.columnList.patentColumnList;
     
    } else {
      console.warn("⚠️ No column list found in currentChildAPIBody");
    }
  }

  onFilterButtonClick(filterKey: string) {
  
    this.lastClickedFilterKey = filterKey;
    this.filterConfigs = this.filterConfigs.map((item) => ({
      ...item,
      dropdownState: item.key === filterKey ? !item.dropdownState : false
    }));
  }

handleFetchFilters() {
  console.log("🔄 Fetching filter data...");
  this.dmfApiBody.filter_enable = true;

  this.mainSearchService.dmfSearchSpecific(this.dmfApiBody).subscribe({
    next: (res: any) => {
      console.log("✅ API response received:", res);

      const rawData = res?.data || {};
      const techData = rawData.tech_supplier_data || [];
      const rawCountry = rawData.country || [];

      console.log("📦 Extracted tech_supplier_data:", techData);
      console.log("🌐 Raw Country:", rawCountry);

      const getUnique = (arr: any[]) =>
        [...new Set(arr.filter(val => typeof val === 'string' && val.trim() && val !== 'undefined'))];

      const CountryFilters = ['View All', ...getUnique(
        rawCountry.map(item => item?.value)
      )];

      const dmfFilters = getUnique(techData.map(item => item?.dmf_status));
      const techFilters = getUnique(techData.map(item => item?.tech));

      console.log("🌍 Country Filters:", CountryFilters);
      console.log("📄 DMF Status Filters:", dmfFilters);
      console.log("🧪 Tech/API Filters:", techFilters);

      this.dmfFilters = {
        CountryFilters,
        dmfFilters,
        techFilters
      };

      this.dmfApiBody.filter_enable = false;
      console.log("✅ Filters populated successfully.");
    },
    error: (err) => {
      console.error("❌ Error while fetching filters:", err);
      this.dmfApiBody.filter_enable = false;
    }
  });
}

  ngOnInit(): void {
    this.dmfApiBody = { ...this.currentChildAPIBody };
    this.dmfApiBody.filters = this.dmfApiBody.filters || {};
    this.handleFetchFilters();
  }


  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'country_dmf_holder': label = 'Country'; break;
            case 'dmf_status': label = 'Select DMF'; break;
            case 'tech': label = 'tech Filters'; break;
          }
        }
        return { ...item, label: label };
      }
      return item;
    });
  }

  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    
    this.handleSetLoading.emit(true);
    this.dmfApiBody.filters = this.dmfApiBody.filters || {};

    if (value === '') {
      delete this.dmfApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
      
    } else {
      this.dmfApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, name || '');
     
    }

    this._currentChildAPIBody = {
      ...this.dmfApiBody,
      filters: { ...this.dmfApiBody.filters }
    };

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.dmfSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        let resultData = res?.data || {};
        const sortValue = this.dmfApiBody.filters['order_by'];
        resultData.tech_supplier_data = this.sortPatentData(resultData.tech_supplier_data, sortValue);

        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: resultData?.tech_supplier_count
        };

       
        this.handleResultTabData.emit(resultData);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: () => {
        console.error("❌ Error while filtering data");
        this._currentChildAPIBody.filter_enable = false;
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      }
    });
  }
  sortPatentData(data: any[], order: string): any[] {
   
    if (!Array.isArray(data)) return [];

    if (order === 'Newest') {
      return data.sort((a, b) =>
        new Date(b.APPLICATION_DATE).getTime() - new Date(a.APPLICATION_DATE).getTime()
      );
    } else if (order === 'Oldest') {
      return data.sort((a, b) =>
        new Date(a.APPLICATION_DATE).getTime() - new Date(b.APPLICATION_DATE).getTime()
      );
    }

    return data;
  }

  clear() {
  

    this.filterConfigs = this.filterConfigs.map(config => {
      let defaultLabel = '';
      switch (config.key) {
        case 'country_dmf_holder': defaultLabel = 'Country'; break;
        case 'dmf_status': defaultLabel = 'Select DMF'; break;
        case 'tech': defaultLabel = 'tech Filters'; break
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
        this.handleResultTabData.emit(res.data);
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