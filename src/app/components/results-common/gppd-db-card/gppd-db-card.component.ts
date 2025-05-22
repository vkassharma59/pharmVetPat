import { Component, Input, OnChanges, ViewChild, AfterViewInit, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SpcdbComponent } from '../spcdb/spcdb.component';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-gppd-db-card',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule],
  templateUrl: './gppd-db-card.component.html',
  styleUrl: './gppd-db-card.component.css'

})
export class GppdDbCardComponent implements OnChanges, AfterViewInit {

  @Output() dataFetchRequest = new EventEmitter<any>();
  @Input() columnDefs: any[] = [];
  @Input() rowData: any[] = [];

  displayedColumns: string[] = [];
  columnHeaders: { [key: string]: string } = {};
  filterableColumns: string[] = [];
  openFilter: { [key: string]: boolean } = {};
  activeSort: string = '';
  sortDirection: 'asc' | 'desc' | '' = '';

  columnsSearch: { [key: string]: string } = {};
  multiSortOrder: { column: string, dir: 'asc' | 'desc' }[] = [];
  globalSearchValue: string = '';

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  searchText: string = '';
  searchColumn: string | undefined;

  constructor(private cdr: ChangeDetectorRef) { }

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

  getSortIcon(column: string): string {
    const sort = this.multiSortOrder.find(s => s.column === column);
    if (!sort) return 'fa-sort';
    return sort.dir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  onCustomSort(column: string) {
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


  fetchData() {

    const searchColumns = Object.entries(this.columnsSearch)
      .filter(([_, value]) => value && value.trim() !== '')
      .map(([key, value]) => ({
        data: key,
        searchable: true,
        search: { value: value.trim() }
      }));

    const order = this.multiSortOrder.length > 0
      ? this.multiSortOrder.map(s => ({
        column: s.column,
        dir: s.dir
      }))
      : null;

    const globalSearch = this.globalSearchValue && this.globalSearchValue.trim() !== ''
      ? { value: this.globalSearchValue.trim() }
      : null;

    const start = this.paginator ? this.paginator.pageIndex * this.paginator.pageSize : 0;
    const pageno = this.paginator ? this.paginator.pageIndex + 1 : 1;
    const payload: any = {
      start,
      pageno
    };
    if (searchColumns.length > 0) payload.columns = searchColumns;
    if (order) payload.order = order;
    if (globalSearch) payload.search = globalSearch;

    this.dataFetchRequest.emit(payload);
  }

  resetToDefault() {
    this.multiSortOrder = [];
    this.columnsSearch = {};
    this.globalSearchValue = '';
    this.fetchData();
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


  // ✅ Download as CSV
  downloadCSV() {
    let csvContent = this.displayedColumns.map(col => this.columnHeaders[col]).join(',') + '\n';
    this.dataSource.filteredData.forEach(row => {
      const rowData = this.displayedColumns.map(col => row[col]);
      csvContent += rowData.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'ExportedData.csv');
  }

  // ✅ Download as Excel
  downloadExcel() {
    const exportData = this.dataSource.filteredData.map(row => {
      const formatted: any = {};
      this.displayedColumns.forEach(col => {
        formatted[this.columnHeaders[col]] = row[col];
      });
      return formatted;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exported Data');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'ExportedData.xlsx');
  }
}


