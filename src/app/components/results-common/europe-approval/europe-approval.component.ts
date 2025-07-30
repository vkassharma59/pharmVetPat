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

  filterConfigs = [
    {
      key: 'marketing_authorisation_holder',
      label: 'Marketing Authorisation Holder',
      dataKey: 'marketFilters',
      filterType: 'marketing_authorisation_holder',
      dropdownState: false
    }];
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
            case 'marketing_authorisation_holder': label = 'Select Marketing Authorization Holder'; break;

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
      next: (res: any) => {
        const hcData = res?.data?.ema_data || [];
        const getUnique = (arr: any[]) => [...new Set(arr.filter(Boolean))];
        const marketFilters = getUnique(hcData.map(item => item.marketing_authorisation_holder));
        this.emaFilters = {
          marketFilters
        };

        this.emaApiBody.filter_enable = false;


      },
      error: (err) => {
        console.error('Error fetching ema filters:', err);
        this.emaApiBody.filter_enable = false;

      }
    });
  }


  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    this.handleSetLoading.emit(true);
    this.emaApiBody.filters = this.emaApiBody.filters || {};

    if (value === '') {
      delete this.emaApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.emaApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, name || '');
    }

    this._currentChildAPIBody = {
      ...this.emaApiBody,
      filters: { ...this.emaApiBody.filters }
    };

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.europeApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        let resultData = res?.data || {};
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: resultData?.ema_count
        };

        // ✅ Update _data directly!
        this._data = resultData.ema_data || [];
        this.handleResultTabData.emit(this._data);
        this.handleSetLoading.emit(false);

        this.cdr.detectChanges();
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
        case 'marketing_authorisation_holder': defaultLabel = 'Marketing Authorisation Holder'; break;
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

