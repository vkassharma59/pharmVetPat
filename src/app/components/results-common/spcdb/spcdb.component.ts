import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
@Component({
  selector: 'chem-spcdb',
  standalone: true,
  imports: [
     CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule
  ],
  templateUrl: './spcdb.component.html',
  styleUrl: './spcdb.component.css'
})
export class SpcdbComponent implements AfterViewInit
{

  displayedColumns: string[] = [
    'GBRN', 'PRODUCT', 'PRODUCTSEARCHKEY',
     'COUNTRY', 'SPCNUMBER', 'SPCFILINGDATE', 'PRODUCTTYPENAME', 'APPLICANTNAME',
    'PUBLICATIONNUMBER', 'PATENTFAMILYEQUIVALENTS', 'INDIANPATENTEQUIVALENTS', 'TITLE', 'UKAUTHORIITYDATE',
    'EARLIESTAUTHORITYDATE',
    'SPCGANTDATE', 'ACTUALEXPIRYDATE', 'DATEOFEXPIRYOFSPC', 'EXTENTIONEXPIRYDATE', 'ENTRYINTOFORCEDATE',
    'PATENTFILINGDATE', 'PATENTGRANTDATE', 'DATEOFEXPIRYPATENT', 'PATENTSTATUS', 'DESCRIPTION',
    'DATEPROTECTIONDATE', 'REMARK', 'EVENTDATE'
  ];

  columnHeaders: { [key: string]: string } = {
    GBRN:'GBRN',
    PRODUCT:'PRODUCT',
    PRODUCTSEARCHKEY:'PRODUCT SEARCH KEY',
    COUNTRY:'COUNTRY',
    SPCNUMBER:'SPC NUMBER',
    SPCFILINGDATE:'SPC FILING DATE',
    PRODUCTTYPENAME:'PRODUCT TYPE NAME',
    APPLICANTNAME:'APPLICANT NAME',
    PUBLICATIONNUMBER:'PUBLICATION NUMBER',
    PATENTFAMILYEQUIVALENTS:'PATENT FAMILY EQUIVALENTS',
    INDIANPATENTEQUIVALENTS:'INDIAN PATENT EQUIVALENTS',
    TITLE:'TITLE',
    UKAUTHORIITYDATE:'UK AUTHORIIT YDATE',
    EARLIESTAUTHORITYDATE:'EARLIEST AUTHORITY DATE',
    SPCGANTDATE:'SPC GANTDATE',
    ACTUALEXPIRYDATE:'ACTUAL EXPIRY DATE',
    DATEOFEXPIRYOFSPC:'DATE OF EXPIRYOFSPC',
    EXTENTIONEXPIRYDATE:'EXTENTION EXPIRY DATE',
    ENTRYINTOFORCEDATE:'ENTRY INTO FORC EDATE',
    PATENTFILINGDATE:'PATENTFILINGDATE',
    PATENTGRANTDATE:'PATENTGRANTDATE',
    DATEOFEXPIRYPATENT:'DATEOFEXPIRYPATENT',
    PATENTSTATUS:'PATENTSTATUS',
    DESCRIPTION:'DESCRIPTION',
    DATEPROTECTIONDATE:'DATEPROTECTIONDATE',
    REMARK:'REMARK',
    EVENTDATE:'EVENTDATE'

  }

  dataSource = new MatTableDataSource(ELEMENT_DATA);
  
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
  
    constructor(private cdr: ChangeDetectorRef) {}
  
