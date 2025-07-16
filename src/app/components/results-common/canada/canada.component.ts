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
    this.canadaPatentApiBody.filter_enable = true;
    
  
    this.mainSearchService.canadaApprovalSearchSpecific(this.canadaPatentApiBody).subscribe({
      next: (res: any) => {
        const hcData = res?.data?.health_canada_data || [];
  
        const getUnique = (arr: any[]) => [...new Set(arr.filter(Boolean))];
  
        const productFilters = getUnique(hcData.map(item => item.product_name));
        const strengthFilters = getUnique(hcData.map(item => item.strength));
        const companyFiltersRaw = getUnique(hcData.map(item => item.company));
        const dosageFilters = getUnique(hcData.map(item => item.dosage_forms));
       
  
        this.canadaPatentFilters = {
          productFilters,
          strengthFilters,
          CompanyFilters: companyFiltersRaw.map(name => ({ name, value: name })),
          DosageFilters: dosageFilters
        };
  
        this.canadaPatentApiBody.filter_enable = false;
        
        
      },
      error: (err) => {
        console.error('Error fetching Health Canada filters:', err);
        this.canadaPatentApiBody.filter_enable = false;

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
