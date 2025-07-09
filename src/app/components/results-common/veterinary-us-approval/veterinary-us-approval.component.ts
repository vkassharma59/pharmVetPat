import { CommonModule } from '@angular/common';
import { Component,EventEmitter, Input, Output } from '@angular/core';
import { VeterinaryUsApprovalCardComponent } from '../veterinary-us-approval-card/veterinary-us-approval-card.component';
import { ChildPagingComponent } from "../../../commons/child-paging/child-paging.component";
import { UtilityService } from '../../../services/utility-service/utility.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ElementRef,HostListener,ViewChildren,QueryList } from '@angular/core';
import { TruncatePipe } from '../../../pipes/truncate.pipe';

@Component({
  selector: 'app-veterinary-us-approval',
  standalone: true,
  imports: [CommonModule, VeterinaryUsApprovalCardComponent, ChildPagingComponent,TruncatePipe],
  templateUrl: './veterinary-us-approval.component.html',
  styleUrl: './veterinary-us-approval.component.css'
})
export class VeterinaryUsApprovalComponent {
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
  @Output() handleResultTabData = new EventEmitter<any>();
   @Output() handleSetLoading = new EventEmitter<boolean>();
 
  isPopupOpen = false;
  searchThrough: string = '';
  resultTabs: any = {};
  _currentChildAPIBody: any = {};
  _data: any = [];
   @Input() index: any;
   @Input() tabName?: string;
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    if (value) {
      console.log(value);
      this._data = value;
    }
  }
   @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    // if (value) {
    //   this.ImpurityBody = JSON.parse(JSON.stringify(this._currentChildAPIBody)) || this._currentChildAPIBody;
    //   this.handleFetchFilters();
    // }
  }
  viewProduct: boolean = false;
  constructor(
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService,
    public loadingService: LoadingService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }
  ngOnInit(): void {
    this.vetenaryusApiBody = { ...this.currentChildAPIBody };
    this.vetenaryusApiBody.filters = this.vetenaryusApiBody.filters || {};
  
    console.log('[ngOnInit] Initial vetenaryusApiBody:', JSON.stringify(this.vetenaryusApiBody, null, 2));
  
    this.handleFetchFilters();
  }

  vetenaryusApiBody: any;
  vetenaryusFilters: any = {};
  lastClickedFilterKey: string | null = null;

  filterConfigs = [
    {
      key: 'ingredient',
      label: 'All Ingredients',
      dataKey: 'ingredientFilters',
      filterType: 'ingredient',
      dropdownState: false
    },
    {
      key: 'trade_name',
      label: 'All Trade Name',
      dataKey: 'tradeFilters',
      filterType: 'trade_name',
      dropdownState: false
    },
    {
      key: 'active_ingredients',
      label: 'View All Active Ingredient',
      dataKey: 'activeIngredientFilters',
      filterType: 'active_ingredients',
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

  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'ingredient': label = 'All Ingredients'; break;
            case 'trade_name': label = 'Company'; break;
            case 'active_ingredients': label = 'activeIngredientFilters'; break;
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
  
    this.vetenaryusApiBody.filter_enable = true;
    console.log('[handleFetchFilters] Set filter_enable to true in API body:', JSON.stringify(this.vetenaryusApiBody, null, 2));
  
    this.mainSearchService.veterinaryusApprovalSearchSpecific(this.vetenaryusApiBody).subscribe({
      next: (res) => {
        console.log('[handleFetchFilters] API call success. Raw response:', res);
        console.log('[handleFetchFilters] res.status:', res?.status);
        console.log('[handleFetchFilters] res.message:', res?.message);
        console.log('[handleFetchFilters] res.data keys:', Object.keys(res?.data || {}));
        console.log('[handleFetchFilters] res.data:', JSON.stringify(res?.data, null, 2));
  
        const ingredientFilters = res?.data?.ingredient || [];
        const strengthFilters = res?.data?.strength || [];
        const tradeFilters = res?.data?.trade_name || [];
        const dosageFilters = res?.data?.active_ingredients || [];
  
        console.log('[handleFetchFilters] Parsed ingredientFilters:', ingredientFilters);
        console.log('[handleFetchFilters] Parsed strengthFilters:', strengthFilters);
        console.log('[handleFetchFilters] Parsed rawradeFilters:', tradeFilters);
        console.log('[handleFetchFilters] Parsed dosageFilters:', dosageFilters);
  
        const formattedtradeFilters = tradeFilters.map((item: any) => {
          const key = Object.keys(item)[0];
          const count = item[key]?.length || 0;
          const obj = {
            name: `${key} (${count})`,
            value: key
          };
          console.log('[handleFetchFilters] Processed trade_name item:', item, '=>', obj);
          return obj;
        });
        
  
        this.vetenaryusFilters = {
          ingredientFilters,
          strengthFilters,
          tradeFilters: formattedtradeFilters,
          DosageFilters: dosageFilters
        };
  
        console.log('[handleFetchFilters] Final vetenaryusFilters object:', this.vetenaryusFilters);
  
        this.vetenaryusApiBody.filter_enable = false;
        console.log('[handleFetchFilters] Reset filter_enable to false');
      },
      error: (err) => {
        console.error('[handleFetchFilters] API call failed:', err);
        this.vetenaryusApiBody.filter_enable = false;
        console.log('[handleFetchFilters] Reset filter_enable to false (on error)');
      }
    });
  }
  
  

  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    this.handleSetLoading.emit(true);
    this.vetenaryusApiBody.filters = this.vetenaryusApiBody.filters || {};

    if (value === '') {
      delete this.vetenaryusApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.vetenaryusApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, name || '');
    }

    this._currentChildAPIBody = {
      ...this.vetenaryusApiBody,
      filters: { ...this.vetenaryusApiBody.filters }
    };

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.veterinaryusApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        let resultData = res?.data || {};
        const sortValue = this.vetenaryusApiBody.filters['order_by'];

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
        case 'ingredient': defaultLabel = 'All Ingredients'; break;
        case 'trade_name': defaultLabel = 'Company'; break;
        case 'active_ingredients': defaultLabel = 'activeIngredientFilters'; break;
        case 'strength': defaultLabel = 'Strengths'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.vetenaryusApiBody.filters = {};
    this._currentChildAPIBody = {
      ...this.vetenaryusApiBody,
      filters: {}
    };

    this.handleSetLoading.emit(true);
    this.mainSearchService.veterinaryusApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
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

  copyText(elementId: string, event: Event) {
    const el = event.currentTarget as HTMLElement;
    const textToCopy = document.getElementById(elementId)?.innerText;


    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        // el is already the <i> element, no need for querySelector
        if (el.classList.contains('fa-copy')) {
          el.classList.remove('fa-copy');
          el.classList.add('fa-check');


          setTimeout(() => {
            el.classList.remove('fa-check');
            el.classList.add('fa-copy');
          }, 1500);
        }
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  }


}
