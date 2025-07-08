import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChildren,
  QueryList,
  ElementRef,
  OnInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanadaHealthComponent } from '../canada-health/canada-health.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';

@Component({
  selector: 'chem-canada',
  standalone: true,
  imports: [CommonModule, CanadaHealthComponent, ChildPagingComponent, TruncatePipe],
  templateUrl: './canada.component.html',
  styleUrl: './canada.component.css'
})
export class CanadaComponent implements OnInit {
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();

  @Input() currentChildAPIBody: any;
  @Input() index: any;
  @Input() tabName?: string;

  _data: any = [];
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }

  searchThrough: string = '';
  resultTabs: any = {};

  _currentChildAPIBody: any;
  canadaPatentApiBody: any;
  canadaPatentFilters: any = {};
  lastClickedFilterKey: string | null = null;

  filterConfigs = [
    {
      key: 'product_name',
      label: 'Select Product',
      dataKey: 'productFilters',
      filterType: 'product',
      dropdownState: false
    },
    {
      key: 'company',
      label: 'Company',
      dataKey: 'CompanyFilters',
      filterType: 'company',
      dropdownState: false
    },
    {
      key: 'dosage_forms',
      label: 'Dosage Forms',
      dataKey: 'DosageFilters',
      filterType: 'dosage_forms',
      dropdownState: false
    },
    {
      key: 'strength',
      label: 'Strengths',
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

  ngOnInit(): void {
    this.canadaPatentApiBody = { ...this.currentChildAPIBody };
    this.canadaPatentApiBody.filters = this.canadaPatentApiBody.filters || {};
  
    console.log('[ngOnInit] Initial canadaPatentApiBody:', JSON.stringify(this.canadaPatentApiBody, null, 2));
  
    this.handleFetchFilters();
  }
  

  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'product_name': label = 'Select Product'; break;
            case 'company': label = 'Company'; break;
            case 'dosage_forms': label = 'Dosage Forms'; break;
            case 'strength': label = 'Strengths'; break;
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
    console.log('[handleFetchFilters] Invoked');
  
    this.canadaPatentApiBody.filter_enable = true;
    console.log('[handleFetchFilters] Set filter_enable to true in API body:', JSON.stringify(this.canadaPatentApiBody, null, 2));
  
    this.mainSearchService.canadaApprovalSearchSpecific(this.canadaPatentApiBody).subscribe({
      next: (res) => {
        console.log('[handleFetchFilters] API call success. Raw response:', res);
        console.log('[handleFetchFilters] res.status:', res?.status);
        console.log('[handleFetchFilters] res.message:', res?.message);
        console.log('[handleFetchFilters] res.data keys:', Object.keys(res?.data || {}));
        console.log('[handleFetchFilters] res.data:', JSON.stringify(res?.data, null, 2));
  
        const productFilters = res?.data?.product_name || [];
        const strengthFilters = res?.data?.strength || [];
        const rawCompanyFilters = res?.data?.company || [];
        const dosageFilters = res?.data?.dosage_forms || [];
  
        console.log('[handleFetchFilters] Parsed productFilters:', productFilters);
        console.log('[handleFetchFilters] Parsed strengthFilters:', strengthFilters);
        console.log('[handleFetchFilters] Parsed rawCompanyFilters:', rawCompanyFilters);
        console.log('[handleFetchFilters] Parsed dosageFilters:', dosageFilters);
  
        const formattedCompanyFilters = rawCompanyFilters.map((item: any) => {
          const key = Object.keys(item)[0];
          const count = item[key]?.length || 0;
          const obj = {
            name: `${key} (${count})`,
            value: key
          };
          console.log('[handleFetchFilters] Processed company item:', item, '=>', obj);
          return obj;
        });
        
  
        this.canadaPatentFilters = {
          productFilters,
          strengthFilters,
          CompanyFilters: formattedCompanyFilters,
          DosageFilters: dosageFilters
        };
  
        console.log('[handleFetchFilters] Final canadaPatentFilters object:', this.canadaPatentFilters);
  
        this.canadaPatentApiBody.filter_enable = false;
        console.log('[handleFetchFilters] Reset filter_enable to false');
      },
      error: (err) => {
        console.error('[handleFetchFilters] API call failed:', err);
        this.canadaPatentApiBody.filter_enable = false;
        console.log('[handleFetchFilters] Reset filter_enable to false (on error)');
      }
    });
  }
  
  

  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    this.handleSetLoading.emit(true);
    this.canadaPatentApiBody.filters = this.canadaPatentApiBody.filters || {};

    if (value === '') {
      delete this.canadaPatentApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.canadaPatentApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, name || '');
    }

    this._currentChildAPIBody = {
      ...this.canadaPatentApiBody,
      filters: { ...this.canadaPatentApiBody.filters }
    };

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.canadaApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        let resultData = res?.data || {};
        const sortValue = this.canadaPatentApiBody.filters['order_by'];

        resultData.health_canada_data = this.sortPatentData(resultData.health_canada_data, sortValue);

        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: resultData?.health_canada_count
        };

        this.handleResultTabData.emit(resultData);
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
        case 'product_name': defaultLabel = 'Select Product'; break;
        case 'company': defaultLabel = 'Company'; break;
        case 'dosage_forms': defaultLabel = 'Dosage Forms'; break;
        case 'strength': defaultLabel = 'Strengths'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.canadaPatentApiBody.filters = {};
    this._currentChildAPIBody = {
      ...this.canadaPatentApiBody,
      filters: {}
    };

    this.handleSetLoading.emit(true);
    this.mainSearchService.canadaApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.health_canada_count
        };
        this.handleResultTabData.emit(res.data);
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
