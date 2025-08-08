import {
  Component,
  EventEmitter,
  Input,
  Output,
  ElementRef,
  ViewChildren,
  QueryList,
  HostListener
} from '@angular/core';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { CommonModule } from '@angular/common';
import { ImpPatentsCardComponent } from '../imp-patents-card/imp-patents-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';
import { Auth_operations } from '../../../Utils/SetToken';
import { LoadingService } from '../../../services/loading-service/loading.service';

@Component({
  selector: 'chem-imp',
  standalone: true,
  imports: [TruncatePipe, CommonModule, ImpPatentsCardComponent, ChildPagingComponent],
  templateUrl: './imp.component.html',
  styleUrl: './imp.component.css'
})
export class ImpComponent {
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();

  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
  lastClickedFilterKey: string | null = null;

  searchThrough: string = '';
  resultTabs: any = {};
  _data: any = [];
  productValue: string = '';
  _currentChildAPIBody: any;
  impPatentApiBody: any;
  impPatentFilters: any = {};
  @Input() index: any;
  @Input() tabName?: string;
  filterConfigs = [
    {
      key: 'product',
      label: 'Select Product',
      dataKey: 'productFilters',
      filterType: 'product',
      dropdownState: false
    },
    {
      key: 'patent_type',
      label: 'Patent Type',
      dataKey: 'patentTypeFilters',
      filterType: 'patent_type',
      dropdownState: false
    },
    {
      key: 'assignee',
      label: 'Select Assignee',
      dataKey: 'assigneeFilters',
      filterType: 'assignee',
      dropdownState: false
    },
    {
      key: 'order_by',
      label: 'Order By',
      dataKey: 'orderByFilters',
      filterType: 'order_by',
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
      this.impPatentApiBody = JSON.parse(JSON.stringify(value)) || value;
      this.handleFetchFilters();
    }
  }

  constructor(
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService,
    public loadingService: LoadingService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
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
    this.impPatentApiBody.filter_enable = true;

    this.mainSearchService.impPatentsSearchSpecific(this.impPatentApiBody).subscribe({
      next: (res) => {
        console.log('📦 Raw patent_type data:', res?.data?.patent_type);

        this.impPatentFilters.productFilters = res?.data?.product || [];
        //  this.impPatentFilters.orderByFilters = res?.data?.order_by || [];


        this.impPatentFilters.patentTypeFilters = Array.isArray(res?.data?.patent_type)
          ? res.data.patent_type.map((item: any) => ({
            name: item.name || item.value,
            value: item.value
          }))
          : [];
        this.impPatentFilters.orderByFilters = Array.isArray(res?.data?.order_by)
          ? res.data.order_by.map((item: any) => ({
            name: item.name || item.value,
            value: item.value
          }))
          : [];
        console.log('📦 Raw patent_type data:', this.impPatentFilters.orderByFilters);
        console.log('✅ Mapped patentTypeFilters:', this.impPatentFilters.patentTypeFilters);

        this.impPatentFilters.assigneeFilters = res?.data?.assignee || [];
        this.impPatentApiBody.filter_enable = false;
      },
      error: (err) => {
        console.error('❌ Error in handleFetchFilters:', err);
        this.impPatentApiBody.filter_enable = false;
      }
    });
  }


  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'product': label = 'Select Product'; break;
            case 'patent_type': label = 'Patent Type'; break;
            case 'assignee': label = 'Select Assignee'; break;
            case 'order_by': label = 'Order By'; break;
          }
        }
        return { ...item, label: label };
      }
      return item;
    });
  }

  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    this.handleSetLoading.emit(true);
    // Handle `order_by` separately
    // Handle `order_by` separately
    if (filterKey === 'order_by') {
      let mappedOrderBy = '';
      if (value === 'Newest') {
        mappedOrderBy = 'ASC';
      } else if (value === 'Oldest') {
        mappedOrderBy = 'DESC';
      } else {
        mappedOrderBy = value;
      }

      // ✅ API body में order_by सेट करें
      this.impPatentApiBody.order_by = mappedOrderBy;

      this.setFilterLabel(filterKey, name || value);
    } else {
      if (value === '') {
        delete this.impPatentApiBody.filters[filterKey];
        this.setFilterLabel(filterKey, '');
      } else {
        this.impPatentApiBody.filters[filterKey] = value;
        this.setFilterLabel(filterKey, name || '');
      }
    }
     // Close all dropdowns
    this.filterConfigs = this.filterConfigs.map(item => ({
      ...item,
      dropdownState: false
    }));
    this._currentChildAPIBody = {
      ...this.impPatentApiBody,
      filters: { ...this.impPatentApiBody.filters },
      order_by: this.impPatentApiBody.order_by || ''
    };
     const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.mainSearchService.impPatentsSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        let resultData = res?.data || {};
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: resultData?.imp_patent_count
        };
        this._data = resultData?.imp_patent_data || [];
        this._data = resultData?.imp_patent_data || [];

        this.handleResultTabData.emit(resultData);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: () => {
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
        case 'product': defaultLabel = 'Select Product'; break;
        case 'patent_type': defaultLabel = 'Patent Type'; break;
        case 'assignee': defaultLabel = 'Select Assignee'; break;
        case 'order_by': defaultLabel = 'Order By'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.impPatentApiBody.filters = {};
    this.impPatentApiBody.order_by = '';
    this._currentChildAPIBody = {
      ...this.impPatentApiBody,
      filters: {},
      order_by: ''
    };
    console.log('📦 API Body after clear:', this._currentChildAPIBody);
    this.handleSetLoading.emit(true);

    this.mainSearchService.impPatentsSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.imp_patent_count
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
