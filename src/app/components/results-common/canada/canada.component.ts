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
      filterType: 'product_name',
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
        console.log('📥 ---------------sdjisgjishjd---------', res.data);


        const productFilters = res?.data?.product_name?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const strengthFilters = res?.data?.product_name?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const companyFiltersRaw = res?.data?.company?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const dosageFilters = res?.data?.dosage_forms?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        this.canadaPatentFilters = {
          productFilters,
          strengthFilters,
          CompanyFilters: companyFiltersRaw,
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

    // Set or remove the filter
    if (value === '') {
      delete this.canadaPatentApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.canadaPatentApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, name || '');
    }

    // Close all dropdowns
    this.filterConfigs = this.filterConfigs.map(item => ({
      ...item,
      dropdownState: false
    }));

    // ✅ Reset pagination when filter changes
    const updatedBody = {
      ...this.canadaPatentApiBody,
      page_no: 1,
      start: 0,
      filters: { ...this.canadaPatentApiBody.filters }
    };
    this._currentChildAPIBody = updatedBody;

    console.log('📤 Sending API Request:', updatedBody);

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.canadaApprovalSearchSpecific(updatedBody).subscribe({
      next: (res) => {
        let resultData = res?.data || {};
        console.log('📤  Request:', res.data);

        this._currentChildAPIBody = {
          ...updatedBody,
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
    // Reset all filter labels
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

    // ✅ Clear filters and reset pagination
    const clearedBody = {
      ...this.canadaPatentApiBody,
      page_no: 1,
      start: 0,
      filters: {}
    };
    this.canadaPatentApiBody.filters = {};
    this._currentChildAPIBody = clearedBody;

    this.handleSetLoading.emit(true);

    this.mainSearchService.canadaApprovalSearchSpecific(clearedBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...clearedBody,
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


  // handleSelectFilter(filterKey: string, value: any, name?: string): void {
  //   this.handleSetLoading.emit(true);
  //   this.canadaPatentApiBody.filters = this.canadaPatentApiBody.filters || {};

  //   if (value === '') {
  //     delete this.canadaPatentApiBody.filters[filterKey];
  //     this.setFilterLabel(filterKey, '');
  //   } else {
  //     this.canadaPatentApiBody.filters[filterKey] = value;
  //     this.setFilterLabel(filterKey, name || '');
  //   }
  //   this.filterConfigs = this.filterConfigs.map(item => ({
  //     ...item,
  //     dropdownState: false
  //   }));

  //   this._currentChildAPIBody = {
  //     ...this.canadaPatentApiBody,
  //     filters: { ...this.canadaPatentApiBody.filters }
  //   };
  //   console.log('📤 Sending API Request:', this._currentChildAPIBody);

  //   const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  //   this.mainSearchService.canadaApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
  //     next: (res) => {
  //       let resultData = res?.data || {};
  //         console.log('✅ API Response Received:', resultData);
  //       this._currentChildAPIBody = {
  //         ...this._currentChildAPIBody,
  //         count: resultData?.health_canada_count
  //       };

  //       this.handleResultTabData.emit(resultData);
  //       this.handleSetLoading.emit(false);
  //       window.scrollTo(0, scrollTop);
  //     },
  //     error: () => {
  //       this._currentChildAPIBody.filter_enable = false;
  //       this.handleSetLoading.emit(false);
  //       window.scrollTo(0, scrollTop);
  //     }
  //   });
  // }
  // clear() {
  //   this.filterConfigs = this.filterConfigs.map(config => {
  //     let defaultLabel = '';
  //     switch (config.key) {
  //       case 'product_name': defaultLabel = 'Select Product'; break;
  //       case 'company': defaultLabel = 'Company'; break;
  //       case 'dosage_forms': defaultLabel = 'Dosage Forms'; break;
  //       case 'strength': defaultLabel = 'Strengths'; break;
  //     }
  //     return { ...config, label: defaultLabel, dropdownState: false };
  //   });

  //   this.canadaPatentApiBody.filters = {};
  //   this._currentChildAPIBody = {
  //     ...this.canadaPatentApiBody,
  //     filters: {}
  //   };

  //   this.handleSetLoading.emit(true);
  //   this.mainSearchService.canadaApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
  //     next: (res) => {
  //       this._currentChildAPIBody = {
  //         ...this._currentChildAPIBody,
  //         count: res?.data?.health_canada_count
  //       };
  //       this.handleResultTabData.emit(res.data);
  //       this.handleSetLoading.emit(false);
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       this._currentChildAPIBody.filter_enable = false;
  //       this.handleSetLoading.emit(false);
  //     }
  //   });

  //   window.scrollTo(0, 0);
  // }
}
