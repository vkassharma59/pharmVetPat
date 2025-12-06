import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ImpurityCardComponent } from '../impurity-card/impurity-card.component';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { Auth_operations } from '../../../Utils/SetToken';
import { LoadingService } from '../../../services/loading-service/loading.service';

@Component({
  selector: 'chem-impurity',
  standalone: true,
  imports: [CommonModule, ImpurityCardComponent, ChildPagingComponent],
  templateUrl: './impurity.component.html',
  styleUrl: './impurity.component.css'
})
export class ImpurityComponent {
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();

  @ViewChild('dropdownMenu') dropdownMenuRef!: ElementRef;
  
  searchThrough: string = '';
  resultTabs: any = {};
  isOpen: boolean = false;
  _data: any = [];
  _currentChildAPIBody: any = {};
  ImpurityBody: any;
  category_filters: any;
  searchKeyword: string = '';
  category_value: any = 'Select Category';
  @Input() keyword: string = '';
  isExportingExcel: boolean = false;
  @Input() tabName?: string;
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
      this.ImpurityBody = JSON.parse(JSON.stringify(value)) || value;
      this.searchKeyword = value.keyword || ''; // ✅ store keyword for Excel
    }
  }  

  @Input() index: any;

  constructor(
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService,
    public loadingService: LoadingService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const clickedInside = this.dropdownMenuRef?.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isOpen = false;
    }
  }

  handleFilter() {
    this.isOpen = !this.isOpen;
  }

  clear() {
    this.handleSetLoading.emit(true);
    this.category_value = 'Select Category';
    this.isOpen = false;

    if (this.ImpurityBody.filters?.category) {
      delete this.ImpurityBody.filters['category'];
    }

    this._currentChildAPIBody = {
      ...this.ImpurityBody,
      filters: { ...this.ImpurityBody.filters }
    };

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.impuritySearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.impurity_count
        };
        this.handleResultTabData.emit(res.data);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: (err) => {
        console.error(err);
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          filter_enable: false
        };
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
    });
  }

  handleSelectFilter(value: string) {
    this.isOpen = false;
    this.handleSetLoading.emit(true);

    if (value === '') {
      delete this.ImpurityBody.filters['category'];
      this.category_value = 'Select Category';
    } else {
      this.ImpurityBody.filters['category'] = value;
      this.category_value = value;
    }

    this._currentChildAPIBody = {
      ...this.ImpurityBody,
      filters: { ...this.ImpurityBody.filters }
    };

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.impuritySearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.impurity_count
        };
        this.handleResultTabData.emit(res.data);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: (err) => {
        console.error(err);
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          filter_enable: false
        };
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
    });
  }

  handleFetchFilters() {
    this.ImpurityBody.filter_enable = true;
    this.mainSearchService.impuritySearchSpecific(this.ImpurityBody).subscribe({
      next: (res) => {
        this.category_filters = res?.data?.category;
        this.ImpurityBody.filter_enable = false;
      },
      error: (err) => {
        console.error(err);
        this.ImpurityBody.filter_enable = false;
      },
    });
  }
  downloadExcel(): void {
    this.isExportingExcel = true;
    this._currentChildAPIBody = {
      ...this.ImpurityBody,
      filters: { ...this.ImpurityBody.filters }
    };

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.impPatentsdownloadexcel(this._currentChildAPIBody).subscribe({
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
          a.download = 'Impurity.xlsx';
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
