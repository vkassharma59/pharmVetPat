import { Component, Input, OnChanges, ViewChild, AfterViewInit, ChangeDetectorRef, EventEmitter, Output, SimpleChanges, HostListener } from '@angular/core';
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
import * as ExcelJS from 'exceljs';
import { UserPriviledgeService } from '../../../services/user_priviledges/user-priviledge.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-active-patent-card',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule],
  templateUrl: './active-patent-card.component.html',
  styleUrl: './active-patent-card.component.css'
})

export class ActivePatentCardComponent implements OnChanges, AfterViewInit {

  @Output() dataFetchRequest = new EventEmitter<any>();
  @Input() columnDefs: any[] = [];
  @Input() rowData: any[] = [];
  isExportingCSV: boolean = false;
  isExportingExcel: boolean = false;
  data?: {
    data?: any[];
  };
  _currentChildAPIBody: any;
  displayedColumns: string[] = [];
  columnHeaders: { [key: string]: string } = {};
  filterableColumns: string[] = [];
  openFilter: { [key: string]: boolean } = {};
  activeSort: string = '';
  sortDirection: 'asc' | 'desc' | '' = '';
  noMatchingData: boolean = false; columnsSearch: { [key: string]: string } = {};
  multiSortOrder: { column: number, dir: 'asc' | 'desc' }[] = [];
  ListView: boolean = true;
  viewMode: 'list' | 'grid' | 'detail' = 'grid';
  items: any[] = [];       // API se pura list ayega
  selectedItem: any = null;
  GridView: boolean = false;
  globalSearchValue: string = '';
  columns: any;
  selectedIndex: number | null = null;
  get pageSize(): number {
    return this._currentChildAPIBody?.length || 25;
  }
  dataSource = new MatTableDataSource<any>([]);
  openDropdownColumn: string | null = null;
  showPaginator: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChildren('filterInput') filterInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChild('rightSection') rightSection!: ElementRef;

  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
  }
  searchText: string = '';
  searchColumn: string | undefined;
  columnsFilterType: { [key: string]: string } = {};
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
  setViewMode(mode: 'grid' | 'list' | 'detail') {
    this.viewMode = mode;
    console.log('View mode set to:', this.viewMode);
  }
  ngOnInit() {
    // Pehle columns le aao
    this.mainSearchService.getactivePatentColumnList().subscribe((columns: any) => {
      this.columns = columns; // yeh table ke liye headers hain
    });

    // Fir data le aao
    const props = {
      searchText: '',   // agar kuch search karna ho
      filters: {},      // filters bhej sakte ho
      page: 1,
      pageSize: 50
    };

    this.mainSearchService.activePatentSearchSpecific(props).subscribe((response: any) => {
      this.items = response.data;  // yahan se actual rows ka data milega
    });
  }

  showDetails(item: any, index: number) {
    this.selectedItem = item;
    this.selectedIndex = index + 1; // numbering maintain
    console.log("Selected Index:", this.selectedIndex, "Item:", item);
    this.resetScroll();

  }
  toggleDetailView() {
    if (this.viewMode === 'detail') {
      this.setViewMode('list'); // go back to list
      this.selectedItem = null; // optional: clear selection
    } else {
      this.setViewMode('detail'); // go to detail
    }
  }
  resetScroll() {
    setTimeout(() => {
      if (this.rightSection && this.rightSection.nativeElement) {
        this.rightSection.nativeElement.scrollTop = 0;
      }
    }, 0);
  }
  scrollTable(direction: 'left' | 'right'): void {
    const container = document.querySelector('.scroll-container');
    if (container) {
      container.scrollBy({ left: direction === 'left' ? -150 : 150, behavior: 'smooth' });
    }
  }
  getCompanyURL(value: any) {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${value?.company}.png`;
  }
  getCountryUrl(value: any) {
    return `${environment.baseUrl}${environment.countryNameLogoDomain}${value?.country}.png`;
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
  getCompanyLogo(value: any): string {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${value?.company_logo}`;
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
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.fetchData();
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
  toggleView(view: 'list' | 'grid'): void {
    if (view === 'list') {
      this.ListView = true;
      this.GridView = false;
    } else if (view === 'grid') {
      this.ListView = false;
      this.GridView = true;
    }
    // Reset pagination when toggling views
    if (this.paginator) {
      this.paginator.pageIndex = 0;
      this.fetchData();
    }
  }

  resetToDefault() {
    this.multiSortOrder = [];
    this.columnsSearch = {};
    this.columnsFilterType = {};
    this.globalSearchValue = '';
    
    // Clear all input boxes in DOM (filters)
    this.filterInputs.forEach(inputRef => inputRef.nativeElement.value = '');
  
    // Reset paginator
    if (this.paginator) this.paginator.firstPage();
  
    // ✅ Fetch full original data from API
    this.getAllDataFromApi().subscribe(data => {
      this.rowData = data;            // Update rowData
      this.dataSource.data = this.rowData;  // Update dataSource
  
      // Update paginator visibility dynamically
      this.showPaginator = this.rowData.length > this.pageSize;
  
      console.log("🔄 Table reset to default, full data fetched →", this.rowData);
      this.noMatchingData = !this.rowData || this.rowData.length === 0;
    });

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

    return this.mainSearchService.activePatentSearchSpecific(requestBody).pipe(
      tap((result: ActivePatentCardComponent) => {
      }),
      map((result: ActivePatentCardComponent) => result?.data?.data || []),
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
      });
    });
  }



  // ✅ Optional: Capitalize headers
  toTitleCase(str: string): string {
    return str.replace(/_/g, ' ')
      .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

}

