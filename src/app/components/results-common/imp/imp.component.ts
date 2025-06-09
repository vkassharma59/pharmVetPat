import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { CommonModule } from '@angular/common';
import { ImpPatentsCardComponent } from '../imp-patents-card/imp-patents-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';
import { Auth_operations } from '../../../Utils/SetToken';

@Component({
  selector: 'chem-imp',
  standalone: true,
  imports: [TruncatePipe, CommonModule,ImpPatentsCardComponent, ChildPagingComponent],
  templateUrl: './imp.component.html',
  styleUrl: './imp.component.css'
})
export class ImpComponent {

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
   searchThrough: string = '';
  resultTabs: any = {};
  _data: any = [];
  productValue: string = '';
  _currentChildAPIBody: any;
  impPatentApiBody: any;
  impPatentFilters: any = {};

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
      dataKey: 'patentTypeFilers',
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
    console.log("======adasygcfsv|",this._data)
  }

  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    if(value) {
      this.impPatentApiBody = JSON.parse(JSON.stringify(value)) || value;
      this.handleFetchFilters();
    }
  }

  constructor(
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }

  handleFetchFilters() {
    this.impPatentApiBody.filter_enable = true;
    this.mainSearchService.impPatentsSearchSpecific(this.impPatentApiBody).subscribe({
      next: (res) => {
        this.impPatentFilters.productFilters = res?.data?.product;
        this.impPatentFilters.orderByFilters = res?.data?.order_by;
        this.impPatentFilters.patentTypeFilters = res?.data?.patent_type;
        this.impPatentFilters.assigneeFilters = res?.data?.assignee;
        this.impPatentApiBody.filter_enable = false;
      },
      error: (err) => {
        console.error(err);
        this.impPatentApiBody.filter_enable = false;
      },
    });
  }

  onFilterButtonClick(filterKey: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        return { ...item, dropdownState: !item.dropdownState };
      }
      return { ...item, dropdownState: false };
    });
  }

  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if(label === '') {
          switch(filterKey) {
            case 'product':
              label = 'Select Product';
              break;
            case 'patent_type':
              label = 'Patent Typ'
              break;
            case 'assignee':
              label = 'Select Assignee'
              break;
            case 'order_by':
              label = 'Order By'
              break;
          }
        }

        return { ...item, label: label };
      }
      return item;
    });
  }
  

  handleSelectFilter(filterKey: string, value: any) {
    this.onFilterButtonClick(filterKey);
    this.handleSetLoading.emit(true);

    if (value == '') {
      delete this.impPatentApiBody.filters[filterKey];
      const filterLabel = this.filterConfigs.find((item) => item.key === filterKey);
      this.setFilterLabel(filterKey, '');
    } else {
      this.impPatentApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, value);
    }
  
    this._currentChildAPIBody = {
      ...this.impPatentApiBody,
      filters: { ...this.impPatentApiBody.filters }
    };    
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
    this.mainSearchService.impPatentsSearchSpecific(
      this._currentChildAPIBody
    ).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.imp_patent_count
        };

        this.handleResultTabData.emit(res.data);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: (err) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          filter_enable: false
        };
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
    });
  }
  clear() {
    // Reset all filter labels to default
    this.filterConfigs = this.filterConfigs.map(config => {
      let defaultLabel = '';
      switch (config.key) {
        case 'product':
          defaultLabel = 'Select Product';
          break;
        case 'patent_type':
          defaultLabel = 'Patent Type';
          break;
        case 'assignee':
          defaultLabel = 'Select Assignee';
          break;
        case 'order_by':
          defaultLabel = 'Order By';
          break;
      }
  
      return {
        ...config,
        label: defaultLabel,
        dropdownState: false
      };
    });
  
    // Clear filters object
    this.impPatentApiBody.filters = {};
  
    // Reset API body and trigger fresh search (optional)
    this._currentChildAPIBody = {
      ...this.impPatentApiBody,
      filters: {}
    };
  
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
      },
    });
  
    // Scroll to top
    window.scrollTo(0, 0);
  }
  
}