import { Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { LitigationCardComponent } from '../litigation-card/litigation-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';

@Component({
  selector: 'chem-litigation',
  standalone: true,
  imports: [CommonModule, TruncatePipe, LitigationCardComponent, ChildPagingComponent],
  templateUrl: './litigation.component.html',
  styleUrl: './litigation.component.css'
})
export class LitigationComponent {
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  _currentChildAPIBody: any;
  searchThrough: string = '';
  resultTabs: any = {};
  searchByTable: boolean = false;
  @Input() index: any;
  @Input() tabName?: string;
  litigApiBody: any;
  litigFilters: any = {};
  lastClickedFilterKey: string | null = null;
  _data: any = [];


  filterConfigs = [
    {
      key: 'country',
      label: 'Select Country',
      dataKey: 'countryFilters',
      filterType: 'country',
      dropdownState: false
    }
  ];

  @Input()
  get data() {
    console.log('📥 Data received in litig Component:', this._data);
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }
  countryConfigRaw: any[] = [];
  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    if (value) {
        this.litigApiBody = JSON.parse(JSON.stringify(value)) || value;
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
     this.litigApiBody.filter_enable = true;
    this.mainSearchService.litigationSearchSpecific(this.litigApiBody).subscribe({
      next: (result: any) => {
        const countryConfig = result?.data?.country || [];
        this.countryConfigRaw = countryConfig;

        const countryFilters = result?.data?.country?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];

        this.litigFilters = {
          countryFilters: countryFilters, // ← Fix here
        };
        this.litigApiBody.filter_enable = false;
      },
      error: (err) => {
        console.error('Error fetching litig filters:', err);
        this.litigApiBody.filter_enable = false;
      }
    });
  }
  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'country': label = 'Country'; break;
            
          }
        }
        return { ...item, label: label };
      }
      return item;
    });
  }
  handleSelectFilter(filterKey: string, value: any, name?: string): void {
       this.handleSetLoading.emit(true);
    // this.litigApiBody.filters = this.litigApiBody.filters || {};
    if (value === '') {
      delete this.litigApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.litigApiBody.filters[filterKey] = value;  // ✅ Only value goes in filters
      this.setFilterLabel(filterKey, name || '');
    }
    // ✅ Close dropdowns
    this.filterConfigs = this.filterConfigs.map(item => ({
      ...item,
      dropdownState: false
    }));
    // Log constructed filter object
    
    this._currentChildAPIBody = {
      ...this.litigApiBody,
      filters: { ...this.litigApiBody.filters }
    };
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    

    this.mainSearchService.litigationSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        const resultData = res?.data || {};
       
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: resultData?.litigation_count
        };
        this._data = resultData?.litigation_data || [];

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
        case 'country': defaultLabel = 'Country'; break;
        

      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.litigApiBody.filters = {};
    this._currentChildAPIBody = {
      ...this.litigApiBody,
      filters: {}
    };

    this.handleSetLoading.emit(true);
    this.mainSearchService.litigationSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {

        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.litigation_count
        };
        this._data = res?.data?.litigation_data || [];

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