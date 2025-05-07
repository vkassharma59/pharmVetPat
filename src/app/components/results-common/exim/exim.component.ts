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

@Component({
  selector: 'chem-exim',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './exim.component.html',
  styleUrls: ['./exim.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EximComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'position', 'GBRN', 'PRODUCTNAME', 'APIAGROCHEMICALINTERMEDIATE',
    'ITEMDESCRIPTION', 'COUNTRYOFORIGIN', 'CHAPTER', 'RITCCODE', 'HSCODE',
    'TYPE', 'YEARMONTH', 'PORTOFLOADING', 'PORTCODE', 'PORTOFDISCHARGE',
    'SBILLNO', 'SBILLDATE', 'EXPORTER', 'EXPORTERCITYSTATE', 'EXPORTERADDRESS',
    'IMPORTER', 'DESTINATION', 'UNIT', 'CURRENCY', 'QUANTITY', 'UNITPRICE',
    'ITEMRATEINFCFOREIGNCURRENCY', 'TOTALFOBVALUEININR', 'SUPPLIERNAME',
    'SUPPLIERADDRESS', 'IECIMPORTERCODE', 'INVOICENO'
  ];

  columnHeaders: { [key: string]: string } = {
    position: 'Position',
    GBRN: 'GBRN',
    PRODUCTNAME: 'Product Name',
    APIAGROCHEMICALINTERMEDIATE: 'API Agrochemical/Intermediate',
    ITEMDESCRIPTION: 'Item Description',
    COUNTRYOFORIGIN: 'Country of Origin',
    CHAPTER: 'Chapter',
    RITCCODE: 'RITC Code',
    HSCODE: 'HS Code',
    TYPE: 'Type',
    YEARMONTH: 'Year/Month',
    PORTOFLOADING: 'Port of Loading',
    PORTCODE: 'Port Code',
    PORTOFDISCHARGE: 'Port of Discharge',
    SBILLNO: 'S. Bill No',
    SBILLDATE: 'S. Bill Date',
    EXPORTER: 'Exporter',
    EXPORTERCITYSTATE: 'Exporter City/State',
    EXPORTERADDRESS: 'Exporter Address',
    IMPORTER: 'Importer',
    DESTINATION: 'Destination',
    UNIT: 'Unit',
    CURRENCY: 'Currency',
    QUANTITY: 'Quantity',
    UNITPRICE: 'Unit Price',
    ITEMRATEINFCFOREIGNCURRENCY: 'Item Rate in FC',
    TOTALFOBVALUEININR: 'Total FOB Value (INR)',
    SUPPLIERNAME: 'Supplier Name',
    SUPPLIERADDRESS: 'Supplier Address',
    IECIMPORTERCODE: 'IEC Importer Code',
    INVOICENO: 'Invoice No'
  };

  dataSource = new MatTableDataSource(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('tableContainer') tableContainer!: ElementRef;
  constructor(private cdr: ChangeDetectorRef) { }

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

const ELEMENT_DATA = [
  {
    position: 1,
    GBRN: 10313,
    PRODUCTNAME: 'SITAGLIPTIN EP IMPURITY E',
    APIAGROCHEMICALINTERMEDIATE: 'SITAGLIPTIN',
    ITEMDESCRIPTION: 'Impurity E Batch No.SRL-6 3-137',
    COUNTRYOFORIGIN: 'Spain',
    CHAPTER: '38',
    RITCCODE: 38220090,
    HSCODE: 38220090,
    TYPE: 'EXPORT',
    YEARMONTH: 'Apr 2021',
    PORTOFLOADING: 'Ahmedabad Air ACC',
    PORTCODE: 'INAMD4',
    PORTOFDISCHARGE: 'Barcelona',
    SBILLNO: 1414805,
    SBILLDATE: '28-Apr-2021',
    EXPORTER: 'SYNZEAL RESEARCH PRIVATE LIMITED',
    EXPORTERCITYSTATE: 'Ahmedabad, Gujarat',
    EXPORTERADDRESS: 'Plot No F Ganesh Industrial Estate, Bavla Moraiya Road',
    IMPORTER: 'LABORATORIOS LICONSA, S.A',
    DESTINATION: 'Spain',
    UNIT: 'GMS',
    CURRENCY: 'USD',
    QUANTITY: 0.05,
    UNITPRICE: 260575,
    ITEMRATEINFCFOREIGNCURRENCY: 3616.59,
    TOTALFOBVALUEININR: 13028.75,
    SUPPLIERNAME: 'SYNZEAL RESEARCH PRIVATE LIMITED',
    SUPPLIERADDRESS: 'Plot No F Ganesh Industrial Estate, Bavla Moraiya Road',
    IECIMPORTERCODE: '896004341',
    INVOICENO: 'SAM-0342/19-20'
  },
  {
    position: 2, GBRN: 10313,
    PRODUCTNAME: 'SITAGLIPTIN EP IMPURITY C SRL-90-54',
    APIAGROCHEMICALINTERMEDIATE: 'SITAGLIPTIN EP IMPURITY C SRL-90-54',
    ITEMDESCRIPTION: 'SITAGLIPTIN EP IMPURITY C SRL-90-54',
    COUNTRYOFORIGIN: 'SLOVENIA',
    CHAPTER: 'CHAPTER 38',
    RITCCODE: 38220090,
    HSCODE: 38220090,
    TYPE: 'EXPORT',
    YEARMONTH: 'MAY--2019',
    PORTOFLOADING: 'AHEMDABAD AIR ACC(INAMD4)',
    PORTCODE: 'INAMD4',
    PORTOFDISCHARGE: 'LJUBLJANA-BRNIK',
    SBILLNO: 4363241,
    SBILLDATE: '23/05/2019 ',
    EXPORTER: 'SYNZEAL RESEARCH PRIVATE LIMITED',
    EXPORTERCITYSTATE: 'AHMEDABAD GUJRAT,INDIA',
    EXPORTERADDRESS: 'A-302, GANESH SOPAN, NR.GANESH  HOUSE,CHENPUR ROAD,NEW RANIP',
    IMPORTER: 'DSV TRANSPORT D.O.O',
    DESTINATION: 'SLOVENIA',
    UNIT: 'GMS', CURRENCY: 'USD', QUANTITY: 0.1, UNITPRICE: 868750,
    ITEMRATEINFCFOREIGNCURRENCY: 12572.36, TOTALFOBVALUEININR: 86875,
    SUPPLIERNAME: 'SYNZEAL RESEARCH PRIVATE LIMITED',
    SUPPLIERADDRESS: 'A-302, GANESH SOPAN, NR.GANESH  HOUSE,CHENPUR ROAD,NEW RANIP',
    IECIMPORTERCODE: '896004341',
    INVOICENO: 'SRPL-2019-20-114'

  },
  {
    position: 3, GBRN: 10313,
    PRODUCTNAME: 'FREE SAMPLE:Placebo of Sitagliptin table ts 100 MG; Batch No: ASSITT6017; Mfg. Da te: Apr-19; Expiry Date: Mar-21',
    APIAGROCHEMICALINTERMEDIATE: 'FREE SAMPLE:Placebo of Sitagliptin table ts 100 MG; Batch No: ASSITT6017; Mfg. Da te: Apr-19; Expiry Date: Mar-21',
    ITEMDESCRIPTION: 'FREE SAMPLE:Placebo of Sitagliptin table ts 100 MG; Batch No: ASSITT6017; Mfg. Da te: Apr-19; Expiry Date: Mar-21',
    COUNTRYOFORIGIN: 'BRAZIL',
    CHAPTER: 'CHAPTER 38',
    RITCCODE: 38249990,
    HSCODE: 38249990,
    TYPE: 'EXPORT',
    YEARMONTH: 'MAY--2019',
    PORTOFLOADING: 'AHEMDABAD AIR ACC(INAMD4)',
    PORTCODE: 'INAMD4',
    PORTOFDISCHARGE: 'Guarulhos',
    SBILLNO: 4322846,
    SBILLDATE: '21/05/2019 ',
    EXPORTER: 'INTAS PHARMACEUTICALS LTD.',
    EXPORTERCITYSTATE: 'AHMEDABAD GUJRAT',
    EXPORTERADDRESS: '2ND FLOOR, CHINUBHAI CENTRE,OFF. NEHRU BRIDGE, ASHRAM ROAD,',
    IMPORTER: 'ACCORD FARMACEUTICAL LTDA.',
    DESTINATION: 'BRAZIL',
    UNIT: 'PAC', CURRENCY: 'USD', QUANTITY: 1, UNITPRICE: 295.03,
    ITEMRATEINFCFOREIGNCURRENCY: 4.27, TOTALFOBVALUEININR: 295.03,
    SUPPLIERNAME: 'INTAS PHARMACEUTICALS LTD.',
    SUPPLIERADDRESS: 'FREE SAMPLE:Placebo of Sitagliptin table ts 100 MG; Batch No: ASSITT6017; Mfg. Da te: Apr-19; Expiry Date: Mar-21',
    IECIMPORTERCODE: '896004341',
    INVOICENO: 'SAM-0342/19-20'

  },
  {
    position: 4, GBRN: 10313,
    PRODUCTNAME: 'FREE SAMPLE:Placebo of Sitagliptin table ts 100 MG; Batch No: ASSITT6017; Mfg. Da te: Apr-19; Expiry Date: Mar-21',
    APIAGROCHEMICALINTERMEDIATE: 'FREE SAMPLE:Placebo of Sitagliptin table ts 100 MG; Batch No: ASSITT6017; Mfg. Da te: Apr-19; Expiry Date: Mar-21',
    ITEMDESCRIPTION: 'FREE SAMPLE:Placebo of Sitagliptin table ts 100 MG; Batch No: ASSITT6017; Mfg. Da te: Apr-19; Expiry Date: Mar-21',
    COUNTRYOFORIGIN: 'BRAZIL',
    CHAPTER: 'CHAPTER 38',
    RITCCODE: 38249990,
    HSCODE: 38249990,
    TYPE: 'EXPORT',
    YEARMONTH: 'MAY--2019',
    PORTOFLOADING: 'AHEMDABAD AIR ACC(INAMD4)',
    PORTCODE: 'INAMD4',
    PORTOFDISCHARGE: 'Guarulhos',
    SBILLNO: 4322846,
    SBILLDATE: '21/05/2019 ',
    EXPORTER: 'INTAS PHARMACEUTICALS LTD.',
    EXPORTERCITYSTATE: 'AHMEDABAD GUJRAT',
    EXPORTERADDRESS: '2ND FLOOR, CHINUBHAI CENTRE,OFF. NEHRU BRIDGE, ASHRAM ROAD,',
    IMPORTER: 'ACCORD FARMACEUTICAL LTDA.',
    DESTINATION: 'BRAZIL',
    UNIT: 'PAC', CURRENCY: 'USD', QUANTITY: 1, UNITPRICE: 295.03,
    ITEMRATEINFCFOREIGNCURRENCY: 4.27, TOTALFOBVALUEININR: 295.03,
    SUPPLIERNAME: 'INTAS PHARMACEUTICALS LTD.',
    SUPPLIERADDRESS: 'FREE SAMPLE:Placebo of Sitagliptin table ts 100 MG; Batch No: ASSITT6017; Mfg. Da te: Apr-19; Expiry Date: Mar-21',
    IECIMPORTERCODE: '896004341',
    INVOICENO: 'SAM-0342/19-20'

  },
  {
    position: 5, GBRN: 10313,
    PRODUCTNAME: 'FREE SAMPLE:Placebo of Sitagliptin table ts 100 MG; Batch No: ASSITT6017; Mfg. Da te: Apr-19; Expiry Date: Mar-21',
    APIAGROCHEMICALINTERMEDIATE: 'FREE SAMPLE:Placebo of Sitagliptin table ts 100 MG; Batch No: ASSITT6017; Mfg. Da te: Apr-19; Expiry Date: Mar-21',
    ITEMDESCRIPTION: 'FREE SAMPLE:Placebo of Sitagliptin table ts 100 MG; Batch No: ASSITT6017; Mfg. Da te: Apr-19; Expiry Date: Mar-21',
    COUNTRYOFORIGIN: 'BRAZIL',
    CHAPTER: 'CHAPTER 38',
    RITCCODE: 38249990,
    HSCODE: 38249990,
    TYPE: 'EXPORT',
    YEARMONTH: 'MAY--2019',
    PORTOFLOADING: 'AHEMDABAD AIR ACC(INAMD4)',
    PORTCODE: 'INAMD4',
    PORTOFDISCHARGE: 'Guarulhos',
    SBILLNO: 4322846,
    SBILLDATE: '21/05/2019 ',
    EXPORTER: 'INTAS PHARMACEUTICALS LTD.',
    EXPORTERCITYSTATE: 'AHMEDABAD GUJRAT',
    EXPORTERADDRESS: '2ND FLOOR, CHINUBHAI CENTRE,OFF. NEHRU BRIDGE, ASHRAM ROAD,',
    IMPORTER: 'ACCORD FARMACEUTICAL LTDA.',
    DESTINATION: 'BRAZIL',
    UNIT: 'PAC', CURRENCY: 'USD', QUANTITY: 1, UNITPRICE: 354.04,
    ITEMRATEINFCFOREIGNCURRENCY: 5.12, TOTALFOBVALUEININR: 354.04,
    SUPPLIERNAME: 'INTAS PHARMACEUTICALS LTD.',
    SUPPLIERADDRESS: 'FREE SAMPLE:Placebo of Sitagliptin table ts 100 MG; Batch No: ASSITT6017; Mfg. Da te: Apr-19; Expiry Date: Mar-21',
    IECIMPORTERCODE: '896004341',
    INVOICENO: 'SAM-0342/19-20'

  },
  {
    position: 6, GBRN: 10313,
    PRODUCTNAME: 'REFERENCE STANDERED SITAGLIPTIN DEAMINO IMPURITY 10 MG 5 BOTTLE',
    APIAGROCHEMICALINTERMEDIATE: 'REFERENCE STANDERED SITAGLIPTIN DEAMINO IMPURITY 10 MG 5 BOTTLE',
    ITEMDESCRIPTION: 'REFERENCE STANDERED SITAGLIPTIN DEAMINO IMPURITY 10 MG 5 BOTTLE',
    COUNTRYOFORIGIN: 'UNITED STATES',
    CHAPTER: 'CHAPTER 38',
    RITCCODE: 38220090,
    HSCODE: 38220090,
    TYPE: 'EXPORT',
    YEARMONTH: 'MAY--2019',
    PORTOFLOADING: 'AHEMDABAD AIR ACC(INAMD4)',
    PORTCODE: 'INAMD4',
    PORTOFDISCHARGE: 'NEW YORK',
    SBILLNO: 4255542,
    SBILLDATE: '18/05/2019 ',
    EXPORTER: 'PHARMACE RESERCH LABORATORY',
    EXPORTERCITYSTATE: 'AHMEDABAD GUJRAT',
    EXPORTERADDRESS: '31/1 JAYANT PARK SOCIETY,,GHODASAR ,',
    IMPORTER: 'BOCSC INC',
    DESTINATION: 'UNITED STATES',
    UNIT: 'BTL', CURRENCY: 'USD', QUANTITY: 5, UNITPRICE: 5560,
    ITEMRATEINFCFOREIGNCURRENCY: 80.46, TOTALFOBVALUEININR: 27800,
    SUPPLIERNAME: 'PHARMACE RESERCH LABORATORY',
    SUPPLIERADDRESS: '31/1 JAYANT PARK SOCIETY,,GHODASAR ,',
    IECIMPORTERCODE: 'AARFP7305G',
    INVOICENO: '05/19-20'

  },
  {
    position: 7, GBRN: 10313,
    PRODUCTNAME: 'SITAGLIPTIN PHOSPHATE MONOHYDRATE BATCH',
    APIAGROCHEMICALINTERMEDIATE: 'SITAGLIPTIN PHOSPHATE MONOHYDRATE BATCH',
    ITEMDESCRIPTION: 'SITAGLIPTIN PHOSPHATE MONOHYDRATE BATCH',
    COUNTRYOFORIGIN: 'NEPAL',
    CHAPTER: 'CHAPTER 38',
    RITCCODE: 38220090,
    HSCODE: 38220090,
    TYPE: 'EXPORT',
    YEARMONTH: 'MAY--2019',
    PORTOFLOADING: 'DELHI AIR CARGO ACC(INDEL4)',
    PORTCODE: 'INAMD4',
    PORTOFDISCHARGE: 'KATHMANDU-TRIBHUVA',
    SBILLNO: 3933645,
    SBILLDATE: '04/05/2019 ',
    EXPORTER: 'DOVE CHEMICALS LTD',
    EXPORTERCITYSTATE: 'CHANDIGHAD,CHANDIGAD',
    EXPORTERADDRESS: 'S.C.O.144 FIRST FLOOR,SECTOR 28-D ,',
    IMPORTER: 'ARROW PHARMACEUTICALS PVT.LTD.',
    DESTINATION: 'NEPAL',
    UNIT: 'NOS', CURRENCY: 'INR', QUANTITY: 1, UNITPRICE: 6000,
    ITEMRATEINFCFOREIGNCURRENCY: 6000, TOTALFOBVALUEININR: 6000,
    SUPPLIERNAME: 'DOVE CHEMICALS LTD',
    SUPPLIERADDRESS: 'S.C.O.144 FIRST FLOOR,SECTOR 28-D ,',
    IECIMPORTERCODE: '2212004362',
    INVOICENO: 'E-015/19-20'

  },

  {
    position: 8, GBRN: 10313,
    PRODUCTNAME: 'SITAGLIPTIN IMPURITY B CODE : PA1948020 Q',
    APIAGROCHEMICALINTERMEDIATE: 'SITAGLIPTIN IMPURITY B CODE : PA1948020 Q',
    ITEMDESCRIPTION: 'SITAGLIPTIN IMPURITY B CODE : PA1948020 Q',
    COUNTRYOFORIGIN: 'KOREA, REOUBLIC OF',
    CHAPTER: 'CHAPTER 38',
    RITCCODE: 38220090,
    HSCODE: 38220090,
    TYPE: 'EXPORT',
    YEARMONTH: 'APR--2021',
    PORTOFLOADING: 'DELHI AIR CARGO ACC',
    PORTCODE: 'INAMD4',
    PORTOFDISCHARGE: 'SEOUL -INCHEON INT',
    SBILLNO: 1332295,
    SBILLDATE: '04/24/2021 12:00:00 ',
    EXPORTER: 'PHARMAFFILIATES ANALYTICS AND SYNTHETICS PRIVATE L',
    EXPORTERCITYSTATE: 'PANCHKULA,HARYANA',
    EXPORTERADDRESS: 'KOTHI NO. 166, SECTOR 10 ,',
    IMPORTER: 'SAMCHUN PURE CHEMICAL CO., LTD',
    DESTINATION: 'KOREA, REPUBLIC OF',
    UNIT: 'NOS', CURRENCY: 'USD', QUANTITY: 1, UNITPRICE: 13000,
    ITEMRATEINFCFOREIGNCURRENCY: 180, TOTALFOBVALUEININR: 13000,
    SUPPLIERNAME: 'PHARMAFFILIATES ANALYTICS AND SYNTHETICS PRIVATE L',
    SUPPLIERADDRESS: 'KOTHI NO. 166, SECTOR 10 ,',
    IECIMPORTERCODE: '2204002917',
    INVOICENO: 'EXP/2021-22/30'

  },
  {
    position: 9, GBRN: 10313,
    PRODUCTNAME: 'SITAGLIPTIN IMPURITY B CODE : PA1948030 Q',
    APIAGROCHEMICALINTERMEDIATE: 'SITAGLIPTIN IMPURITY B CODE : PA194803  0 Q',
    ITEMDESCRIPTION: 'SITAGLIPTIN IMPURITY B CODE : PA1948030 Q',
    COUNTRYOFORIGIN: 'KOREA, REOUBLIC OF',
    CHAPTER: 'CHAPTER 38',
    RITCCODE: 38220090,
    HSCODE: 38220090,
    TYPE: 'EXPORT',
    YEARMONTH: 'APR--2021',
    PORTOFLOADING: 'DELHI AIR CARGO ACC',
    PORTCODE: 'INAMD4',
    PORTOFDISCHARGE: 'SEOUL -INCHEON INT',
    SBILLNO: 1332295,
    SBILLDATE: '04/24/2021 12:00:00 ',
    EXPORTER: 'PHARMAFFILIATES ANALYTICS AND SYNTHETICS PRIVATE L',
    EXPORTERCITYSTATE: 'PANCHKULA,HARYANA',
    EXPORTERADDRESS: 'KOTHI NO. 166, SECTOR 10 ,',
    IMPORTER: 'SAMCHUN PURE CHEMICAL CO., LTD',
    DESTINATION: 'KOREA, REPUBLIC OF',
    UNIT: 'NOS', CURRENCY: 'USD', QUANTITY: 1, UNITPRICE: 13000,
    ITEMRATEINFCFOREIGNCURRENCY: 180, TOTALFOBVALUEININR: 13000,
    SUPPLIERNAME: 'PHARMAFFILIATES ANALYTICS AND SYNTHETICS PRIVATE L',
    SUPPLIERADDRESS: 'KOTHI NO. 166, SECTOR 10 ,',
    IECIMPORTERCODE: '2204002917',
    INVOICENO: 'EXP/2021-22/30'

  },
  {
    position: 10, GBRN: 10313,
    PRODUCTNAME: 'SITAGLIPTIN ACID IMPURITY CAS NUMBER-936',
    APIAGROCHEMICALINTERMEDIATE: 'SITAGLIPTIN ACID IMPURITY CAS NUMBER-936',
    ITEMDESCRIPTION: 'SITAGLIPTIN ACID IMPURITY CAS NUMBER-936',
    COUNTRYOFORIGIN: 'BANGLADESH',
    CHAPTER: 'CHAPTER 38',
    RITCCODE: 38220090,
    HSCODE: 38220090,
    TYPE: 'EXPORT',
    YEARMONTH: 'APR--2021',
    PORTOFLOADING: 'SAHAR AIR CARGO ACC',
    PORTCODE: 'INBOM4',
    PORTOFDISCHARGE: 'DHAKA',
    SBILLNO: 9940220,
    SBILLDATE: '04/7/2021 12:00:00 ',
    EXPORTER: 'CLEANCHEM LABORATORIES LLP',
    EXPORTERCITYSTATE: 'NAVI-MUMBAI,MAHARASHTRA',
    EXPORTERADDRESS: ' R-80 2ND FLOOR PRAMA INSTRUMENTS,  TTC INDUSTRIAL AREA, MIDC RABALE ,',
    IMPORTER: 'M/S. HEALTHCARE PHARMACEUTICALS LTD',
    DESTINATION: 'BANGLADESH',
    UNIT: 'KGS', CURRENCY: 'USD', QUANTITY: 0.1, UNITPRICE: 170000,
    ITEMRATEINFCFOREIGNCURRENCY: 2300, TOTALFOBVALUEININR: 170000,
    SUPPLIERNAME: 'CLEANCHEM LABORATORIES LLP',
    SUPPLIERADDRESS: 'R-80 2ND FLOOR PRAMA INSTRUMENTS,  TTC INDUSTRIAL AREA, MIDC RABALE ,',
    IECIMPORTERCODE: 'AAKFC3593J',
    INVOICENO: 'CL/21-22/007'

  }


];
