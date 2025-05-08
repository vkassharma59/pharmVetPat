// import { Component, ViewChild, AfterViewInit, ChangeDetectorRef, ElementRef, ViewEncapsulation,HostListener } from '@angular/core';
// import { MatTableDataSource } from '@angular/material/table';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';
// import { CommonModule } from '@angular/common';
// import { MatTableModule } from '@angular/material/table';
// import { MatPaginatorModule } from '@angular/material/paginator';
// import { MatSortModule } from '@angular/material/sort';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
// import { Sort } from '@angular/material/sort';
// import { Input, } from '@angular/core';

// @Component({
//   selector: 'app-scientific-docs-card',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './scientific-docs-card.component.html',
//   styleUrl: './scientific-docs-card.component.css'
// })
// export class ScientificDocsCardComponent {
//   @ViewChild(MatPaginator) paginator!: MatPaginator;
//   @ViewChild(MatSort) sort!: MatSort;
//   @ViewChild('tableContainer') tableContainer!: ElementRef;
//   @Input() data: any;
//   constructor(private cdr: ChangeDetectorRef) { };
  

//   activeSort: string = '';
//   sortDirection: 'asc' | 'desc' | '' = '';
//   sortChange(sort: Sort) {
//     this.activeSort = sort.active;
//     this.sortDirection = sort.direction;
// }
// openFilter: { [key: string]: boolean } = {};

// toggleDropdown(column: string, event: MouseEvent) {
//   event.stopPropagation();
//   this.openFilter[column] = !this.openFilter[column];
// }
// displayedColumns:any;
// openDropdown: { [key: string]: boolean } = {};
// @HostListener('document:click', ['$event'])
// onDocumentClick(event: MouseEvent): void {
//   const target = event.target as HTMLElement;

//   const clickedInsideFilter = target.closest('.filter-container');
//   if (!clickedInsideFilter) {
//     // Click was outside the filter dropdowns
//     Object.keys(this.openDropdown).forEach(key => this.openDropdown[key] = false);
//   }
// }


// @HostListener('document:click')
// closeDropdowns() {
//   this.openFilter = {}; // close all dropdowns
// }
//   scrollTable(direction: 'left' | 'right') {
//     const container = this.tableContainer.nativeElement as HTMLElement;
//     const scrollAmount = 200;

//     if (direction === 'left') {
//       container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
//     } else {
//       container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
//     }
//   }
//   filters: { [key: string]: string } = {};

//   clearFilter(column: string, input: HTMLInputElement) {
//     input.value = ''; // Clear input box visually
//     this.filters[column] = ''; // Clear tracking object if you use one
//     this.applyAllFilters(); // Reset the data table
//   }
//   // applyColumnFilter(column: string, value: string) {
//   //   this.filters[column] = value.trim().toLowerCase();
//   //   this.applyAllFilters();
//   // }
  
//   applyAllFilters() {
//     this.dataSource.filterPredicate = (data, filter) =>
//       Object.keys(this.filters).every(key =>
//         data[key]?.toString().toLowerCase().includes(this.filters[key])
//       );
//     this.dataSource.filter = Math.random().toString(); // Forces filter refresh
//   }
// }
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource,MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-scientific-docs-card',
  standalone: true,
  imports: [CommonModule,MatTableModule],
  templateUrl: './scientific-docs-card.component.html',
  styleUrl: './scientific-docs-card.component.css'
})
export class ScientificDocsCardComponent implements OnChanges {

  @Input() currentChildAPIBody: any;
  @Input() columnDefs: { value: string; name: string }[] = [];

get displayedColumns(): string[] {
  return this.columnDefs.map(col => col.value);
}

  @Input()
  set data(value: any) {
    if (value?.data) {
      this._data = value.data;
      this.dataSource = new MatTableDataSource(this._data);
      console.log('✅ Table Data:', this._data);
    } else {
      console.warn('⚠️ Data object does not contain `.data` array');
    }
  }

  _data: any[] = [];
  dataSource = new MatTableDataSource<any>([]);


  ngOnChanges(changes: SimpleChanges): void {
    console.log('Received object in ScientificDocsCardComponent:', this._data);
  }
}

