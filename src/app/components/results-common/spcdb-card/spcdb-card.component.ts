import { Component, Input, OnChanges, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
@Component({
  selector: 'app-spcdb-card',
  standalone: true,
  imports: [CommonModule,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule],
  templateUrl: './spcdb-card.component.html',
  styleUrl: './spcdb-card.component.css'
})
export class SpcdbCardComponent implements OnChanges, AfterViewInit {
  @Input() columnDefs: any[] = [];
  @Input() rowData: any[] = [];

  displayedColumns: string[] = [];
  columnHeaders: { [key: string]: string } = {};
  filterableColumns: string[] = [];
  openFilter: { [key: string]: boolean } = {};

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(private cdr: ChangeDetectorRef) { }

  ngOnChanges(): void {
    console.log('columnDefs:', this.columnDefs);
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
          console.log('✅ Showing column:', colValue);
        } else {
          console.log('🚫 Hiding column (empty data):', colValue);
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
    this.cdr.detectChanges();

  }
  activeSort: string = '';
  sortDirection: 'asc' | 'desc' | '' = '';
  sortChange(sort: Sort) {
    this.activeSort = sort.active;
    this.sortDirection = sort.direction;
  }

  scrollTable(direction: 'left' | 'right'): void {
    const container = document.querySelector('.scroll-container');
    if (container) {
      container.scrollBy({ left: direction === 'left' ? -150 : 150, behavior: 'smooth' });
    }
  }

  filterOptions: string[] = ['Starts with', 'Contains', 'Not Contains', 'Ends With', 'Equals', 'Not Equals'];

  toggleDropdown(column: any, event: MouseEvent): void {
    event.stopPropagation();
    console.log(this.openFilter);
    console.log('Dropdown open for column:', column, '->', this.openFilter[column]);

    this.openFilter[column] = !this.openFilter[column];
  }

  applyColumnFilter(column: string, event: any) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    console.log('Filter value:', value);
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const rowData = Object.values(data)
        .map(v => v?.toString().toLowerCase())
        .join(' '); // join all fields in one string

      console.log('Row data string for filter:', rowData);
      return rowData.includes(filter);
    };
    this.dataSource.filter = value;

    console.log('Applied filter to dataSource:', this.dataSource.filter);
  }

  clearFilter(column: string, input: HTMLInputElement) {
    input.value = '';
    this.dataSource.filter = '';
    this.openFilter[column] = false;
  }

  selectFilterOption(column: string, option: string): void {
    console.log(`Filter option for ${column}:`, option);
    this.openFilter[column] = false; // Close dropdown after selection
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
