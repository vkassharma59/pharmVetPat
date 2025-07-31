import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  ViewChildren,
  QueryList,
  ElementRef,
  HostListener
} from '@angular/core';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { CommonModule } from '@angular/common';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { ScientificDocsCardComponent } from '../scientific-docs-card/scientific-docs-card.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { Auth_operations } from '../../../Utils/SetToken';
@Component({
 
  selector: 'app-scientific-docs',
  standalone: true,
  imports: [ChildPagingComponent, CommonModule, ScientificDocsCardComponent],
  templateUrl: './scientific-docs.component.html',
  styleUrls: ['./scientific-docs.component.css']
})
export class ScientificDocsComponent implements OnChanges {
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  _currentChildAPIBody: any;
  searchThrough: string = '';
  resultTabs: any = {};
  searchByTable: boolean = false;
  @Input() index: any;
  @Input() tabName?: string;
  scientificApiBody: any;
  scientificFilters: any = {};
  lastClickedFilterKey: string | null = null;
  _data: any = [];


  filterConfigs = [
    {
      key: 'country_scientific_holder',
      label: 'Select Country',
      dataKey: 'countryFilters',
      filterType: 'country_scientific_holder',
      dropdownState: false
    },
    {
      key: 'stock_status',
      label: 'scientific TYPE ',
      dataKey: 'stockstatusFilters',
      filterType: 'stock_status',
      dropdownState: false
    },
    {
      key: 'scientific_holder',
      label: 'scientific Holder',
      dataKey: 'scientificholderFilters',
      filterType: 'scientific_holder',
      dropdownState: false
    }
  ];

  @Input()
  get data() {
   
    return this._data;
  }
  set data(value: any) {
    this._data = value;
    console.log("suhfd",this._data);
  }
  countryConfigRaw: any[] = [];
  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    if (value) {
      this.scientificApiBody = JSON.parse(JSON.stringify(value)) || value;
      this.handleFetchFilters();
    }
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

  constructor(
    private utilityService: UtilityService,
    public loadingService: LoadingService,
    private mainSearchService: MainSearchService,
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }
  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
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
  handleFetchFilters() {
     this.scientificApiBody.filter_enable = true;
    this.mainSearchService.scientificDocsSpecific(this.scientificApiBody).subscribe({
      next: (result: any) => {
        const countryConfig = result?.data?.country_scientific_holder || [];
        this.countryConfigRaw = countryConfig;

        const countryFilters = result?.data?.country_scientific_holder?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const stockstatusFilters = result?.data?.stock_status?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];


        const scientificholderFilters = result?.data?.scientific_holder?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        this.scientificFilters = {
          countryFilters: countryFilters, // ← Fix here
          stockstatusFilters: stockstatusFilters,
          scientificholderFilters: scientificholderFilters,
        };
        this.scientificApiBody.filter_enable = false;
      },
      error: (err) => {
        console.error('Error fetching scientific filters:', err);
        this.scientificApiBody.filter_enable = false;
      }
    });
  }
  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'country_scientific_holder': label = 'Country'; break;
            case 'stock_status': label = 'Select Stock Status'; break;
            case 'scientific_holder': label = 'scientific Holder Filters'; break;
          }
        }
        return { ...item, label: label };
      }
      return item;
    });
  }
  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    console.log('🔍 Filter clicked:', { filterKey, value, name });
    this.handleSetLoading.emit(true);
    // this.scientificApiBody.filters = this.scientificApiBody.filters || {};
    if (value === '') {
      delete this.scientificApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.scientificApiBody.filters[filterKey] = value;  // ✅ Only value goes in filters
      this.setFilterLabel(filterKey, name || '');
    }
    // ✅ Close dropdowns
    this.filterConfigs = this.filterConfigs.map(item => ({
      ...item,
      dropdownState: false
    }));
    // Log constructed filter object
    
    this._currentChildAPIBody = {
      ...this.scientificApiBody,
      filters: { ...this.scientificApiBody.filters }
    };
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    

    this.mainSearchService.scientificDocsSpecific(this._currentChildAPIBody).subscribe({
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
      let defaultLabel = '';
      switch (config.key) {
        case 'country_scientific_holder': defaultLabel = 'Country'; break;
        case 'stock_status': defaultLabel = 'Select Stock Status'; break;
        case 'scientific_holder': defaultLabel = 'scientific Holder Filters'; break;

      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.scientificApiBody.filters = {};
    this._currentChildAPIBody = {
      ...this.scientificApiBody,
      filters: {}
    };

    this.handleSetLoading.emit(true);
    this.mainSearchService.scientificDocsSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {

        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.tech_supplier_count
        };
        this._data = res?.data?.tech_supplier_data || [];

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