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
  _data: any = [];
  @Input()
  get data() {

    return this._data;
  }
  set data(name: any) {
    this._data = name;
    this.patentData = Array.isArray(name) ? name : [name];
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
ngOnInit(): void {
    this.dmfApiBody = { ...this.currentChildAPIBody };
    this.dmfApiBody.filters = this.dmfApiBody.filters || {};
    this.handleFetchFilters();
  }

  onFilterButtonClick(filterKey: string) {

    this.lastClickedFilterKey = filterKey;
    this.filterConfigs = this.filterConfigs.map((item) => ({
      ...item,
      dropdownState: item.key === filterKey ? !item.dropdownState : false
    }));
  }

  handleFetchFilters() {
    // this.dmfApiBody.filter_enable = true;
    // console.log("apibody", this.dmfApiBody)

    this.mainSearchService.dmfSearchSpecific(this.dmfApiBody).subscribe({
      next: (result: any) => {
        const hcData = result?.data?.tech_supplier_data || [];
        const getUnique = (arr: any[]) => [...new Set(arr.filter(Boolean))];

        const countryFilters = getUnique(hcData.map(item => item.country_dmf_holder));
        const dmfFilters = getUnique(hcData.map(item => item.dmf_status));
        const techFilters = getUnique(hcData.map(item => item.tech));
        console.log("-------dmf------", dmfFilters)
        console.log("-------t------", techFilters)
        console.log("-------c------", countryFilters)

        this.dmfFilters = {
          countryFilters: countryFilters.map(name => ({ name, value: name })),
          dmfFilters: dmfFilters.map(name => ({ name, value: name })),
          techFilters: techFilters.map(name => ({ name, value: name })),
        };

        this.cdr.detectChanges();
        // this.dmfApiBody.filter_enable = false;


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
      this.dmfApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, name || '');
    }
  
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
  
        const sortValue = this.dmfApiBody.filters['order_by'];
        const sortedData = this.sortPatentData(resultData.tech_supplier_data, sortValue);
  
        // ✅ Update internal state
        this._data = sortedData || [];
        this.patentData = this._data; // optional if used separately
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: resultData?.tech_supplier_count
        };
  
        this.cdr.detectChanges(); // ✅ ensure view updates
  
        // ✅ Emit updated data to parent (optional)
        this.handleResultTabData.emit(this._data);
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