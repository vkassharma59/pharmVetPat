import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TechnicalRoutesCardComponent } from '../technical-routes-card/technical-routes-card.component';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { ChildResultTabComponent } from '../../../commons/child-result-tab/child-result-tab.component';
import { Auth_operations } from '../../../Utils/SetToken';
import { SharedRosService } from '../../../shared-ros.service';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';

@Component({
  selector: 'chem-technical-route',
  standalone: true,
  imports: [TechnicalRoutesCardComponent, CommonModule, ChildPagingComponent, ChildResultTabComponent],
  templateUrl: './technical-routes.component.html',
  styleUrl: './technical-routes.component.css'
})
export class TechnicalRoutesComponent {

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() resetPagination = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @Output() handlePDFDownload = new EventEmitter<number>();
  @Input() currentChildAPIBody: any;
  @Input() specialCount: any;
  @Input() CurrentAPIBody: any;
  @Input() MainDataResultShow: any;
  @Input() index: any;
  @Input() tabName: string | undefined;
  @Input() isSplitDownload: boolean = false;
  @Input() hasTabDataFlag: boolean = false;
  @Input() selectedIndex: number = 0;
  searchThrough: string = '';
  isExportingExcel: boolean = false;
  _currentChildAPIBody: any;
  // data = {
  //   uniq_products: string[],
  //   copy_limit: number   // 👈 backend allowed limit for copy in application of intermidiate button
  // };
  
  technicalRouteApiBody: any;
  @Input() keyword: string = '';
  rosCounts: { agrochemical: number; pharmaceutical: number } = {
    agrochemical: 0,
    pharmaceutical: 0
  };


  resultTabs: any = {};
  _data: any = [];
  _itemid: any = {};

  @Input()
  get itemid() {
    return this._itemid;
  }

