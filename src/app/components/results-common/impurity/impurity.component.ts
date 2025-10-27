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
  
    // 🧠 Get keyword safely from possible sources
    const keyword =
      (this.keyword && this.keyword.trim()) ||
      (this.currentChildAPIBody?.keyword?.trim()) ||
      (this.ImpurityBody?.keyword?.trim()) ||
      (this.mainSearchService as any)?.simpleSearchKeyword?.trim() ||
      '';
  
    if (!keyword) {
      alert('Please perform a search before downloading Excel.');
      this.isExportingExcel = false;
      return;
    }
  
    // Determine page number if available, else default to 1
    const page_no =
      this.ImpurityBody?.page_no && !isNaN(this.ImpurityBody.page_no)
        ? Number(this.ImpurityBody.page_no)
        : 1;
  
    // Build API body with keyword and page number
    this._currentChildAPIBody = {
      ...this.ImpurityBody,
      keyword,
      page_no,
    };
  
    console.log('✅ Final Impurity Excel download body:', this._currentChildAPIBody);
  
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
    this.mainSearchService.impuritydownloadexcel(this._currentChildAPIBody).subscribe({
      next: async (res: Blob) => {
        try {
          if (!res || res.size === 0) {
            console.warn('⚠️ Empty response from backend. Exporting local data.');
            this.exportLocalData();
            this.isExportingExcel = false;
            return;
          }
  
          // Parse Excel from Blob
          const arrayBuffer = await res.arrayBuffer();
          const XLSX = await import('xlsx');
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
  
          if (!jsonData.length) {
            console.warn('⚠️ Excel sheet is empty. Exporting local data instead.');
            this.exportLocalData();
            this.isExportingExcel = false;
            return;
          }
  
          // 🧩 Filter columns that have actual data
          const validKeys = Object.keys(jsonData[0]).filter((key) =>
            jsonData.some((row) => {
              const val = row[key];
              return val !== null && val !== undefined && val !== '';
            })
          );
  
          const cleanedData = jsonData.map((row) => {
            const newRow: any = {};
            validKeys.forEach((key) => (newRow[key] = row[key]));
            return newRow;
          });
  
          // 🧾 Create new worksheet only with valid columns
          const newWorksheet = XLSX.utils.json_to_sheet(cleanedData, { skipHeader: false });
          newWorksheet['!cols'] = validKeys.map((key) => ({
            wch: Math.min(Math.max(key.length, 25), 80),
          }));
  
          const newWorkbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'FilteredData');
  
          const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
  
          // 🪄 Trigger download
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Impurity-Data.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
  
          console.log('✅ Excel downloaded successfully with filtered columns (Impurity).');
          this.isExportingExcel = false;
          window.scrollTo(0, scrollTop);
        } catch (error) {
          console.error('Excel processing error (Impurity):', error);
          this.isExportingExcel = false;
          this.exportLocalData();
        }
      },
      error: (err) => {
        console.error('Excel download error (Impurity):', err);
        console.warn('⚠️ Falling back to local data export due to API error.');
        this.isExportingExcel = false;
        this.exportLocalData();
        window.scrollTo(0, scrollTop);
      },
    });
  }
  
  private exportLocalData(): void {
    if (!this._data || !this._data.length) {
      alert('No data available to export.');
      return;
    }
  
    import('xlsx').then((XLSX) => {
      const validKeys = Object.keys(this._data[0]).filter((key) =>
        this._data.some((row) => {
          const val = row[key];
          return val !== null && val !== undefined && val !== '';
        })
      );
  
      const filteredData = this._data.map((row) => {
        const newRow: any = {};
        validKeys.forEach((key) => (newRow[key] = row[key]));
        return newRow;
      });
  
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      worksheet['!cols'] = validKeys.map((key) => ({
        wch: Math.min(Math.max(key.length, 25), 80),
      }));
  
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'LocalData');
      XLSX.writeFile(workbook, 'Impurity-Local.xlsx');
  
      console.log('✅ Exported local data successfully with filtered columns (Impurity).');
    });
  }
  
  
}
