import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { JapanPMDAComponent } from "../japan-pmda/japan-pmda.component";
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';

@Component({
  selector: 'chem-japan',
  standalone: true,
  imports: [CommonModule, JapanPMDAComponent, ChildPagingComponent, TruncatePipe],
  templateUrl: './japan.component.html',
  styleUrl: './japan.component.css'
})
export class JapanComponent {
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  _currentChildAPIBody: any;
  @Input() index: any;
  @Input() tabName?: string;
  searchThrough: string = '';
  resultTabs: any = {};
  _data: any = [];
  @Input() keyword: string = '';
  isExportingExcel: boolean = false;
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
    this.handleResultTabData.emit(this._data || []);

  }
  @Input()
  get currentChildAPIBody() {

    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    if (value) {
      this.japanApiBody = JSON.parse(JSON.stringify(this._currentChildAPIBody)) || this._currentChildAPIBody;
      this.handleFetchFilters();
    }
  }
  japanApiBody: any;
  japanFilters: any = {};
  lastClickedFilterKey: string | null = null;
  filterOrSearchSource: 'filter' | 'search' | null = null;
  filterConfigs = [
    {
      key: 'company',
      label: 'company',
      dataKey: 'companyFilters',
      filterType: 'company',
      dropdownState: false
    },
    {
      key: 'active_ingredients',
      label: 'Product Name',
      dataKey: 'productFilters',
      filterType: 'active_ingredients',
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

  // ngOnChanges() {
  //   console.log('JapanComponent received data:', this._data);
  //   this.handleResultTabData.emit(this._data);
  // }
  // ngOnInit(): void {
  //   this.japanApiBody = { ...this.currentChildAPIBody };
  //   this.japanApiBody.filters = this.japanApiBody.filters || {};
  //   this.handleFetchFilters();
  // }
  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'company':
              label = 'company';
              break;
            case 'active_ingredients':
              label = 'Product Name';
              break;
          }
        }
        return { ...item, label: label };
      }
      return item;
    });

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
    this.japanApiBody.filter_enable = true;

    this.mainSearchService.japanApprovalSearchSpecific(this.japanApiBody).subscribe({
      next: (result: any) => {
        const rawCompanyData = result?.data?.company || [];
        const rawProductData = result?.data?.active_ingredients || [];

        const companyFilters = rawCompanyData.map(item => ({
          name: item.name,
          value: item.value
        })) || [];

        const productFilters = rawProductData.map(item => ({
          name: item.name,
          value: item.value
        })) || [];

        this.japanFilters = {
          companyFilters: companyFilters,  
          productFilters: productFilters
        };

        this.japanApiBody.filter_enable = false;
      },
      error: (err) => {
        this.japanApiBody.filter_enable = false;
      }
    });
  }

  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    this.filterOrSearchSource = 'filter';
    this.handleSetLoading.emit(true);

    if (value === '') {
      delete this.japanApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.japanApiBody.filters[filterKey] = value;  // ✅ Only value goes in filters
      this.setFilterLabel(filterKey, name || '');
    }
    // ✅ Close dropdowns
    this.filterConfigs = this.filterConfigs.map(item => ({
      ...item,
      dropdownState: false
    }));
    // Log constructed filter object

    this._currentChildAPIBody = {
      ...this.japanApiBody,
      filters: { ...this.japanApiBody.filters }
    };
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.mainSearchService.japanApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        const resultData = res?.data || {};

        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: resultData?.japan_pmda_count
        };
        this._data = resultData?.japan_pmda_data || [];

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
  onChildPagingDataUpdate(eventData: any) {
    this._data = eventData?.japan_pmda_data || [];

    this._currentChildAPIBody = {
      ...this._currentChildAPIBody,
      count: eventData?.japan_pmda_count
    };
    this.cdr.detectChanges(); // Optional — use only if UI isn't updating as expected
    this.handleResultTabData.emit(eventData); // Optional — needed if parent needs it
  }
  clear() {
    this.filterConfigs = this.filterConfigs.map(config => {
      this.filterOrSearchSource = null;
      let defaultLabel = '';
      switch (config.key) {
        case 'company': defaultLabel = 'company'; break;
        case 'active_ingredients': defaultLabel = 'Product Name'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.japanApiBody.filters = {};
    this._currentChildAPIBody = {
      ...this.japanApiBody,
      filters: {}
    };

    this.handleSetLoading.emit(true);
    this.mainSearchService.japanApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.japan_pmda_count
        };
        this._data = res?.data?.japan_pmda_data || [];
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
  downloadExcel(): void {
    this.isExportingExcel = true;
  
    // Prepare request body
    this._currentChildAPIBody = {
      ...this.japanApiBody,
      filters: { ...this.japanApiBody.filters },
      filter_enable: false
    };
  
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
    this.mainSearchService.japanApprovaldownloadexcel(this._currentChildAPIBody).subscribe({
      next: async (res: Blob) => {
        try {
          // Step 1: Read response as ArrayBuffer
          const arrayBuffer = await res.arrayBuffer();
          const XLSX = await import('xlsx');
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
  
          if (!jsonData.length) {
            this.isExportingExcel = false;
            return;
          }
  
          // Step 2: Identify columns that actually have values
          const keys = Object.keys(jsonData[0]);
          const validKeys = keys.filter((k: string) =>
            jsonData.some((row: any) => row[k] !== null && row[k] !== undefined && row[k] !== '')
          );
  
          // Step 3: Remove empty columns
          const filteredData = jsonData.map((row: any) => {
            const filteredRow: any = {};
            validKeys.forEach((k: string) => (filteredRow[k] = row[k]));
            return filteredRow;
          });
  
          // Step 4: Create new worksheet and workbook
          const newWorksheet = XLSX.utils.json_to_sheet(filteredData, { skipHeader: false });
          const colWidths = validKeys.map((key) => ({ wch: Math.max(key.length, 90) }));
          newWorksheet['!cols'] = colWidths;
          const newWorkbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'FilteredData');
  
          // Step 5: Convert workbook to Blob for download
          const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
  
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Japan.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
  
          this.isExportingExcel = false;
          window.scrollTo(0, scrollTop);
        } catch (error) {
          console.error('Excel processing error:', error);
          this.isExportingExcel = false;
          window.scrollTo(0, scrollTop);
        }
      },
      error: (err) => {
        console.error('Excel download error:', err);
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          filter_enable: false
        };
        this.isExportingExcel = false;
        window.scrollTo(0, scrollTop);
      }
    });
  }
}



