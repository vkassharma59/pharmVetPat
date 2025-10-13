import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { EuropeApprovalCardComponent } from '../europe-approval-card/europe-approval-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';
@Component({
  selector: 'chem-europe-approval',
  standalone: true,
  imports: [CommonModule, EuropeApprovalCardComponent, ChildPagingComponent, TruncatePipe],
  templateUrl: './europe-approval.component.html',
  styleUrl: './europe-approval.component.css'
})
export class EuropeApprovalComponent {
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @Input() currentChildAPIBody: any;
  _currentChildAPIBody: any;
  searchThrough: string = '';
  resultTabs: any = {};
  _data: any = [];
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
    this.handleResultTabData.emit(this._data || []);
  }
  @Input() index: any;
  @Input() tabName?: string;
  emaApiBody: any;
  emaFilters: any = {};
  lastClickedFilterKey: string | null = null;
  filterOrSearchSource: 'filter' | 'search' | null = null;
  filterConfigs = [
    {
      key: 'marketing_authorisation_holder',
      label: 'Marketing Authorisation Holder',
      dataKey: 'marketFilters',
      filterType: 'marketing_authorisation_holder',
      dropdownState: false
    },
    {
      key: 'active_substance',
      label: 'Product Name ',
      dataKey: 'productFilters',
      filterType: 'active_substance',
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
    private mainSearchService: MainSearchService,
    private cdr: ChangeDetectorRef
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }
  ngOnChanges() {
    console.log('europeApproval received data:', this._data);
    this.handleResultTabData.emit(this._data);

  }
  //  updateDataFromPagination(newData: any) {
  //   this._data = newData; // or this.data = newData; if you want setter to trigger
  //   this.handleResultTabData.emit(newData);
  //   console.log("✅ Updated data from pagination:", newData);
  // }
  ngOnInit(): void {
    this.emaApiBody = { ...this.currentChildAPIBody };
    this.emaApiBody.filters = this.emaApiBody.filters || {};

    console.log('[ngOnInit] Initial emaApiBody:', JSON.stringify(this.emaApiBody, null, 2));

    this.handleFetchFilters();
  }


  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'marketing_authorisation_holder': 
              label = 'Marketing Authorization Holder';
              break; 
            case 'active_substance': 
              label = 'Product Name';
              break;
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
    this.emaApiBody.filter_enable = true;
  
    this.mainSearchService.europeApprovalSearchSpecific(this.emaApiBody).subscribe({
      next: (result: any) => {
        const rawMarketData = result?.data?.marketing_authorisation_holder || [];
        const rawProductData = result?.data?.active_substance || [];
        const marketFilters = rawMarketData.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const productFilters = rawProductData.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        this.emaFilters = {
          marketFilters: marketFilters,
          productFilters: productFilters
        };
  
        this.emaApiBody.filter_enable = false;
      },
      error: (err) => {
        this.emaApiBody.filter_enable = false;
      }
    });
  }
  
  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    this.filterOrSearchSource = 'filter';
    this.handleSetLoading.emit(true);
 
 if (value === '') {
   delete this.emaApiBody.filters[filterKey];
   this.setFilterLabel(filterKey, '');
 } else {
   this.emaApiBody.filters[filterKey] = value;  // ✅ Only value goes in filters
   this.setFilterLabel(filterKey, name || '');
 }
 // ✅ Close dropdowns
 this.filterConfigs = this.filterConfigs.map(item => ({
   ...item,
   dropdownState: false
 }));
 // Log constructed filter object
 
 this._currentChildAPIBody = {
   ...this.emaApiBody,
   filters: { ...this.emaApiBody.filters }
 };
 const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

 

 this.mainSearchService.europeApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
   next: (res) => {
     const resultData = res?.data || {};
    
     this._currentChildAPIBody = {
       ...this._currentChildAPIBody,
       count: resultData?.ema_count
     };
     this._data = resultData?.ema_data || [];

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
        case 'marketing_authorisation_holder': defaultLabel = 'Marketing Authorisation Holder'; break;
        case 'active_substance': defaultLabel = 'Product Name'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.emaApiBody.filters = {};
    this._currentChildAPIBody = {
      ...this.emaApiBody,
      filters: {}
    };

    this.handleSetLoading.emit(true);
    this.mainSearchService.europeApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.ema_count
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