  set itemid(value: any) {
    this._itemid = value;
  }
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    if (value) {
      this._data = value;
    }
  }
  viewProduct: boolean = false;

  ngOnInit() {
    this.sharedROS.rosCount$.subscribe(count => {
      if (count && count?.index === this.index) {
        this.rosCounts = count;
      }
    });
  }

  handleToggleViewProduct() {
    this.viewProduct = !this.viewProduct;
  }

  constructor(
    private utilityService: UtilityService,
    private sharedROS: SharedRosService,
    public loadingService: LoadingService,
    private mainSearchService: MainSearchService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
  // private formatDate(): string {
  //   const months = ['January', 'February', 'March', 'April', 'May', 'June',
  //     'July', 'August', 'September', 'October', 'November', 'December'];
  //   const now = new Date();
  //   return `${now.getDate()}-${months[now.getMonth()]}-${now.getFullYear()}`;
  // }

  // // Helper function to load image as base64
  // private async loadImageAsBase64(imagePath: string): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     fetch(imagePath)
  //       .then(response => response.blob())
  //       .then(blob => {
  //         const reader = new FileReader();
  //         reader.onloadend = () => resolve(reader.result as string);
  //         reader.onerror = () => reject('Failed to load image');
  //         reader.readAsDataURL(blob);
  //       })
  //       .catch(() => reject('Failed to load image'));
  //   });
  // }

  // // Create Excel with header using ExcelJS
  // private async createExcelWithHeader(data: any[], titleKeyword: string): Promise<Blob> {
  //   const ExcelJS = await import('exceljs');
  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet('Technical Routes');
  
  //   let validKeys = Object.keys(data[0] || {}).filter(key =>
  //     data.some(row => row[key] !== null && row[key] !== undefined && row[key] !== '')
  //   );
  //   validKeys = validKeys.filter(k => k.toLowerCase() !== 'gbrn');
  
  //   const dateStr = this.formatDate();
  //   const title = `Technical Routes`;
  //   const keyword = `SEARCH: ${titleKeyword}`;
  
  //   // ==== Header Row with Logo ====
  //   const headerRow = worksheet.addRow([]);
  //   headerRow.height = 70;
  
  //   try {
  //     const logoBase64 = await this.loadImageAsBase64('assets/images/logo.png');
  //     const img = workbook.addImage({ base64: logoBase64, extension:'png' });
  //     worksheet.addImage(img,{ tl:{col:0,row:0}, ext:{width:170,height:70} });
  //     worksheet.getColumn(1).width = 20;
  //   } catch {}
  
  //   worksheet.mergeCells('B1:C1');
  //   const titleCell = worksheet.getCell('B1');
  //   titleCell.value = title;
  //   titleCell.font = { bold:true, size:15, color:{argb:'FF0032A0'} };
  //   titleCell.alignment = {horizontal:'center',vertical:'middle'};
  
  //   worksheet.getCell('D1').value = dateStr;
  //   worksheet.getCell('D1').font = { bold:true };
  //   worksheet.getCell('D1').alignment = {horizontal:'center',vertical:'middle',wrapText:true};
  
  //   worksheet.getCell('E1').value = keyword;
  //   worksheet.getCell('E1').font = { bold:true };
  //   worksheet.getCell('E1').alignment = {horizontal:'center',vertical:'middle',wrapText:true};
  
  //   worksheet.addRow([]);
  //   worksheet.addRow([]);
  
  //   // ==== Column Headers ====
  //   const keys = Object.keys(data[0]);
  //   // const headerRow2 = worksheet.addRow(keys);
  //   // headerRow2.height = 35;
  //   // headerRow2.eachCell(cell => {
  //   //   cell.font = { bold:true };
  //   //   cell.alignment = {horizontal:"center",vertical:"middle",wrapText:true};
  //   //   cell.border = { top:{style:'thin'}, bottom:{style:'thin'} };
  //   // });
  
  //   worksheet.views = [{ state:'frozen', ySplit:4 }];
  
  //   // ==== Data with Wrap Text + Auto Height ====
  //   data.forEach(row => {
  //     const excelRow = worksheet.addRow(keys.map(k => row[k] ?? ''));
  //     excelRow.eachCell(cell => cell.alignment = {wrapText:true,vertical:"top"});
  //     excelRow.commit();
  //   });
  
  //   // ==== Column Auto Width ====
  //   keys.forEach((key,i)=>{
  //     worksheet.getColumn(i+1).width = Math.min(Math.max(key.length * 2,30),60);
  //   });
  
  //   const buffer = await workbook.xlsx.writeBuffer();
  //   return new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  // }
  
  // downloadExcel(): void {
  //   this.isExportingExcel = true;

  //   // 🧠 Safely get keyword
  //   const keyword =
  //     this.keyword?.trim() ||
  //     this.currentChildAPIBody?.keyword?.trim() ||
  //     this.technicalRouteApiBody?.keyword?.trim() ||
  //     '';

  //   if (!keyword) {
  //     alert('Please perform a search before downloading Excel.');
  //     this.isExportingExcel = false;
  //     return;
  //   }

  //   // ✅ Prepare API request body
  //   this._currentChildAPIBody = {
  //     search_type: this.technicalRouteApiBody?.search_type || 'TRRN',
  //     keyword,
  //     filters: this.technicalRouteApiBody?.filters || {},
  //   };
    

  //   console.log('✅ Final Excel download body:', this._currentChildAPIBody);

  //   const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  //   this.mainSearchService.technicalRoutesdownloadexcel(this._currentChildAPIBody).subscribe({
  //     next: async (res: Blob) => {
  //       try {
  //         if (!res || res.size === 0) {
  //           console.warn('⚠️ Empty response from backend. Exporting local data.');
  //           this.exportLocalData(keyword);
  //           this.isExportingExcel = false;
  //           return;
  //         }

  //         const arrayBuffer = await res.arrayBuffer();
  //         const XLSX = await import('xlsx');
  //         const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  //         const sheetName = workbook.SheetNames[0];
  //         const worksheet = workbook.Sheets[sheetName];
  //         const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

  //         if (!jsonData.length) {
  //           console.warn('⚠️ Excel sheet is empty. Exporting local data instead.');
  //           this.exportLocalData(keyword);
  //           this.isExportingExcel = false;
  //           return;
  //         }

  //         // ✅ Remove empty columns dynamically
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

  //         // ✅ Create Excel with styled header using ExcelJS
  //         const blob = await this.createExcelWithHeader(cleanedData, keyword);

  //         const url = window.URL.createObjectURL(blob);
  //         const a = document.createElement('a');
  //         a.href = url;
  //         a.download = 'Technical Route.xlsx';
  //         document.body.appendChild(a);
  //         a.click();
  //         document.body.removeChild(a);
  //         window.URL.revokeObjectURL(url);

  //         console.log('✅ Excel downloaded successfully with header.');
  //         this.isExportingExcel = false;
  //         window.scrollTo(0, scrollTop);
  //       } catch (error) {
  //         console.error('Excel processing error:', error);
  //         this.isExportingExcel = false;
  //         this.exportLocalData(keyword);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Excel download error:', err);
  //       console.warn('⚠️ Falling back to local data export due to API error.');
  //       this.isExportingExcel = false;
  //       this.exportLocalData(keyword);
  //       window.scrollTo(0, scrollTop);
  //     },
  //   });
  // }

  // private async exportLocalData(keyword: string = ''): Promise<void> {
  //   if (!this._data || !this._data.length) {
  //     alert('No data available to export.');
  //     return;
  //   }

  //   const validKeys = Object.keys(this._data[0]).filter((key) =>
  //     this._data.some((row: any) => {
  //       const val = row[key];
  //       return val !== null && val !== undefined && val !== '';
  //     })
  //   );

  //   const filteredData = this._data.map((row: any) => {
  //     const newRow: any = {};
  //     validKeys.forEach((key) => (newRow[key] = row[key]));
  //     return newRow;
  //   });

  //   // Create Excel with styled header using ExcelJS
  //   const blob = await this.createExcelWithHeader(filteredData, keyword);

  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'Technical Route.xlsx';
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   window.URL.revokeObjectURL(url);

  //   console.log('✅ Exported local data successfully with styled header.');
  // }
  downloadExcel(): void {
    this.isExportingExcel = true;
  
    // 🧠 Safely get keyword
    const keyword =
      this.keyword?.trim() ||
      this.currentChildAPIBody?.keyword?.trim() ||
      this.technicalRouteApiBody?.keyword?.trim() ||
      '';
  
    if (!keyword) {
      alert('Please perform a search before downloading Excel.');
      this.isExportingExcel = false;
      return;
    }
  
    this._currentChildAPIBody = {
      search_type: this.technicalRouteApiBody?.search_type || 'TRRN', // or use dynamic if needed
      keyword:
        this.keyword?.trim() ||
        this.currentChildAPIBody?.keyword?.trim() ||
        this.technicalRouteApiBody?.keyword?.trim() ||
        '',
      filters: this.technicalRouteApiBody?.filters || {},
    };
    
    console.log('✅ Final Excel download body:', this._currentChildAPIBody);
  
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
    this.mainSearchService.technicalRoutesdownloadexcel(this._currentChildAPIBody).subscribe({
      next: async (res: Blob) => {
        try {
          if (!res || res.size === 0) {
            console.warn('⚠️ Empty response from backend. Exporting local data.');
            this.exportLocalData();
            this.isExportingExcel = false;
            return;
          }
  
          const arrayBuffer = await res.arrayBuffer();
          const XLSX = await import('xlsx');
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
  
          if (!jsonData.length) {
            console.warn('⚠️ Excel sheet is empty. Exporting local data instead.');
            this.exportLocalData();
            this.isExportingExcel = false;
            return;
          }
  
          // ✅ Remove empty columns dynamically
          const validKeys = Object.keys(jsonData[0]).filter((key) =>
            jsonData.some((row) => {
              const val = row[key];
              return val !== null && val !== undefined && val !== '';
            })
          );
  
          const cleanedData = jsonData.map((row) => {
            const newRow: any = {};
            validKeys.forEach((key) => (newRow[key] = row[key]));
            return newRow;
          });
  
          // ✅ Create worksheet with only valid columns
          const newWorksheet = XLSX.utils.json_to_sheet(cleanedData, { skipHeader: false });
          newWorksheet['!cols'] = validKeys.map((key) => ({
            wch: Math.min(Math.max(key.length, 20), 60),
          }));
  
          const newWorkbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'FilteredData');
  
          const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
  
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Technical-Route.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
  
          console.log('✅ Excel downloaded successfully with cleaned columns.');
          this.isExportingExcel = false;
          window.scrollTo(0, scrollTop);
        } catch (error) {
          console.error('Excel processing error:', error);
          this.isExportingExcel = false;
          this.exportLocalData();
        }
      },
      error: (err) => {
        console.error('Excel download error:', err);
        console.warn('⚠️ Falling back to local data export due to API error.');
        this.isExportingExcel = false;
        this.exportLocalData();
        window.scrollTo(0, scrollTop);
      },
    });
  }
  
  private exportLocalData(): void {
    if (!this._data || !this._data.length) {
      alert('No data available to export.');
      return;
    }
  
    import('xlsx').then((XLSX) => {
      const validKeys = Object.keys(this._data[0]).filter((key) =>
        this._data.some((row) => {
          const val = row[key];
          return val !== null && val !== undefined && val !== '';
        })
      );
  
      const filteredData = this._data.map((row) => {
        const newRow: any = {};
        validKeys.forEach((key) => (newRow[key] = row[key]));
        return newRow;
      });
  
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      worksheet['!cols'] = validKeys.map((key) => ({
        wch: Math.min(Math.max(key.length, 20), 60),
      }));
  
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'LocalData');
      XLSX.writeFile(workbook, 'Technical-Route.xlsx');
  
      console.log('✅ Exported local data successfully with cleaned columns.');
    });
  }
  copyAllApplications(el: HTMLElement): void {
    if (!this._data?.uniq_products?.length) {
      alert('No data available to copy');
      return;
    }
  
    // ✅ backend allowed limit
    const limit = this._data.copy_limit ?? this._data.uniq_products.length;
  
    const itemsToCopy = this._data.uniq_products.slice(0, limit);
  
    const textToCopy = itemsToCopy
      .map((item: string, i: number) => `${i + 1}. ${item}`)
      .join('\n');
  
    // ===== COPY =====
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
  
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  
    // ===== ICON TOGGLE =====
    const icon = el.querySelector('i');
    if (!icon) return;
  
    icon.classList.remove('fa-copy');
    icon.classList.add('fa-check');
  
    setTimeout(() => {
      icon.classList.remove('fa-check');
      icon.classList.add('fa-copy');
    }, 1200);
  }
  
  
}
