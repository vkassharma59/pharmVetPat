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
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';
import { PurpleBookCardComponent } from '../purple-book-card/purple-book-card.component';

@Component({
  selector: 'app-purple-book',
  standalone: true,
  imports: [CommonModule, PurpleBookCardComponent, ChildPagingComponent, TruncatePipe],
  templateUrl: './purple-book.component.html',
  styleUrl: './purple-book.component.css'
})
export class PurpleBookComponent {
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  _currentChildAPIBody: any;
  searchThrough: string = '';
  resultTabs: any = {};
  searchByTable: boolean = false;
  @Input() keyword: string = '';
  isExportingExcel: boolean = false;
  _data: any = [];
  @Input()
  get data() {
    return this._data;
  }
  set data(name: any) {
    this._data = name;
    console.log("hfngefenhdd", this._data); 
    this.patentData = Array.isArray(name) ? name : [name];
    console.log("hfngefenhdd", this._data); 
    this.patentData = Array.isArray(name) ? name : [name];
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
  purpleApiBody: any;
  purpleFilters: any = {};
  lastClickedFilterKey: string | null = null;
  filterOrSearchSource: 'filter' | 'search' | null = null;
  pageSize = 25;

  filterConfigs = [
    {
      key: 'applicant',
      label: 'Select Applicant',
      dataKey: 'applicantFilters',
      filterType: 'applicant',
      dropdownState: false
    },
    {
      key: 'proprietary_name',
      label: 'Select Proprietary Name',
      dataKey: 'proprietaryNameFilters',
      filterType: 'proprietary_name',
      dropdownState: false
    },
    {
      key: 'proper_name',
      label: 'Select Proper Name',
      dataKey: 'properNameFilters',
      filterType: 'proper_name',
      dropdownState: false
    },
    {
      key: 'bla_type',
      label: 'Select BLA Type',
      dataKey: 'blaTypeFilters',
      filterType: 'bla_type',
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
    }
  
    // ⭐ FIX: Update pageSize every time new paginated results come
    if (Array.isArray(this._data)) {
      this.pageSize = this._data.length;   // <-- Correct dynamic update
    } else {
      this.pageSize = 1;
    }
  
    // Fix 2: Handle column definitions
    if (this.currentChildAPIBody?.columnList?.patentColumnList?.length) {
      this.patentColumns = this.currentChildAPIBody.columnList.patentColumnList;
    }
  }
  
  ngOnInit(): void {
    this.purpleApiBody = { ...this.currentChildAPIBody };
    this.purpleApiBody.filters = this.purpleApiBody.filters || {};
    this.handleFetchFilters();
  }
  onFilterButtonClick(filterKey: string) {
    this.lastClickedFilterKey = filterKey;

    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        const toggledState = !item.dropdownState;
        return { ...item, dropdownState: toggledState };
      } else {
        return { ...item, dropdownState: false };
      }
    });
  }
  handleFetchFilters() {
    this.purpleApiBody.filter_enable = true;
    this.mainSearchService.purpleBookSearchSpecific(this.purpleApiBody).subscribe({
      next: (res: any) => {
        const properNameFilters = res?.data?.proper_name?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const strengthFilters = res?.data?.strength?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const proprietaryNameFilters = res?.data?.proprietary_name?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const blaTypeFilters = res?.data?.bla_type?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const applicantFilters = res?.data?.applicant?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        this.purpleFilters = {
          properNameFilters: properNameFilters,
          strengthFilters,
          proprietaryNameFilters: proprietaryNameFilters,
          applicantFilters,
          blaTypeFilters: blaTypeFilters,



        };
        this.purpleApiBody.filter_enable = false;
        this.purpleApiBody.filter_enable = false;


      },
      error: (err) => {
        console.error('[Filters] Error fetching US filters:', err);
        this.purpleApiBody.filter_enable = false;
      }
    });
  }

  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'proper_name': label = 'Select Proper Name'; break;
            case 'proprietary_name': label = 'Select Proprietary Name'; break;
            case 'applicant': label = 'Select Applicant Filters'; break;
            case 'strength': label = 'Select Strengths'; break;
            case 'bla_type': label = 'Select BLA Type'; break;
          }
        }
        return { ...item, label: label };
      }
      return item;
    });
  }
  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    this.filterOrSearchSource = 'filter'; 
    this.handleSetLoading.emit(true);
    // this.purpleApiBody.filters = this.purpleApiBody.filters || {};



    if (value === '') {
      delete this.purpleApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.purpleApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, name || '');
    }

    this.filterConfigs = this.filterConfigs.map(item => ({
      ...item,
      dropdownState: false
    }));

    this._currentChildAPIBody = {
      ...this.purpleApiBody,
      filters: { ...this.purpleApiBody.filters }
    };
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.mainSearchService.purpleBookSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        const resultData = res?.data || {};
        // ✅ Updating count if needed:
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: resultData?.purple_book_count
        };
        this._data = resultData?.purple_book_data || [];
        this.handleResultTabData.emit(resultData);
        this.handleSetLoading.emit(false);
      },
      error: (err) => {
        console.error(`[API] Error filtering on ${filterKey}:`, err);
        this._currentChildAPIBody.filter_enable = false;
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      }
    });
  }
  // handleChangeTabData(updatedData: any) {
  //   this._data = updatedData?.purple_book_data || updatedData || [];
  //   this.pageSize = this._data.length;
  //   this.patentData = this._data;       // update UI table list
  // }
  updatePageData(event: any) {
    if (event?.purple_book_data) {
      this._data = event.purple_book_data;
      this.pageSize = this._data.length;  // update page size
      this.currentChildAPIBody.count = event.purple_book_count;
    }
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
      this.filterOrSearchSource = null; 
      let defaultLabel = '';
      switch (config.key) {
        case 'proper_name': defaultLabel = 'Select Proper Name'; break;
        case 'proprietary_name': defaultLabel = 'Select Proprietary Name'; break;
        case 'applicant': defaultLabel = 'Select Applicant Filters'; break;
        case 'strength': defaultLabel = 'Select Strengths'; break;
        case 'bla_type': defaultLabel = 'Select BLA Type'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.purpleApiBody.filters = {};
    this._currentChildAPIBody = {
      ...this.purpleApiBody,
      filters: {}
    };

    this.handleSetLoading.emit(true);
    this.mainSearchService.purpleBookSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.purple_book_count
        };
        this._data = res?.data?.purple_book_data || [];
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