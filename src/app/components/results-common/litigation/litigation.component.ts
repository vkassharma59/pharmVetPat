import { Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { LitigationCardComponent } from '../litigation-card/litigation-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';

@Component({
  selector: 'chem-litigation',
  standalone: true,
  imports: [CommonModule, TruncatePipe, LitigationCardComponent, ChildPagingComponent],
  templateUrl: './litigation.component.html',
  styleUrl: './litigation.component.css'
})
export class LitigationComponent {
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  _currentChildAPIBody: any;
  searchThrough: string = '';
  resultTabs: any = {};
  searchByTable: boolean = false;
  @Input() index: any;
  @Input() tabName?: string;
  litigApiBody: any;
  litigFilters: any = {};
  lastClickedFilterKey: string | null = null;
  _data: any = [];
  @Input() keyword: string = '';
  isExportingExcel: boolean = false;
  filterOrSearchSource: 'filter' | 'search' | null = null;

  filterConfigs = [
    {
      key: 'country',
      label: 'Select Country',
      dataKey: 'countryFilters',
      filterType: 'country',
      dropdownState: false
    }
  ];

  @Input()
  get data() {
    console.log('📥 Data received in litig Component:', this._data);
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }
  countryConfigRaw: any[] = [];
  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    if (value) {
        this.litigApiBody = JSON.parse(JSON.stringify(value)) || value;
      this.handleFetchFilters();
    }
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

  constructor(
    private utilityService: UtilityService,
    public loadingService: LoadingService,
    private mainSearchService: MainSearchService,
  ) {
 
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
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
     this.litigApiBody.filter_enable = true;
    this.mainSearchService.litigationSearchSpecific(this.litigApiBody).subscribe({
      next: (result: any) => {
        const countryConfig = result?.data?.country || [];
        this.countryConfigRaw = countryConfig;

        const countryFilters = result?.data?.country?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];

        this.litigFilters = {
          countryFilters: countryFilters, // ← Fix here
        };
        this.litigApiBody.filter_enable = false;
      },
      error: (err) => {
        console.error('Error fetching litig filters:', err);
        this.litigApiBody.filter_enable = false;
      }
    });
  }
  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'country': label = 'Country'; break;
            
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
    // this.litigApiBody.filters = this.litigApiBody.filters || {};
    if (value === '') {
      delete this.litigApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.litigApiBody.filters[filterKey] = value;  // ✅ Only value goes in filters
      this.setFilterLabel(filterKey, name || '');
    }
    // ✅ Close dropdowns
    this.filterConfigs = this.filterConfigs.map(item => ({
      ...item,
      dropdownState: false
    }));
    // Log constructed filter object
    
    this._currentChildAPIBody = {
      ...this.litigApiBody,
      filters: { ...this.litigApiBody.filters }
    };
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    

    this.mainSearchService.litigationSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        const resultData = res?.data || {};
       
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: resultData?.litigation_count
        };
        this._data = resultData?.litigation_data || [];

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
  clear() {
    this.filterConfigs = this.filterConfigs.map(config => {
      this.filterOrSearchSource = null;
      let defaultLabel = '';
      switch (config.key) {
        case 'country': defaultLabel = 'Country'; break;
        

      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.litigApiBody.filters = {};
    this._currentChildAPIBody = {
      ...this.litigApiBody,
      filters: {}
    };

    this.handleSetLoading.emit(true);
    this.mainSearchService.litigationSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {

        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.litigation_count
        };
        this._data = res?.data?.litigation_data || [];

        this.handleResultTabData.emit(res.data);
        this.handleSetLoading.emit(false);
      },
      error: (err) => {
        console.error("❌ Error while refetching after clear:", err);
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
        if (el.classList.contains('fa-copy')) {
          el.classList.remove('fa-copy');
          el.classList.add('fa-check');
          setTimeout(() => {
            el.classList.remove('fa-check');
            el.classList.add('fa-copy');
          }, 1500);
        }
      }).catch(err => {
        console.error('[copyText] ❌ Failed to copy text:', err);
      });
    }
  }
  private formatDate(): string {
    const months = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];
    const now = new Date();
    return `${now.getDate()}-${months[now.getMonth()]}-${now.getFullYear()}`;
  }
  private async loadImageAsBase64(imagePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fetch(imagePath)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject();
          reader.readAsDataURL(blob);
        })
        .catch(() => reject());
    });
  }
  
  private async createExcelWithHeader(
    data: any[],
    titleKeyword: string
  ): Promise<Blob> {
  
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Litigation');
  
    // ================= HEADER INFO =================
    const dateStr = this.formatDate();
    const title = 'Litigation';
    const keyword = `SEARCH: ${titleKeyword}`;
  
    // ================= HEADER ROW (LOGO) =================
    const headerRow = worksheet.addRow([]);
    headerRow.height = 70;
  
    try {
      const logoBase64 = await this.loadImageAsBase64('assets/images/logo.png');
      const img = workbook.addImage({ base64: logoBase64, extension: 'png' });
  
      worksheet.addImage(img, {
        tl: { col: 0, row: 0 },
        ext: { width: 170, height: 70 }
      });
  
      worksheet.getColumn(1).width = 20;
    } catch {}
  
    worksheet.mergeCells('B1:C1');
    const titleCell = worksheet.getCell('B1');
    titleCell.value = title;
    titleCell.font = { bold: true, size: 15, color: { argb: 'FF0032A0' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
    worksheet.getCell('D1').value = dateStr;
    worksheet.getCell('D1').font = { bold: true };
    worksheet.getCell('D1').alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
  
    worksheet.getCell('E1').value = keyword;
    worksheet.getCell('E1').font = { bold: true };
    worksheet.getCell('E1').alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
  
    worksheet.addRow([]);
    worksheet.addRow([]);
  
    // ================= COLUMN HEADERS (FROM EXCEL 5th ROW) =================
    const headers = Object.keys(data[0] || {}).filter(h => h);
  
    const headerRow2 = worksheet.addRow(headers);
    headerRow2.height = 35;
  
    headerRow2.eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' }
      };
    });
  
    worksheet.views = [{ state: 'frozen', ySplit: 4 }];
  
    // ================= DATA ROWS =================
    data.forEach(row => {
      const excelRow = worksheet.addRow(
        headers.map(h => row[h] ?? '')
      );
  
      excelRow.eachCell(cell => {
        cell.alignment = { wrapText: true, vertical: 'top' };
      });
    });
  
    // ================= AUTO WIDTH =================
    headers.forEach((key, i) => {
      worksheet.getColumn(i + 1).width =
        Math.min(Math.max(key.length * 2, 30), 60);
    });
  
    // ================= 🔥 HIDE EMPTY COLUMNS =================
    worksheet.columns.forEach(col => {
      if (!col || typeof col.eachCell !== 'function') return;
  
      let hasData = false;
  
      col.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber > 4 && cell.value !== null && cell.value !== '') {
          hasData = true;
        }
      });
  
      if (!hasData) {
        col.hidden = true;
      }
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }
  
  downloadExcel(): void {
    this.isExportingExcel = true;
  
    const scrollTop =
      window.pageYOffset || document.documentElement.scrollTop;
  
    this._currentChildAPIBody = {
      ...this.litigApiBody,
      filters: { ...this.litigApiBody.filters }
    };
  
    this.mainSearchService
      .litigationdownloadexcel(this._currentChildAPIBody)
      .subscribe({
        next: async (res: Blob) => {
          try {
            const buffer = await res.arrayBuffer();
            const XLSX = await import('xlsx');
            const wb = XLSX.read(buffer, { type: 'array' });
            const sheet = wb.Sheets[wb.SheetNames[0]];
  
            // 🔥 RAW DATA
            const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, {
              header: 1,
              defval: ''
            });
  
            if (!rawData.length) {
              this.isExportingExcel = false;
              return;
            }
  
            // 🔥 5th row as header
            const headerRow = rawData[3];
            const dataRows = rawData.slice(4);
  
            // Build JSON
            const jsonData = dataRows.map(row => {
              const obj: any = {};
              headerRow.forEach((key, index) => {
                if (key) {
                  obj[key] = row[index] ?? '';
                }
              });
              return obj;
            });
  
            // 🔥 Remove fully empty columns
            const finalData = jsonData.map(r => {
              const obj: any = {};
              Object.keys(r).forEach(k => {
                if (jsonData.some(row => row[k])) {
                  obj[k] = r[k];
                }
              });
              return obj;
            });
  
            if (!finalData.length) {
              this.isExportingExcel = false;
              return;
            }
  
            const blob = await this.createExcelWithHeader(
              finalData,
              this.searchThrough
            );
  
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Litigation.xlsx';
            a.click();
            URL.revokeObjectURL(url);
  
          } catch (e) {
            console.error(e);
          }
  
          this.isExportingExcel = false;
          window.scrollTo(0, scrollTop);
        },
        error: err => {
          console.error(err);
          this.isExportingExcel = false;
          window.scrollTo(0, scrollTop);
        }
      });
 
  // downloadExcel(): void {
  //   this.isExportingExcel = true;
  
  //   // Prepare request body
  //   this._currentChildAPIBody = {
  //     ...this.litigApiBody,
  //     filters: { ...this.litigApiBody.filters },
  //     filter_enable: false
  //   };
  
  //   const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  //   this.mainSearchService.litigationdownloadexcel(this._currentChildAPIBody).subscribe({
  //     next: async (res: Blob) => {
  //       try {
  //         // Step 1: Read response as ArrayBuffer
  //         const arrayBuffer = await res.arrayBuffer();
  //         const XLSX = await import('xlsx');
  //         const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  //         const sheetName = workbook.SheetNames[0];
  //         const worksheet = workbook.Sheets[sheetName];
  //         const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
  
  //         if (!jsonData.length) {
  //           this.isExportingExcel = false;
  //           return;
  //         }
  
  //         // Step 2: Identify columns that actually have values
  //         const keys = Object.keys(jsonData[0]);
  //         const validKeys = keys.filter((k: string) =>
  //           jsonData.some((row: any) => row[k] !== null && row[k] !== undefined && row[k] !== '')
  //         );
  
  //         // Step 3: Remove empty columns
  //         const filteredData = jsonData.map((row: any) => {
  //           const filteredRow: any = {};
  //           validKeys.forEach((k: string) => (filteredRow[k] = row[k]));
  //           return filteredRow;
  //         });
  
  //         // Step 4: Create new worksheet and workbook
  //         const newWorksheet = XLSX.utils.json_to_sheet(filteredData, { skipHeader: false });
  //         const colWidths = validKeys.map((key) => ({ wch: Math.max(key.length, 90) }));
  //         newWorksheet['!cols'] = colWidths;
  //         const newWorkbook = XLSX.utils.book_new();
  //         XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'FilteredData');
  
  //         // Step 5: Convert workbook to Blob for download
  //         const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
  //         const blob = new Blob([excelBuffer], {
  //           type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  //         });
  
  //         const url = window.URL.createObjectURL(blob);
  //         const a = document.createElement('a');
  //         a.href = url;
  //         a.download = 'Litigation.xlsx';
  //         document.body.appendChild(a);
  //         a.click();
  //         document.body.removeChild(a);
  //         window.URL.revokeObjectURL(url);
  
  //         this.isExportingExcel = false;
  //         window.scrollTo(0, scrollTop);
  //       } catch (error) {
  //         console.error('Excel processing error:', error);
  //         this.isExportingExcel = false;
  //         window.scrollTo(0, scrollTop);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Excel download error:', err);
  //       this._currentChildAPIBody = {
  //         ...this._currentChildAPIBody,
  //         filter_enable: false
  //       };
  //       this.isExportingExcel = false;
  //       window.scrollTo(0, scrollTop);
  //     }
  //   });
  // }
}
}