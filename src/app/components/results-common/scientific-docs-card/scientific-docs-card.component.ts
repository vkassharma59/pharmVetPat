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

@Component({
  selector: 'app-scientific-docs-card',
  standalone: true,
  imports: [CommonModule,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule],
  templateUrl: './scientific-docs-card.component.html',
  styleUrl: './scientific-docs-card.component.css'
})
export class ScientificDocsCardComponent implements OnChanges, AfterViewInit {
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

  // ngOnChanges(): void {
  //   if (this.columnDefs) {
  //     this.displayedColumns = this.columnDefs.map(col => col.value);
  //     this.columnHeaders = this.columnDefs.reduce((acc, col) => {
  //       acc[col.value] = col.label;
  //       if (col.filterable) this.filterableColumns.push(col.value);
  //       return acc;
  //     }, {} as any);
  //   }

  //   if (this.rowData) {
  //     this.dataSource = new MatTableDataSource(this.rowData);
  //   }
  // }

  //  ngOnChanges(): void {
  //   console.log('columnDefs:', this.columnDefs); // 👈 Check incoming value

  //   if (this.columnDefs && this.columnDefs.length > 0) {
  //     this.displayedColumns = this.columnDefs.map(col => col.value);
  //     this.columnHeaders = {};
  //     this.filterableColumns = [];

  //     this.columnDefs.forEach(col => {
  //       this.columnHeaders[col.value] = col.label;
  //     if (col.filterable == true || col.filterable == 'true') {
  //         this.filterableColumns.push(col.value);
  //         console.log('Filterable Columns------------------:',this.filterableColumns);
  //       }
  //     });
  //     console.log('Filterable Columns:', this.filterableColumns);
  //     console.log('Filterable Column Labels:', this.filterableColumns.map(col => this.columnHeaders[col]));
  //   }

  //   if (this.rowData) {
  //     this.dataSource.data = this.rowData;
  //   }
  // }

  ngOnChanges(): void {
    console.log('columnDefs:', this.columnDefs);

    if (this.columnDefs && this.columnDefs.length > 0) {
      this.displayedColumns = this.columnDefs.map(col => col.value);
      this.columnHeaders = {};
      this.filterableColumns = [];

      this.columnDefs.forEach(col => {
        this.columnHeaders[col.value] = col.label;
        this.filterableColumns.push(col.value);
        console.log('✅ Added filterable column:', col.value);
      });
      console.log('✅ Final Filterable Columns:', this.filterableColumns);
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

  // applyColumnFilter(column: string, event: any): void {
  //   const value = event.target.value?.trim().toLowerCase();
  //   this.dataSource.filterPredicate = (data, filter) =>
  //     data[column]?.toLowerCase().includes(filter);
  //   this.dataSource.filter = value;
  // }

  // toggleDropdown(column: string, event: MouseEvent ): void {
  //   event.stopPropagation();
  //   this.openFilter[column] = !this.openFilter[column];
  // }

  // clearFilter(column: string, input: HTMLInputElement): void {
  //   input.value = '';
  //   this.applyColumnFilter(column, { target: { value: '' } });
  // }

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


  // applyColumnFilter(column: string, event: KeyboardEvent) {
  //   const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
  //   this.dataSource.filterPredicate = (data: any, filter: string) => {
  //     return data[column]?.toString().toLowerCase().includes(filter);
  //   };
  //   this.dataSource.filter = value;
  // }
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

  // selectFilterCondition(column: string, condition: string) {
  //   console.log('Selected filter condition:', condition, 'for column:', column);
  //   // You can apply condition logic here later
  // }
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
