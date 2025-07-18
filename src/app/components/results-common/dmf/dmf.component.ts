import { Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { TruncatePipe } from '../../../pipes/truncate.pipe';
import { CommonModule } from '@angular/common';
import { DmfCardComponent } from '../dmf-card/dmf-card.component';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-dmf',
  standalone: true,
  imports: [CommonModule, TruncatePipe, DmfCardComponent, ChildPagingComponent],
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
  searchByTable: boolean = false;
 @Input() index: any;
  @Input() tabName?: string;
  dmfApiBody: any;
  dmfFilters: any = {};
  lastClickedFilterKey: string | null = null;
  _data: any = [];
  
  filterConfigs = [
    {
      key: 'country_dmf_holder',
      label: 'Select Country',
      dataKey: 'countryFilters',
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

  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }

  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
     if (value) {
      this.dmfApiBody = JSON.parse(JSON.stringify(value)) || value;
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

  // onFilterButtonClick(filterKey: string) {

  //   this.lastClickedFilterKey = filterKey;
  //   this.filterConfigs = this.filterConfigs.map((item) => ({
  //     ...item,
  //     dropdownState: item.key === filterKey ? !item.dropdownState : false
  //   }));
  // }
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
    this.dmfApiBody.filter_enable = true;
       this.mainSearchService.dmfSearchSpecific(this.dmfApiBody).subscribe({
      next: (result: any) => {
        const hcData = result?.data?.data || [];
        console.log("-------dmf------", result?.data)
        const getUnique = (arr: any[]) => [...new Set(arr.filter(Boolean))];
        // const countryFilters = getUnique(hcData.map(item => item.country_dmf_holder));
        const dmfFilters = getUnique(hcData.map(item => item.dmf_status));
        const techFilters = getUnique(hcData.map(item => item.tech));
        console.log("-------dmf------", dmfFilters)
        console.log("-------t------", techFilters)

        const countryFilters = result?.data?.country_dmf_holder?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];

        // const countryFilters = result?.data?.country_dmf_holder?.map(item => item.name) || [];

        console.log("-------c------", countryFilters)
        this.dmfFilters = {
          countryFilters: countryFilters, // ← Fix here
          dmfFilters: dmfFilters.map(name => ({ name, value: name })),
          techFilters: techFilters.map(name => ({ name, value: name })),
        };
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
    console.log('🔍 Filter clicked:', { filterKey, value, name });

    this.handleSetLoading.emit(true);
    this.dmfApiBody.filters = this.dmfApiBody.filters || {};
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
    console.log('📦 Final Filters:', this.dmfApiBody.filters);
    this._currentChildAPIBody = {
      ...this.dmfApiBody,
      filters: { ...this.dmfApiBody.filters }
    };
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    console.log('📤 Sending API Request:', this._currentChildAPIBody);

    this.mainSearchService.dmfSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        const resultData = res?.data || {};
        console.log('✅ API Response Received:', resultData);
     
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: resultData?.tech_supplier_count
        };

        this.searchByTable = true; // ✅ Set searchByTable to tru
        // ✅ Emit updated data to parent (optional)
        this.handleResultTabData.emit(resultData);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: (err) => {
        console.error("❌ Error while filtering data", err);
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
        case 'country_dmf_holder': defaultLabel = 'Select Country'; break;
        case 'dmf_status': defaultLabel = 'Select DMF'; break;
        case 'tech': defaultLabel = 'Select TECH/API Filters'; break
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
        this.searchByTable = true;
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