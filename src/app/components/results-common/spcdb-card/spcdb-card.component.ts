import { Component, Input, OnChanges, ViewChild, AfterViewInit, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ViewChildren, ElementRef, QueryList } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { AppConfigValues } from '../../../config/app-config';
import * as ExcelJS from 'exceljs';
import { UserPriviledgeService } from '../../../services/user_priviledges/user-priviledge.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-spcdb-card',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,

  ],

  templateUrl: './spcdb-card.component.html',
  styleUrl: './spcdb-card.component.css'
})

export class SpcdbCardComponent implements OnChanges, AfterViewInit {

  @Output() dataFetchRequest = new EventEmitter<any>();
  @Input() columnDefs: any[] = [];
  @Input() rowData: any[] = [];
  isExportingCSV: boolean = false;
  isExportingExcel: boolean = false;
  data?: {
    data?: any[]; // Replace `any` with your actual data type
  };
  apiUrls = AppConfigValues.appUrls;
  _currentChildAPIBody: any;
  displayedColumns: string[] = [];
  columnHeaders: { [key: string]: string } = {};
  filterableColumns: string[] = [];
  openFilter: { [key: string]: boolean } = {};
  activeSort: string = '';
  sortDirection: 'asc' | 'desc' | '' = '';
  noMatchingData: boolean = false;
  columnsSearch: { [key: string]: string } = {};
  multiSortOrder: { column: number, dir: 'asc' | 'desc' }[] = [];

  globalSearchValue: string = '';
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

  constructor(private cdr: ChangeDetectorRef,
    private mainSearchService: MainSearchService,
    private UserPriviledgeService: UserPriviledgeService
  ) { }

  ngOnChanges(): void {
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
  onFlagError(event: any) {
    event.target.src = 'assets/images/flag.png';
  }
  isISODate(value: any): boolean {
  if (typeof value !== 'string') return false;

  // ISO format flexible pattern (with optional milliseconds/timezone)
  const isoPattern = /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;

  return isoPattern.test(value) && !isNaN(Date.parse(value.replace(' ', 'T')));
}

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.paginator.page.subscribe(() => this.fetchData());

    this.cdr.detectChanges();
  }
  getCountryUrl(value: any) {
    return `${environment.baseUrl}${environment.countryNameLogoDomain}${value?.country}.png`;
  }
  scrollTable(direction: 'left' | 'right'): void {
    const container = document.querySelector('.scroll-container');
    if (container) {
      container.scrollBy({ left: direction === 'left' ? -150 : 150, behavior: 'smooth' });
    }
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

  clearFilter(column: string, input: HTMLInputElement) {
    input.value = '';
    delete this.columnsSearch[column];
    this.fetchData();
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

  getSortIcon(index: number): string {
    const column = this.displayedColumns[index];
    const sort = this.multiSortOrder.find(s => s.column === index);
    if (!sort) return 'fa-sort';
    return sort.dir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  fetchData() {
    const isGlobalSearch = this.globalSearchValue && this.globalSearchValue.trim() !== '';
    // Add columns for global search: all displayedColumns with searchable: true
    const allColumns = isGlobalSearch
      ? this.displayedColumns.map(col => ({
        data: col,
        searchable: true
      }))
      : undefined;

    // Add only filtered columns for column search
    const searchColumns = !isGlobalSearch
      ? Object.entries(this.columnsSearch)
        .filter(([_, value]) => value && value.trim() !== '')
        .map(([key, value]) => ({
          data: key,
          searchable: true,
          search: { value: value.trim() }
        }))
      : [];
    const order = this.multiSortOrder.length > 0
      ? this.multiSortOrder
        .filter(s => typeof s.column === 'number')
        .map(s => {
          console.log('Sorting index:', s.column, 'direction:', s.dir);
          return {
            column: s.column,
            dir: s.dir
          };
        })
      : null;
    // const order = this.multiSortOrder.length > 0
    //   ? this.multiSortOrder.map(s => ({
    //     column: s.column,
    //     dir: s.dir
    //   }))
    //   : null;

    const globalSearch = isGlobalSearch
      ? { value: this.globalSearchValue.trim() }
      : null;

    const start = this.paginator ? this.paginator.pageIndex * this.paginator.pageSize : 0;
    const pageno = this.paginator ? this.paginator.pageIndex + 1 : 1;

    const payload: any = {
      start,
      pageno
    };
    console.log("payload data ", payload)
    if (isGlobalSearch && allColumns) {
      payload.columns = allColumns;
      payload.search = globalSearch;
    } else if (searchColumns.length > 0) {
      payload.columns = searchColumns;
    }
    if (order) payload.order = order;
    this.dataFetchRequest.emit(payload);
    // Simulate check until API updates data
    setTimeout(() => {
      const currentData = this.dataSource.filteredData || [];
      this.noMatchingData = currentData.length === 0;
    }, 300);
  }
  resetToDefault() {
    this.multiSortOrder = [];
    this.columnsSearch = {};
    this.globalSearchValue = '';
    // Clear all input boxes in DOM (filters)
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
    // this.fetchAndStoreVerticalLimits();
    const requestBody = {
      ...this._currentChildAPIBody,
      page_no: 1,
      start: 0,
      length: this.getReportLimit()
      // length: reportLimit,
    };

    console.log('📦  response body:', requestBody);
    return this.mainSearchService.spcdbSearchSpecific(requestBody).pipe(
      tap((result: SpcdbCardComponent) => {
        console.log('📦 Full API response:', result);
      }),
      map((result: SpcdbCardComponent) => result?.data?.data || []),
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
            // Escape quotes and commas for CSV
            let cell = String(value).replace(/"/g, '""');
            if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
              cell = `"${cell}"`;
            }
            return cell;
          });

          csvContent += rowData.join(',') + '\n';
        });
        csvContent += rowData.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'ExportedData.csv');
      this.isExportingCSV = false;
    });
  }
  // 4️⃣ Download Excel
  downloadExcel(): void {
    this.isExportingExcel = true;
    this.getAllDataFromApi().subscribe(data => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Exported Data');
      // Define header columns
      const columns = this.displayedColumns.map(col => ({
        header: this.toTitleCase(col),
        key: col,
      }));
      worksheet.columns = columns;
      // Add formatted data rows
      data.forEach(row => {
        const formattedRow: any = {};
        this.displayedColumns.forEach(col => {
          let value = row[col];
          if (Array.isArray(value)) {
            value = value.join(', ');
          } else if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          }
          formattedRow[col] = value !== undefined ? value : '';
        });
        worksheet.addRow(formattedRow);
      });
      // ✅ ADD AUTO-WIDTH ADJUSTMENT HERE
      this.displayedColumns.forEach((col, index) => {
        const excelCol = worksheet.getColumn(index + 1);
        let maxLength = col.length;
        excelCol.eachCell({ includeEmpty: true }, cell => {
          const cellValue = cell.value ? cell.value.toString() : '';
          if (cellValue.length > maxLength) {
            maxLength = cellValue.length;
          }
        });
        excelCol.width = maxLength + 6;
      });
      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell(cell => {
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFFFF' },
          size: 15
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4169E1' } // Dark blue
        };
        cell.alignment = { horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      // Save workbook
      workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, 'ExportedDataFormatted.xlsx');
        this.isExportingExcel = false;
        this.isExportingExcel = false;
        this.isExportingExcel = false;
      });
    });
  }
  // ✅ Optional: Capitalize headers
  toTitleCase(str: string): string {
    return str.replace(/_/g, ' ')
      .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

}
