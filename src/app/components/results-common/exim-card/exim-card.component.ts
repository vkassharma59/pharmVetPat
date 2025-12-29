import { Component, Input, OnChanges, ViewChild, AfterViewInit, ChangeDetectorRef, EventEmitter, Output, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ViewChildren, ElementRef, QueryList } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { UserPriviledgeService } from '../../../services/user_priviledges/user-priviledge.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-exim-card',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule],
  templateUrl: './exim-card.component.html',
  styleUrl: './exim-card.component.css'
})
export class EximCardComponent implements OnChanges, AfterViewInit {
  @Output() dataFetchRequest = new EventEmitter<any>();
  @Input() columnDefs: any[] = [];
  @Input() rowData: any[] = [];
  isExportingCSV: boolean = false;
  isExportingExcel: boolean = false;
  data?: {
    data?: any[]; // Replace `any` with your actual data type
  };
  _currentChildAPIBody: any;
  loading = false;
  displayedColumns: string[] = [];
  columnHeaders: { [key: string]: string } = {};
  filterableColumns: string[] = [];
  openFilter: { [key: string]: boolean } = {};
  activeSort: string = '';
  sortDirection: 'asc' | 'desc' | '' = '';
  columnsFilterType: { [key: string]: string } = {};
  columnsSearch: { [key: string]: string } = {};
  multiSortOrder: { column: number, dir: 'asc' | 'desc' }[] = [];
  noMatchingData: boolean = false;
  globalSearchValue: string = '';
  searchThrough: string = '';
  get pageSize(): number {
    return this._currentChildAPIBody?.length || 25;
  }
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChildren('filterInput') filterInputs!: QueryList<ElementRef<HTMLInputElement>>;

  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
  }
  searchText: string = '';
  searchColumn: string | undefined;
  openDropdownColumn: string | null = null;
  showPaginator: boolean = false;
  constructor(private cdr: ChangeDetectorRef,
    private mainSearchService: MainSearchService,
    private UserPriviledgeService: UserPriviledgeService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rowData']) {
      console.log("📥 rowData received in child →", this.rowData);
    }
    if (changes['columnDefs']) {
      console.log("📥 columnDefs received in child →", this.columnDefs);
    }
    if (this.columnDefs && this.columnDefs.length > 0) {
      this.displayedColumns = [];
      this.columnHeaders = {};
      this.filterableColumns = [];

      // Check which columns have at least one non-empty value
      for (const col of this.columnDefs) {
        const colValue = col.value;

        const hasData = this.rowData?.some(row =>
          row[colValue] !== null && row[colValue] !== undefined && row[colValue] !== ''
        );

        if (hasData) {
          this.displayedColumns.push(colValue); // ✅ Only include columns with at least one value
          this.columnHeaders[colValue] = col.label;
          this.filterableColumns.push(colValue);
        } else {

        }
      }
    }
    if (this.rowData) {
      this.dataSource.data = this.rowData;
      this.noMatchingData = this.rowData.length === 0;
    }
  }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.paginator.page.subscribe(() => this.fetchData());

    this.cdr.detectChanges();
  }
  handleLoadingState(data: any) {
    this.loading = data;
  }

  scrollTable(direction: 'left' | 'right'): void {
    const container = document.querySelector('.scroll-container');
    if (container) {
      container.scrollBy({ left: direction === 'left' ? -150 : 150, behavior: 'smooth' });
    }
  }
  filterState(column: string, type: string) {
    if (!type) {
      // No Filter selected
      delete this.columnsFilterType[column];
      delete this.columnsSearch[column];
    } else {
      this.columnsFilterType[column] = type || 'contains';
    }

    console.log("🔍 Filter Payload →", {
      column,
      type: this.columnsFilterType[column],
      value: this.columnsSearch[column]
    });

    this.fetchData();
    this.openDropdownColumn = null; // dropdown close
  }
  applyFilter(columnKey: string, filterValue: string, filterType: string) {
    if (filterValue && filterValue.trim() !== '') {
      this.columnsSearch[columnKey] = filterValue.trim();
      this.columnsFilterType[columnKey] = filterType || 'contains';
    } else {
      delete this.columnsSearch[columnKey];
      delete this.columnsFilterType[columnKey];
    }

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.fetchData();

    console.log("🔍 Applied API filter →", {
      columnKey,
      type: this.columnsFilterType[columnKey],
      value: this.columnsSearch[columnKey]
    });
  }

  // ✅ clearFilter now only resets API filters
  clearFilter(columnKey: string, inputRef: HTMLInputElement) {
    inputRef.value = '';

    delete this.columnsSearch[columnKey];
    delete this.columnsFilterType[columnKey];

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.fetchData();

    console.log("🧹 Cleared filter for column:", columnKey);
  }
  searchInColumn(column: any, filterInput: HTMLInputElement, event: MouseEvent): void {
    event.stopPropagation(); // prevent sort from triggering

    if (filterInput.value.trim() === '') {
      this.clearFilter(column.value, filterInput);
      return;
    }

    const searchValue = filterInput.value.trim();
    const columnKey = column.value;

    if (searchValue) {
      this.columnsSearch[columnKey] = searchValue;
    } else {
      delete this.columnsSearch[columnKey];
    }

    this.fetchData();
  }
  toggleDropdown(columnValue: string) {
    if (this.openDropdownColumn === columnValue) {
      // If already open, close it
      this.openDropdownColumn = null;
    } else {
      // Open this column's dropdown
      this.openDropdownColumn = columnValue;
    }
  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // If clicked element is NOT inside .filterDropdown or .filterIcon, close dropdown
    if (!target.closest('.filterDropdown') && !target.closest('.filterIcon')) {
      this.openDropdownColumn = null;
    }
  }
  onCustomSort(column: number) {
    const existing = this.multiSortOrder.find(s => s.column === column);
    if (existing) {
      // Toggle direction
      existing.dir = existing.dir === 'desc' ? 'asc' : 'desc';
    } else {
      // Add new column with default 'desc'
      this.multiSortOrder.push({ column, dir: 'desc' });
    }

    this.fetchData(); // Call API with updated sort order
  }

  toggleSort(index: number): void {
    const existingSort = this.multiSortOrder.find(s => s.column === index);
    let newDir: 'asc' | 'desc' = 'asc';

    if (existingSort) {
      newDir = existingSort.dir === 'asc' ? 'desc' : 'asc';
      this.multiSortOrder = this.multiSortOrder.filter(s => s.column !== index);
    }

    this.multiSortOrder.push({ column: index, dir: newDir });
    this.fetchData();
  }

  getCountryUrl(value: any) {
    return `${environment.baseUrl}${environment.countryNameLogoDomain}${value?.COUNTRY_OF_ORIGIN}.png`;
  }
  getSortIcon(index: number): string {
    const column = this.displayedColumns[index];
    const sort = this.multiSortOrder.find(s => s.column === index);
    if (!sort) return 'fa-sort';
    return sort.dir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  fetchData() {
    const isGlobalSearch = this.globalSearchValue && this.globalSearchValue.trim() !== '';
    console.log("🔎 Global Search Active:", isGlobalSearch, "Value:", this.globalSearchValue);

    const allColumns = isGlobalSearch
      ? this.displayedColumns.map(col => ({
        data: col,
        searchable: true
      }))
      : undefined;
    console.log("🟢 All Columns for Global Search:", allColumns);

    const searchColumns = Object.entries(this.columnsSearch)
      .filter(([_, value]) => value && value.trim() !== '')
      .map(([key, value]) => ({
        data: key,
        searchable: true,
        search: {
          value: value.trim(),
          type: this.columnsFilterType[key] || 'contains' // default to contains
        }
      }));
    console.log("🟡 Column-Specific Filters:", searchColumns);

    const order = this.multiSortOrder.length > 0
      ? this.multiSortOrder
        .filter(s => typeof s.column === 'number')
        .map(s => {
          console.log('↕️ Sorting applied →', { columnIndex: s.column, direction: s.dir });
          return { column: s.column, dir: s.dir };
        })
      : null;
    console.log("🔵 Current Sort Order:", order);

    const globalSearch = isGlobalSearch
      ? { value: this.globalSearchValue.trim() }
      : null;

    if (isGlobalSearch || Object.keys(this.columnsSearch).length < 25) {
      if (this.paginator) {
        this.paginator.firstPage();
        console.log("📌 Paginator reset to first page due to search/filter");
      }
    }

    const start = this.paginator ? this.paginator.pageIndex * this.paginator.pageSize : 0;
    const pageno = this.paginator ? this.paginator.pageIndex + 1 : 1;
    console.log("📏 Pagination → start:", start, "page no:", pageno);

    const payload: any = { start, pageno };

    if (isGlobalSearch && allColumns) {
      payload.columns = allColumns;
      payload.search = globalSearch;
    } else if (searchColumns.length > 0) {
      payload.columns = searchColumns;
    }
    if (order) payload.order = order;

    console.log("📤 Final API Payload →", JSON.stringify(payload, null, 2));

    // Send request
    this.dataFetchRequest.emit(payload);

    // Wait for API response & table update
    setTimeout(() => {
      const currentData = this.dataSource.filteredData || [];
      console.log("📥 Data received →", this.dataSource.data); // full raw data
      console.log("📊 Rows after filter:", currentData.length);

      this.noMatchingData = currentData.length === 0;
      console.log("⚠️ No matching data:", this.noMatchingData);
    }, 300);
  }
  onFlagError(event: any) {
    event.target.src = 'assets/images/flag.png';
  }
isISODate(value: any): boolean {
  if (typeof value !== 'string') return false;

  // ISO format flexible pattern (with optional milliseconds/timezone)
  const isoPattern = /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;

  return isoPattern.test(value) && !isNaN(Date.parse(value.replace(' ', 'T')));
}

  resetToDefault() {
    this.multiSortOrder = [];
    this.columnsSearch = {};
    this.globalSearchValue = '';
    this.filterInputs.forEach(inputRef => inputRef.nativeElement.value = '');
    this.fetchData();
  }
  fetchAndStoreVerticalLimits(): void {
    this.UserPriviledgeService.getverticalcategoryData().subscribe({
      next: (res: any) => {
        const verticals = res?.data?.verticals;

        if (Array.isArray(verticals)) {
          localStorage.setItem('vertical_limits', JSON.stringify(verticals));

          const pharmaVertical = verticals.find(
            (v: any) => v.slug === 'pharmvetpat-mongodb' && v.report_limit != null
          );

          if (pharmaVertical) {
            localStorage.setItem('report_limit', String(pharmaVertical.report_limit));
          } else {
            console.warn('PharmVetPat MongoDB vertical not found or report_limit is null');
          }
        }
      },
      error: err => console.error('Vertical limit fetch failed:', err),
    });
  }
  getReportLimit(): number {
    // Step 1: Try privilege_json first
    const priv = JSON.parse(localStorage.getItem('priviledge_json') || '{}');
    const privLimit = Number(priv['pharmvetpat-mongodb']?.ReportLimit);

    if (!isNaN(privLimit) && privLimit > 0) {
      return privLimit;
    }

    // Step 2: Try vertical report_limit from localStorage
    const storedLimit = Number(localStorage.getItem('report_limit'));

    if (!isNaN(storedLimit) && storedLimit > 0) {
      return storedLimit;
    }

    // Step 3: Default fallback
    return 500;
  }

  getAllDataFromApi(): Observable<any[]> {
    const requestBody = {
      ...this._currentChildAPIBody,
      page_no: 1, start: 0,
      length: this.getReportLimit()
    };

    console.log('📦  response body:', requestBody);
    return this.mainSearchService.EximDataSearchSpecific(requestBody).pipe(
      tap((result: EximCardComponent) => {
        console.log('📦 Full API response:', result);
      }),
      map((result: EximCardComponent) => result?.data?.data || []),
      catchError(error => {
        console.error('❌ Error fetching all data:', error);
        return of([]); // Return an empty array on error
      })
    );
  }



  downloadPDF() {
    const doc = new jsPDF();
    const colHeaders = this.displayedColumns.map(col => this.columnHeaders[col]);
    const rowData = this.dataSource.filteredData.map(row => this.displayedColumns.map(col => row[col]));

    autoTable(doc, {
      head: [colHeaders],
      body: rowData
    });

    doc.save('ExportedData.pdf');
  }
  // // Optional helper to capitalize column names
  // toTitleCase(str: string): string {
  //   return str.replace(/_/g, ' ')
  //     .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  // }

  // 3️⃣ Download CSV
  downloadCSV(): void {
    this.isExportingCSV = true;
    this.getAllDataFromApi().subscribe(data => {
      // Generate header row with Title Case
      const headerRow = this.displayedColumns.map(col => this.toTitleCase(col)).join(',') + '\n';
      let csvContent = headerRow;

      data.forEach(row => {
        const rowData = this.displayedColumns.map(col => {
          let value = row[col];

          // Apply same formatting as Excel export
          if (Array.isArray(value)) {
            value = value.join(', ');
          } else if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          } else if (value === null || value === undefined) {
            value = '';
          }

          // Escape quotes and commas for CSV
          let cell = String(value).replace(/"/g, '""');
          if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
            cell = `"${cell}"`;
          }
          return cell;
        });

        csvContent += rowData.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'ExportedData.csv');
      this.isExportingCSV = false;
    });
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
  const worksheet = workbook.addWorksheet('EXIM');
  
    // ================= HEADER INFO =================
    const dateStr = this.formatDate();
    const title = 'EXIM DATA REPORT';
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
  // 4️⃣ Download Excel
  downloadExcel(): void {
    this.isExportingExcel = true;
  
    const scrollTop =
      window.pageYOffset || document.documentElement.scrollTop;
  
    this.getAllDataFromApi().subscribe({
      next: async (data: any[]) => {
        try {
          if (!data || !data.length) {
            this.isExportingExcel = false;
            return;
          }
  
          // ================= BUILD DATA SAME FORMAT =================
          const jsonData = data.map(row => {
            const obj: any = {};
            this.displayedColumns.forEach(col => {
              let value = row[col];
  
              if (Array.isArray(value)) {
                value = value.join(', ');
              } else if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value);
              }
  
              obj[this.toTitleCase(col)] = value ?? '';
            });
            return obj;
          });
  
          // ================= REMOVE FULLY EMPTY COLUMNS =================
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
  
          // ================= CREATE EXCEL (COMMON FUNCTION) =================
          const blob = await this.createExcelWithHeader(
            finalData,
            this.searchThrough || 'ALL DATA'
          );
  
          // ================= DOWNLOAD =================
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'EXIM.xlsx';
          a.click();
          URL.revokeObjectURL(url);
  
        } catch (err) {
          console.error(err);
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
  }
  // ✅ Optional: Capitalize headers
  toTitleCase(str: string): string {
    return str.replace(/_/g, ' ')
      .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

}