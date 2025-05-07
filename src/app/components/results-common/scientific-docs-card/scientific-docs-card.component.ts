import { Component, ViewChild, AfterViewInit, ChangeDetectorRef, ElementRef, ViewEncapsulation,HostListener } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Sort } from '@angular/material/sort';
import { Input, } from '@angular/core';

@Component({
  selector: 'app-scientific-docs-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scientific-docs-card.component.html',
  styleUrl: './scientific-docs-card.component.css'
})
export class ScientificDocsCardComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('tableContainer') tableContainer!: ElementRef;
  @Input() data: any;
  constructor(private cdr: ChangeDetectorRef) { };
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cdr.detectChanges();
  }
  activeSort: string = '';
  sortDirection: 'asc' | 'desc' | '' = '';
  sortChange(sort: Sort) {
    this.activeSort = sort.active;
    this.sortDirection = sort.direction;
}
openFilter: { [key: string]: boolean } = {};

toggleDropdown(column: string, event: MouseEvent) {
  event.stopPropagation();
  this.openFilter[column] = !this.openFilter[column];
}
displayedColumns:any;
openDropdown: { [key: string]: boolean } = {};
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;

  const clickedInsideFilter = target.closest('.filter-container');
  if (!clickedInsideFilter) {
    // Click was outside the filter dropdowns
    Object.keys(this.openDropdown).forEach(key => this.openDropdown[key] = false);
  }
}


@HostListener('document:click')
closeDropdowns() {
  this.openFilter = {}; // close all dropdowns
}
  scrollTable(direction: 'left' | 'right') {
    const container = this.tableContainer.nativeElement as HTMLElement;
    const scrollAmount = 200;

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
  filters: { [key: string]: string } = {};

  clearFilter(column: string, input: HTMLInputElement) {
    input.value = ''; // Clear input box visually
    this.filters[column] = ''; // Clear tracking object if you use one
    this.applyAllFilters(); // Reset the data table
  }
  // applyColumnFilter(column: string, value: string) {
  //   this.filters[column] = value.trim().toLowerCase();
  //   this.applyAllFilters();
  // }
  
  applyAllFilters() {
    this.dataSource.filterPredicate = (data, filter) =>
      Object.keys(this.filters).every(key =>
        data[key]?.toString().toLowerCase().includes(this.filters[key])
      );
    this.dataSource.filter = Math.random().toString(); // Forces filter refresh
  }
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }
  filterableColumns = [ 'GBRN', 'PRODUCTNAME', 'APIAGROCHEMICALINTERMEDIATE',
    'ITEMDESCRIPTION', 'COUNTRYOFORIGIN', 'CHAPTER', 'RITCCODE', 'HSCODE',
    'TYPE', 'YEARMONTH', 'PORTOFLOADING', 'PORTCODE', 'PORTOFDISCHARGE',
    'SBILLNO', 'SBILLDATE', 'EXPORTER']; // example keys

  // applyColumnFilter(column: string, event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
  //   this.dataSource.filterPredicate = (data, filter) => {
  //     return (data[column]?.toString().toLowerCase() || '').includes(filter);
  //   };
  //   this.dataSource.filter = filterValue;
  // }
  applyColumnFilter(column: string, event: any) {
    const value = event.target.value.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: any, filter: string) =>
      data[column]?.toString().toLowerCase().includes(filter);
    this.dataSource.filter = value;
    
  }

  // ✅ Download as PDF
  downloadPDF() {
    const doc = new jsPDF();
    const colHeaders = this.displayedColumns.map(col => this.columnHeaders[col]);
    const rowData = this.dataSource.filteredData.map(row => this.displayedColumns.map(col => row[col]));

    (doc as any).autoTable({
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
    const worksheet = XLSX.utils.json_to_sheet(this.dataSource.filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exported Data');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'ExportedData.xlsx');
  }
  
}

