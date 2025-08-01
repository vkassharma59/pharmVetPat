import {
  Component, EventEmitter, Input, Output, ViewChildren,
  QueryList,
  ElementRef, HostListener,
  ChangeDetectorRef
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { UsApprovalCardComponent } from '../us-approval-card/us-approval-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';

@Component({
  selector: 'chem-us',
  standalone: true,
  imports: [CommonModule, UsApprovalCardComponent, ChildPagingComponent, TruncatePipe],
  templateUrl: './us.component.html',
  styleUrl: './us.component.css'
})
export class UsComponent {
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  _currentChildAPIBody: any;
  searchThrough: string = '';
  resultTabs: any = {};
  searchByTable: boolean = false;
  _data: any = [];
  @Input()
  get data() {
    console.log("hfkjhf", this.data);
    return this._data;
  }
  set data(name: any) {
    this._data = name;
    console.log("hfngefenhdd", this._data); this.patentData = Array.isArray(name) ? name : [name];
    this.handleResultTabData.emit(this._data);
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
  @Input() index: any;
  @Input() tabName?: string;
  usApiBody: any;
  usFilters: any = {};
  lastClickedFilterKey: string | null = null;

  filterConfigs = [
    {
      key: 'ingredient',
      label: 'Select Ingredient',
      dataKey: 'ingredientFilters',
      filterType: 'ingredient',
      dropdownState: false
    },
    {
      key: 'rld',
      label: 'Select RLD',
      dataKey: 'rldFilters',
      filterType: 'rld',
      dropdownState: false
    },
    {
      key: 'appl_type',
      label: 'Select Appl Type',
      dataKey: 'applFilters',
      filterType: 'appl_type',
      dropdownState: false
    },
    {
      key: 'applicant',
      label: 'Select Applicant',
      dataKey: 'applicantFilters',
      filterType: 'applicant',
      dropdownState: false
    },
    {
      key: 'strength',
      label: 'Select Strength',
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
    private mainSearchService: MainSearchService,
    private cdr: ChangeDetectorRef
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }
  patentColumns: any[] = []; // Column list from currentChildAPIBody
  patentData: any[] = [];    // Data from @Input() data

  ngOnChanges() {

    // Fix 1: Wrap _data in array if it's not one already
    if (this._data && !Array.isArray(this._data)) {
      this.patentData = [this._data];

    } else if (Array.isArray(this._data)) {
      this.patentData = this._data;

    } else {
      console.warn('⚠️ patentData is missing or not valid');
    }

    // Fix 2: Handle column definitions
    if (this.currentChildAPIBody?.columnList?.patentColumnList?.length) {
      this.patentColumns = this.currentChildAPIBody.columnList.patentColumnList;

    } else {
      console.warn('⚠️ patentColumns not available from currentChildAPIBody');
    }
  }
  ngOnInit(): void {
    this.usApiBody = { ...this.currentChildAPIBody };
    this.usApiBody.filters = this.usApiBody.filters || {};
    this.handleFetchFilters();
  }
  onFilterButtonClick(filterKey: string) {
    this.lastClickedFilterKey = filterKey;

    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        const toggledState = !item.dropdownState;
        console.log(`[Dropdown] Toggling dropdown for '${filterKey}':`, toggledState ? 'OPEN' : 'CLOSED');
        return { ...item, dropdownState: toggledState };
      } else {
        return { ...item, dropdownState: false };
      }
    });
  }
  handleFetchFilters() {
    this.usApiBody.filter_enable = true;
    console.log('[Filters] Fetching US filters with body:', this.usApiBody);
  
    this.mainSearchService.usApprovalSearchSpecific(this.usApiBody).subscribe({
      next: (res: any) => {
        console.log('[Filters] Raw response:', res);
  
        const data = res?.data || {};
        const applFilters = data.appl_type || [];
        const strengthFilters = data.strength || [];
        const rldFilters = data.rld || [];
        const applicantFilters = data.applicant || [];
        const ingredientFilters = data.ingredient || [];
  
        console.log('[Filters] appl_type:', applFilters);
        console.log('[Filters] strength:', strengthFilters);
        console.log('[Filters] rld:', rldFilters);
        console.log('[Filters] applicant:', applicantFilters);
        console.log('[Filters] ingredient:', ingredientFilters);
  
        this.usFilters = {
          applFilters,
          strengthFilters,
          rldFilters,
          applicantFilters,
          ingredientFilters,
        };
  
        console.log('[Filters] Final assigned usFilters:', this.usFilters);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Filters] Error fetching US filters:', err);
        this.usApiBody.filter_enable = false;
      }
    });
  }
  
  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'appl_type': label = 'Application Type'; break;
            case 'rld': label = 'Select RLD'; break;
            case 'applicant': label = 'Applicant Filters'; break;
            case 'strength': label = 'Strengths'; break;
            case 'ingredient': label = 'Select Ingredient'; break;
          }
        }
        return { ...item, label: label };
      }
      return item;
    });
  }
  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    this.handleSetLoading.emit(true);
 // this.usApiBody.filters = this.usApiBody.filters || {};
 if (value === '') {
   delete this.usApiBody.filters[filterKey];
   this.setFilterLabel(filterKey, '');
 } else {
   this.usApiBody.filters[filterKey] = value;  // ✅ Only value goes in filters
   this.setFilterLabel(filterKey, name || '');
 }
 // ✅ Close dropdowns
 this.filterConfigs = this.filterConfigs.map(item => ({
   ...item,
   dropdownState: false
 }));
 // Log constructed filter object
 
 this._currentChildAPIBody = {
   ...this.usApiBody,
   filters: { ...this.usApiBody.filters }
 };
 const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

 

 this.mainSearchService.usApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
   next: (res) => {
     const resultData = res?.data || {};
    
     this._currentChildAPIBody = {
       ...this._currentChildAPIBody,
       count: resultData?.oran
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
  // handleSelectFilter(filterKey: string, value: any, name?: string): void {
  //   console.log(`[Filter] Selected key: ${filterKey}, value: ${value}, label: ${name}`);
  //   this.handleSetLoading.emit(true);
  //   this.usApiBody.filters = this.usApiBody.filters || {};

  //   if (value === '') {
  //     delete this.usApiBody.filters[filterKey];
  //     this.setFilterLabel(filterKey, '');
  //   } else {
  //     this.usApiBody.filters[filterKey] = value;
  //     this.setFilterLabel(filterKey, name || '');
  //   }

  //   this.filterConfigs = this.filterConfigs.map(item => ({
  //     ...item,
  //     dropdownState: false
  //   }));

  //   this._currentChildAPIBody = {
  //     ...this.usApiBody,
  //     filters: { ...this.usApiBody.filters }
  //   };
  //   console.log(`[API] Current API body for ${filterKey}:`, this._currentChildAPIBody);

  //   const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  //   this.mainSearchService.usApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
  //     next: (res) => {
  //       console.log(`[API] Filtered result for ${filterKey}:`, res?.data);

  //       let resultData = res?.data || {};

  //       // ✅ Updating the local data property:
  //       this._data = resultData.orange_book_us_data || [];

  //       // ✅ Emitting only the relevant array instead of the whole object:
  //       this.handleResultTabData.emit(this._data);

  //       // ✅ Updating count if needed:
  //       this._currentChildAPIBody = {
  //         ...this._currentChildAPIBody,
  //         count: resultData?.orange_book_us_count
  //       };

  //       this.handleSetLoading.emit(false);
  //       window.scrollTo(0, scrollTop);

  //       // ✅ Trigger change detection if using OnPush:
  //       this.cdr.detectChanges();
  //     },
  //     error: (err) => {
  //       console.error(`[API] Error filtering on ${filterKey}:`, err);
  //       this._currentChildAPIBody.filter_enable = false;
  //       this.handleSetLoading.emit(false);
  //       window.scrollTo(0, scrollTop);
  //     }
  //   });
  // }
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
        case 'appl_type': defaultLabel = 'Application Type'; break;
        case 'rld': defaultLabel = 'Select RLD'; break;
        case 'applicant': defaultLabel = 'Applicant Filters'; break;
        case 'strength': defaultLabel = 'Strengths'; break;
        case 'ingredient': defaultLabel = 'Select Ingredient'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.usApiBody.filters = {};
    this._currentChildAPIBody = {
      ...this.usApiBody,
      filters: {}
    };

    this.handleSetLoading.emit(true);
    this.mainSearchService.usApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.orange_book_us_count
        };
        this.searchByTable = true;
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
