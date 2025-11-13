import { Component, EventEmitter, Input, Output, AfterViewInit, OnInit } from '@angular/core';
import { BasicRouteCardComponent } from '../basic-route-card/basic-route-card.component';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
@Component({
  selector: 'chem-product-info',
  standalone: true,
  imports: [CommonModule, BasicRouteCardComponent, ChildPagingComponent],
  templateUrl: './basic-route.component.html',
  styleUrl: './basic-route.component.css'
})
export class BasicRouteComponent implements OnInit, AfterViewInit {
  
  resultTabs: any = {};
  productInfoApiBody: any;
  _data: any = [];
  count: number = 0;
  searchKeyword: string = '';
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  searchThrough: string = '';
  _currentChildAPIBody: any;
  @Input() index: any;
  @Input() tabName?: string;
  @Input() keyword: string = '';
  isExportingExcel: boolean = false;
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }

  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
  
    if (value) {
      this.productInfoApiBody = JSON.parse(JSON.stringify(value)) || value;
      this.searchKeyword = value.keyword || ''; // ✅ store keyword for Excel
    }
  }  
  constructor(private utilityService: UtilityService, public loadingService: LoadingService, private mainSearchService: MainSearchService) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
   
  }

  ngOnInit(): void {
   // console.log('Current Child API Body (index:', this.currentChildAPIBody);
  }
 


  ngAfterViewInit(): void {
    // ✅ Scroll to top after component loads
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }
  // downloadExcel(): void {
  //   this.isExportingExcel = true;
  
  //   // Robustly get keyword from multiple possible sources
  //   const keyword =
  //     (this.keyword && this.keyword.trim()) ||
  //     (this.currentChildAPIBody && this.currentChildAPIBody.keyword && this.currentChildAPIBody.keyword.trim()) ||
  //     (this.productInfoApiBody && this.productInfoApiBody.keyword && this.productInfoApiBody.keyword.trim()) ||
  //     (this.mainSearchService && (this.mainSearchService as any).simpleSearchKeyword && (this.mainSearchService as any).simpleSearchKeyword.trim()) ||
  //     '';
  
  //   if (!keyword) {
  //     alert('Please perform a search before downloading Excel.');
  //     this.isExportingExcel = false;
  //     return;
  //   }
  
  //   // Determine page_no if available, otherwise default to 1
  //   const page_no =
  //     this.productInfoApiBody && this.productInfoApiBody.page_no && !isNaN(this.productInfoApiBody.page_no)
  //       ? Number(this.productInfoApiBody.page_no)
  //       : 1;
  
  //   // Prepare API request body (explicitly include keyword and page_no)
  //   this._currentChildAPIBody = {
  //     ...this.productInfoApiBody,
  //     keyword,
  //     page_no,
  //   };
  
  //   console.log('✅ Final Excel download body:', this._currentChildAPIBody);
  
  //   const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  //   this.mainSearchService.basicProductdownloadexcel(this._currentChildAPIBody).subscribe({
  //     next: async (res: Blob) => {
  //       try {
  //         // If backend returned empty blob, fallback to local
  //         if (!res || res.size === 0) {
  //           console.warn('⚠️ Empty response from backend. Exporting local data.');
  //           this.exportLocalData();
  //           this.isExportingExcel = false;
  //           return;
  //         }
  
  //         // Parse Excel from blob
  //         const arrayBuffer = await res.arrayBuffer();
  //         const XLSX = await import('xlsx');
  //         const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  //         const sheetName = workbook.SheetNames[0];
  //         const worksheet = workbook.Sheets[sheetName];
  //         const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
  
  //         if (!jsonData.length) {
  //           console.warn('⚠️ Excel sheet is empty. Exporting local data instead.');
  //           this.exportLocalData();
  //           this.isExportingExcel = false;
  //           return;
  //         }
  
  //         // Remove empty columns dynamically
  //         const validKeys = Object.keys(jsonData[0]).filter((key) =>
  //           jsonData.some((row) => {
  //             const val = row[key];
  //             return val !== null && val !== undefined && val !== '';
  //           })
  //         );
  
  //         const cleanedData = jsonData.map((row) => {
  //           const newRow: any = {};
  //           validKeys.forEach((key) => (newRow[key] = row[key]));
  //           return newRow;
  //         });
  
  //         // Create worksheet with only valid columns
  //         const newWorksheet = XLSX.utils.json_to_sheet(cleanedData, { skipHeader: false });
  //         newWorksheet['!cols'] = validKeys.map((key) => ({
  //           wch: Math.min(Math.max(key.length, 20), 60),
  //         }));
  
  //         const newWorkbook = XLSX.utils.book_new();
  //         XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'FilteredData');
  
  //         const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
  //         const blob = new Blob([excelBuffer], {
  //           type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //         });
  
  //         const url = window.URL.createObjectURL(blob);
  //         const a = document.createElement('a');
  //         a.href = url;
  //         a.download = 'Basic-Product.xlsx';
  //         document.body.appendChild(a);
  //         a.click();
  //         document.body.removeChild(a);
  //         window.URL.revokeObjectURL(url);
  
  //         console.log('✅ Excel downloaded successfully with cleaned columns (Korea).');
  //         this.isExportingExcel = false;
  //         window.scrollTo(0, scrollTop);
  //       } catch (error) {
  //         console.error('Excel processing error (Korea):', error);
  //         this.isExportingExcel = false;
  //         this.exportLocalData();
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Excel download error (Korea):', err);
  //       console.warn('⚠️ Falling back to local data export due to API error.');
  //       this.isExportingExcel = false;
  //       this.exportLocalData();
  //       window.scrollTo(0, scrollTop);
  //     },
  //   });
  // }
  
  // private exportLocalData(): void {
  //   if (!this._data || !this._data.length) {
  //     alert('No data available to export.');
  //     return;
  //   }
  
  //   import('xlsx').then((XLSX) => {
  //     const validKeys = Object.keys(this._data[0]).filter((key) =>
  //       this._data.some((row) => {
  //         const val = row[key];
  //         return val !== null && val !== undefined && val !== '';
  //       })
  //     );
  
  //     const filteredData = this._data.map((row) => {
  //       const newRow: any = {};
  //       validKeys.forEach((key) => (newRow[key] = row[key]));
  //       return newRow;
  //     });
  
  //     const worksheet = XLSX.utils.json_to_sheet(filteredData);
  //     worksheet['!cols'] = validKeys.map((key) => ({
  //       wch: Math.min(Math.max(key.length, 20), 60),
  //     }));
  
  //     const workbook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, 'LocalData');
  //     XLSX.writeFile(workbook, 'ProductInfo.xlsx');
  
  //     console.log('✅ Exported local data successfully with cleaned columns (Korea).');
  //   });
  // }
  
}
