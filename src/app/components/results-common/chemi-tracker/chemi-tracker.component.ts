import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { ChemiTrackerCardComponent } from '../chemi-tracker-card/chemi-tracker-card.component';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';
import { Auth_operations } from '../../../Utils/SetToken';
import { ViewChild, ElementRef } from '@angular/core';
import { LoadingService } from '../../../services/loading-service/loading.service';

@Component({
  selector: 'chem-chemi-tracker',
  standalone: true,
  imports: [TruncatePipe, ChemiTrackerCardComponent, CommonModule, ChildPagingComponent],
  templateUrl: './chemi-tracker.component.html',
  styleUrl: './chemi-tracker.component.css'
})
export class ChemiTrackerComponent {

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();

  resultTabs: any = {};
  _data: any = [];
  country_value: any = 'Select Country';
  _currentChildAPIBody: any = {};
  chemiAPIBody: any;
  company_value: any = 'Select Company';
  countryFilters: any = [];
  companyFilters: any = [];
  isCountryDropdownOpen: boolean = false;
  isOpen: boolean = false;
  searchThrough: string = '';
  isExportingExcel: boolean = false;
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
      this.chemiAPIBody = JSON.parse(JSON.stringify(value)) || value;
      this.handleFetchFilters();
    }
  }

  @Input() index: any;
  @Input() tabName?: string;

  @ViewChild('countryDropdownRef') countryDropdownRef!: ElementRef;
  @ViewChild('companyDropdownRef') companyDropdownRef!: ElementRef;

  constructor(
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService,
    public loadingService: LoadingService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;

  }
  toggleCountryDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
    this.isOpen = false; // close other dropdown
  }

  toggleCompanyDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    this.isCountryDropdownOpen = false; // close other dropdown
  }
  handleFetchFilters() {
    this.chemiAPIBody.filter_enable = true;
    this.mainSearchService.chemiTrackerSearchSpecific(this.chemiAPIBody).subscribe({
      next: (res) => {
        console.log('🔍 company Filter Values (company_name):', res?.data);
        this.countryFilters = res?.data?.country_of_company;
        this.companyFilters = res?.data?.company_name;
        this.chemiAPIBody.filter_enable = false;
      },
      error: (err) => {
        console.error(err);
        this.chemiAPIBody.filter_enable = false;
      },
    });
  }
  handleFilter() {
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
  }
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      this.countryDropdownRef &&
      !this.countryDropdownRef.nativeElement.contains(target)
    ) {
      this.isCountryDropdownOpen = false;
    }
    if (
      this.companyDropdownRef &&
      !this.companyDropdownRef.nativeElement.contains(target)
    ) {
      this.isOpen = false;
    }
  }
  dropdown() {
    this.isOpen = !this.isOpen;
  }

  handleSelectFilter(filter: any, value: any) {
    this.isCountryDropdownOpen = false;
    this.isOpen = false;

    this.handleSetLoading.emit(true);
    if (value == '') {
      if (filter == 'country_of_company') {
        delete this.chemiAPIBody.filters['country_of_company'];
        this.country_value = 'Select Country';
      } else {
        delete this.chemiAPIBody.filters['company_name'];
        this.company_value = 'Select Company';
      }
    } else {
      if (filter == 'country_of_company') {
        this.chemiAPIBody.filters['country_of_company'] = value;
        this.country_value = value;
      } else {
        this.chemiAPIBody.filters['company_name'] = value;
        this.company_value = value;
      }
    }

    this._currentChildAPIBody = {
      ...this.chemiAPIBody,
      filters: { ...this.chemiAPIBody.filters }
    };
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.chemiTrackerSearchSpecific(
      this._currentChildAPIBody
    ).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.chemi_tracker_count
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
    // Reset dropdown labels
    this.country_value = 'Select Country';
    this.company_value = 'Select Company';

    // Close dropdowns
    this.isCountryDropdownOpen = false;
    this.isOpen = false;

    // Clear filters
    this.chemiAPIBody.filters = {};

    // Prepare new API body
    this._currentChildAPIBody = {
      ...this.chemiAPIBody,
      filters: {}
    };

    // Emit loading state
    this.handleSetLoading.emit(true);

    // Call API with cleared filters
    this.mainSearchService.chemiTrackerSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.chemi_tracker_count
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

    this.handleSelectFilter;
  }
  downloadExcel(): void {
    this.isExportingExcel = true;
    this._currentChildAPIBody = {
      ...this.chemiAPIBody,
      filters: { ...this.chemiAPIBody.filters }
    };

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.chemiTrackerdownloadexcel(this._currentChildAPIBody).subscribe({
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
          // Minimum width 20 characters (aap change kar sakte ho)
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
          a.download = 'Chemi-Tracker-Excel.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          this.isExportingExcel = false;
          window.scrollTo(0, scrollTop);
        } catch (error) {
          console.error("Excel processing error:", error);
          this.isExportingExcel = false;
          window.scrollTo(0, scrollTop);
        }
      },
      error: (err) => {
        console.error("Excel download error:", err);
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          filter_enable: false
        };
        this.isExportingExcel = false;
        window.scrollTo(0, scrollTop);
      },
    });
  }


}

