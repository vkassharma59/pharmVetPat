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
@Component({
  selector: 'app-spcdb-card',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule],
  templateUrl: './spcdb-card.component.html',
  styleUrl: './spcdb-card.component.css'
})

export class SpcdbCardComponent implements OnChanges, AfterViewInit {

  @Output() dataFetchRequest = new EventEmitter<any>();
  @Input() columnDefs: any[] = [];
  @Input() rowData: any[] = [];
  data?: {
    data?: any[]; // Replace `any` with your actual data type
  };
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
    private mainSearchService: MainSearchService
  ) { }

  ngOnChanges(): void {
    //console.log('columnDefs:', this.columnDefs);
    // Reset counter only when the component is first loaded

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
          //console.log('🚫 Hiding column (empty data):', colValue);
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
  getAllDataFromApi(): Observable<any[]> {
    const requestBody = {
      ...this._currentChildAPIBody,
      start: 0,
      length: this._currentChildAPIBody?.count || 1000,
    };
    console.log('📦  response body:', requestBody);
    return this.mainSearchService.NonPatentSearchSpecific(requestBody).pipe(
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
  downloadPDF(): void {
    this.getAllDataFromApi().subscribe(data => {
      const exportData = data.map(row => {
        return this.displayedColumns.map(col => row[col] !== undefined ? String(row[col]) : '');
      });

      const colHeaders = this.displayedColumns.map(col => this.toTitleCase(col));

      const doc = new jsPDF({
        orientation: 'landscape', // More space for wide tables
        unit: 'pt',
        format: 'A4'
      });

      autoTable(doc, {
        head: [colHeaders],
        body: exportData,
        startY: 40,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 4,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        bodyStyles: {
          valign: 'top'
        },
        columnStyles: {
          // Example: fixed width for specific column index
          // 0: {cellWidth: 80}, 
          // 2: {cellWidth: 120}
        }
      });

      doc.save('ExportedData.pdf');
    });
  }
  // Optional helper to capitalize column names
  toTitleCase(str: string): string {
    return str.replace(/_/g, ' ')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  downloadCSV(): void {
    this.getAllDataFromApi().subscribe(data => {
      let csvContent = this.displayedColumns.join(',') + '\n';

      data.forEach(row => {
        const rowData = this.displayedColumns.map(col => {
          let cell = row[col] !== undefined ? row[col] : '';
          // Escape quotes and wrap in quotes if necessary
          cell = String(cell).replace(/"/g, '""');
          if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
            cell = `"${cell}"`;
          }
          return cell;
        });
        csvContent += rowData.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'ExportedData.csv');
    });
  }
  // ✅ Download as Excel
  downloadExcel(): void {
    this.getAllDataFromApi().subscribe(data => {
      const exportData = data.map(row => {
        const formatted: any = {};
        this.displayedColumns.forEach(col => {
          formatted[col] = row[col] !== undefined ? row[col] : '';
        });
        return formatted;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      // Set custom widths for each column (in characters)
      worksheet["!cols"] = this.displayedColumns.map(() => ({ wch: 30 })); // 30 char width per column

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Exported Data');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      saveAs(blob, 'ExportedData.xlsx');
    });
  }
}