    ngAfterViewInit() {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.cdr.detectChanges();
    }
  
    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
      this.dataSource.filter = filterValue;
    }
  
    applyColumnFilter(column: string, event: Event) {
      const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
      this.dataSource.filterPredicate = (data, filter) => {
        return (data[column]?.toString().toLowerCase() || '').includes(filter);
      };
      this.dataSource.filter = filterValue;
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
    GBRN:'10267;10227;10185; 18285;19853;10313',
    PRODUCT:'SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALOGLIPTIN',
    PRODUCTSEARCHKEY:'SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALOGLIPTIN',
    COUNTRY:'Switzerland',
    SPCNUMBER:'C01084705/02',
    SPCFILINGDATE:'NA',
    PRODUCTTYPENAME:'Pharmaceutical',
    APPLICANTNAME:'Royalty Pharma Collection TRUST',
    PUBLICATIONNUMBER:'EP1084705',
    PATENTFAMILYEQUIVALENTS:'Patent:Information 1. Patent Number: EP1084705B1 (WO9740832A1)',
    INDIANPATENTEQUIVALENTS:'Not Found ',
    TITLE:'Method for Lowering blood glucose levels in mammals',
    UKAUTHORIITYDATE:'N/A',
    EARLIESTAUTHORITYDATE:'N/A',
    SPCGANTDATE:'N/A',
    ACTUALEXPIRYDATE:'2017-04-24',
    DATEOFEXPIRYOFSPC:'N/A',
    EXTENTIONEXPIRYDATE:'N/A',
    ENTRYINTOFORCEDATE:'N/A',
    PATENTFILINGDATE:'1997-04-24',
    PATENTGRANTDATE:'2014-06-25',
    DATEOFEXPIRYPATENT:'2017-04-24',
    PATENTSTATUS:'Granted',
    DESCRIPTION:'Active:Ingredient: SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALO ...',
    DATEPROTECTIONDATE:'N/A',
    REMARK:'Source: European Patent Register - https://register.epo.org/',
    EVENTDATE:'2014-12-31'
  },
  {
    GBRN:'10267;10227;10185; 18285;19853;10313',
    PRODUCT:'SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALOGLIPTIN',
    PRODUCTSEARCHKEY:'SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALOGLIPTIN',
    COUNTRY:'Switzerland',
    SPCNUMBER:'C01084705/03',
    SPCFILINGDATE:'NA',
    PRODUCTTYPENAME:'Pharmaceutical',
    APPLICANTNAME:'Royalty Pharma Collection TRUST',
    PUBLICATIONNUMBER:'EP1084705',
    PATENTFAMILYEQUIVALENTS:'Patent:Information 1. Patent Number: EP1084705B1 (WO9740832A1)',
    INDIANPATENTEQUIVALENTS:'Not Found ',
    TITLE:'Method for Lowering blood glucose levels in mammals',
    UKAUTHORIITYDATE:'N/A',
    EARLIESTAUTHORITYDATE:'N/A',
    SPCGANTDATE:'N/A',
    ACTUALEXPIRYDATE:'2017-04-24',
    DATEOFEXPIRYOFSPC:'N/A',
    EXTENTIONEXPIRYDATE:'N/A',
    ENTRYINTOFORCEDATE:'N/A',
    PATENTFILINGDATE:'1997-04-24',
    PATENTGRANTDATE:'2014-06-25',
    DATEOFEXPIRYPATENT:'2017-04-24',
    PATENTSTATUS:'Granted',
    DESCRIPTION:'Active:Ingredient: SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALO ...',
    DATEPROTECTIONDATE:'N/A',
    REMARK:'Source: European Patent Register - https://register.epo.org/',
    EVENTDATE:'2014-12-31'
  },
  {
    GBRN:'10267;10227;10185; 18285;19853;10313',
    PRODUCT:'SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALOGLIPTIN',
    PRODUCTSEARCHKEY:'SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALOGLIPTIN',
    COUNTRY:'Switzerland',
    SPCNUMBER:'C01084705/01 ',
    SPCFILINGDATE:'NA',
    PRODUCTTYPENAME:'Pharmaceutical',
    APPLICANTNAME:'Royalty Pharma Collection TRUST',
    PUBLICATIONNUMBER:'EP1084705',
    PATENTFAMILYEQUIVALENTS:'Patent:Information 1. Patent Number: EP1084705B1 (WO9740832A1)',
    INDIANPATENTEQUIVALENTS:'Not Found ',
    TITLE:'Method for Lowering blood glucose levels in mammals',
    UKAUTHORIITYDATE:'N/A',
    EARLIESTAUTHORITYDATE:'N/A',
    SPCGANTDATE:'N/A',
    ACTUALEXPIRYDATE:'2017-04-24',
    DATEOFEXPIRYOFSPC:'N/A',
    EXTENTIONEXPIRYDATE:'N/A',
    ENTRYINTOFORCEDATE:'N/A',
    PATENTFILINGDATE:'1997-04-24',
    PATENTGRANTDATE:'2014-06-25',
    DATEOFEXPIRYPATENT:'2017-04-24',
    PATENTSTATUS:'Granted',
    DESCRIPTION:'Active:Ingredient: SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALO ...',
    DATEPROTECTIONDATE:'N/A',
    REMARK:'Source: European Patent Register - https://register.epo.org/',
    EVENTDATE:'2014-12-31'
  }
  ,
  {
    GBRN:'10267;10227;10185; 18285;19853;10313',
    PRODUCT:'SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALOGLIPTIN',
    PRODUCTSEARCHKEY:'SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALOGLIPTIN',
    COUNTRY:'Switzerland',
    SPCNUMBER:'C01084705/05 ',
    SPCFILINGDATE:'NA',
    PRODUCTTYPENAME:'Pharmaceutical',
    APPLICANTNAME:'Royalty Pharma Collection TRUST',
    PUBLICATIONNUMBER:'EP1084705',
    PATENTFAMILYEQUIVALENTS:'Patent:Information 1. Patent Number: EP1084705B1 (WO9740832A1)',
    INDIANPATENTEQUIVALENTS:'Not Found ',
    TITLE:'Method for Lowering blood glucose levels in mammals',
    UKAUTHORIITYDATE:'N/A',
    EARLIESTAUTHORITYDATE:'N/A',
    SPCGANTDATE:'N/A',
    ACTUALEXPIRYDATE:'2017-04-24',
    DATEOFEXPIRYOFSPC:'N/A',
    EXTENTIONEXPIRYDATE:'N/A',
    ENTRYINTOFORCEDATE:'N/A',
    PATENTFILINGDATE:'1997-04-24',
    PATENTGRANTDATE:'2014-06-25',
    DATEOFEXPIRYPATENT:'2017-04-24',
    PATENTSTATUS:'Granted',
    DESCRIPTION:'Active:Ingredient: SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALO ...',
    DATEPROTECTIONDATE:'N/A',
    REMARK:'Source: European Patent Register - https://register.epo.org/',
    EVENTDATE:'2014-12-31'
  },
  {
    GBRN:'10267;10227;10185; 18285;19853;10313',
    PRODUCT:'SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALOGLIPTIN',
    PRODUCTSEARCHKEY:'SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALOGLIPTIN',
    COUNTRY:'Switzerland',
    SPCNUMBER:'C01084705/04 ',
    SPCFILINGDATE:'NA',
    PRODUCTTYPENAME:'Pharmaceutical',
    APPLICANTNAME:'Royalty Pharma Collection TRUST',
    PUBLICATIONNUMBER:'EP1084705',
    PATENTFAMILYEQUIVALENTS:'Patent:Information 1. Patent Number: EP1084705B1 (WO9740832A1)',
    INDIANPATENTEQUIVALENTS:'Not Found ',
    TITLE:'Method for Lowering blood glucose levels in mammals',
    UKAUTHORIITYDATE:'N/A',
    EARLIESTAUTHORITYDATE:'N/A',
    SPCGANTDATE:'N/A',
    ACTUALEXPIRYDATE:'2017-04-24',
    DATEOFEXPIRYOFSPC:'N/A',
    EXTENTIONEXPIRYDATE:'N/A',
    ENTRYINTOFORCEDATE:'N/A',
    PATENTFILINGDATE:'1997-04-24',
    PATENTGRANTDATE:'2014-06-25',
    DATEOFEXPIRYPATENT:'2017-04-24',
    PATENTSTATUS:'Granted',
    DESCRIPTION:'Active:Ingredient: SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALO ...',
    DATEPROTECTIONDATE:'N/A',
    REMARK:'Source: European Patent Register - https://register.epo.org/',
    EVENTDATE:'2014-12-31'
  },
  {
    GBRN:'19853;10313',
    PRODUCT:'SAXAGLIPTIN',
    PRODUCTSEARCHKEY:'SAXAGLIPTIN',
    COUNTRY:'Switzerland',
    SPCNUMBER:'',
    SPCFILINGDATE:'2014-12-16',
    PRODUCTTYPENAME:'Pharmaceutical',
    APPLICANTNAME:'Royalty Pharma Collection TRUST',
    PUBLICATIONNUMBER:'EP1084705',
    PATENTFAMILYEQUIVALENTS:'Patent:Information 1. Patent Number: EP1084705B1 (WO9740832A1)',
    INDIANPATENTEQUIVALENTS:'Not Found ',
    TITLE:'Method for Lowering blood glucose levels in mammals',
    UKAUTHORIITYDATE:'N/A',
    EARLIESTAUTHORITYDATE:'N/A',
    SPCGANTDATE:'N/A',
    ACTUALEXPIRYDATE:'2017-04-24',
    DATEOFEXPIRYOFSPC:'N/A',
    EXTENTIONEXPIRYDATE:'N/A',
    ENTRYINTOFORCEDATE:'N/A',
    PATENTFILINGDATE:'1997-04-24',
    PATENTGRANTDATE:'2014-06-25',
    DATEOFEXPIRYPATENT:'2017-04-24',
    PATENTSTATUS:'Granted',
    DESCRIPTION:'Active:Ingredient: SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALO ...',
    DATEPROTECTIONDATE:'N/A',
    REMARK:'Source: European Patent Register - https://register.epo.org/',
    EVENTDATE:'2014-12-31'
  },
  {
    GBRN:'19853;10557;10313',
    PRODUCT:'SAXAGLIPTIN + METFORMIN',
    PRODUCTSEARCHKEY:'SAXAGLIPTIN + METFORMIN',
    COUNTRY:'France',
    SPCNUMBER:'08C0033',
    SPCFILINGDATE:'NA',
    PRODUCTTYPENAME:'Pharmaceutical',
    APPLICANTNAME:'MERCK & CO., INC.',
    PUBLICATIONNUMBER:'EP1412357',
    PATENTFAMILYEQUIVALENTS:'Patent:Information 1. Patent Number: EP1084705B1 (WO9740832A1)',
    INDIANPATENTEQUIVALENTS:'IN209816B(IN26/CHENP/2004) ',
    TITLE:'BETA-AMINO TETRAHYDROIMIDAZO(1,2-A)PYRAZINES AND TETRAHYDROTRIAZOLO(4,3-A)PYRAZINES AS DIPEPTIDYL PEPTIDASE INHIBITORS FOR THE TREATMENT OR PREVENTION OF DIABETES',
    UKAUTHORIITYDATE:'N/A',
    EARLIESTAUTHORITYDATE:'N/A',
    SPCGANTDATE:'N/A',
    ACTUALEXPIRYDATE:'2022-07-05',
    DATEOFEXPIRYOFSPC:'N/A',
    EXTENTIONEXPIRYDATE:'N/A',
    ENTRYINTOFORCEDATE:'N/A',
    PATENTFILINGDATE:'2002-07-05',
    PATENTGRANTDATE:'2006-03-22',
    DATEOFEXPIRYPATENT:'2022-07-05',
    PATENTSTATUS:'Granted',
    DESCRIPTION:'Active:Ingredient: SAXAGLIPTIN;LINAGLIPTIN; ALOGLIPTIN; VILDAGLIPTIN; SITAGLIPTIN; BENZOATE D ALO ...',
    DATEPROTECTIONDATE:'N/A',
    REMARK:'Source: European Patent Register - https://register.epo.org/',
    EVENTDATE:'2014-12-31'
  }
]

