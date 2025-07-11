import { Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { LoadingService } from '../services/loading-service/loading.service';
import { MainSearchService } from '../services/main-search/main-search.service';
import { Auth_operations } from '../Utils/SetToken';
import { TruncatePipe } from '../pipes/truncate.pipe';
import { CommonModule } from '@angular/common';
import { DmfCardComponent } from '../dmf-card/dmf-card.component';
import { UtilityService } from '../services/utility-service/utility.service';
@Component({
  selector: 'app-dmf',
  standalone: true,
  imports: [CommonModule,TruncatePipe,DmfCardComponent],
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
  usApiBody: any;
  usFilters: any = {};
  lastClickedFilterKey: string | null = null;

  filterConfigs = [
    {
      key: 'rld',
      label: 'Select RLD',
      dataKey: 'rldFilters',
      filterType: 'rld',
      dropdownState: false
    },
    {
      key: 'appl_type',
      label: 'Select Appl Type',
      dataKey: 'applFilters',
      filterType: 'appl_type',
      dropdownState: false
    },
    {
      key: 'applicant',
      label: 'Select Applicant',
      dataKey: 'applicantFilters',
      filterType: 'applicant',
      dropdownState: false
    },
    {
      key: 'strength',
      label: 'Select Strength',
      dataKey: 'strengthFilters',
      filterType: 'strength',
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
    
    this.usApiBody.filter_enable = true;

    this.mainSearchService.dmfSearchSpecific(this.usApiBody).subscribe({
      next: (res: any) => {
        const hcData = res?.data?.orange_book_us_data || [];
       
        const getUnique = (arr: any[]) => [...new Set(arr.filter(Boolean))];

        const applFilters = getUnique(hcData.map(item => item.appl_type));
        const flattenedProductData = hcData.flatMap(item => item.productData || []);
        const strengthFilters = getUnique(flattenedProductData.map(item => item.strength));
        const rldFilters = getUnique(flattenedProductData.map(item => item.rld));
        const applicantFilters = getUnique(flattenedProductData.map(item => item.applicant));

        this.usFilters = {
          applFilters,
          strengthFilters,
          rldFilters: rldFilters.map(name => ({ name, value: name })),
          ApplicantFilters: applicantFilters
        };

       

        this.usApiBody.filter_enable = false;
      },
      error: (err) => {
        console.error("❌ Error while fetching filters:", err);
        this.usApiBody.filter_enable = false;
      }
    });
  }
  

  ngOnInit(): void {
    this.usApiBody = { ...this.currentChildAPIBody };
    this.usApiBody.filters = this.usApiBody.filters || {};
    this.handleFetchFilters();
  }


  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'appl_type': label = 'Application Type'; break;
            case 'rld': label = 'Select RLD'; break;
            case 'applicant': label = 'Applicant Filters'; break;
            case 'strength': label = 'Strengths'; break;
          }
        }
        return { ...item, label: label };
      }
      return item;
    });
  }

  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    
    this.handleSetLoading.emit(true);
    this.usApiBody.filters = this.usApiBody.filters || {};

    if (value === '') {
      delete this.usApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
      
    } else {
      this.usApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, name || '');
     
    }

    this._currentChildAPIBody = {
      ...this.usApiBody,
      filters: { ...this.usApiBody.filters }
    };

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.dmfSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        let resultData = res?.data || {};
        const sortValue = this.usApiBody.filters['order_by'];
        resultData.orange_book_us_data = this.sortPatentData(resultData.orange_book_us_data, sortValue);

        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: resultData?.orange_book_us_count
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
        case 'appl_type': defaultLabel = 'Application Type'; break;
        case 'rld': defaultLabel = 'Select RLD'; break;
        case 'applicant': defaultLabel = 'Applicant Filters'; break;
        case 'strength': defaultLabel = 'Strengths'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.usApiBody.filters = {};
    this._currentChildAPIBody = {
      ...this.usApiBody,
      filters: {}
    };

    this.handleSetLoading.emit(true);
    this.mainSearchService.dmfSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
       
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.orange_book_us_count
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