import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChemicalDirectoryDataCardComponent } from '../chemical-directory-card/chemical-directory-data-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { TechnicalRoutesComponent } from "../technical-routes/technical-routes.component";
import { UtilityService } from '../../../services/utility-service/utility.service';
import { ApiConfigService } from '../../../../appservice';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { LoadingService } from '../../../services/loading-service/loading.service';


@Component({
  selector: 'chemical-directory',
  standalone: true,
  imports: [
    ChemicalDirectoryDataCardComponent,
    CommonModule,
    ChildPagingComponent,
    TechnicalRoutesComponent
  ],
  templateUrl: './chemical-directory.component.html',
  styleUrl: './chemical-directory.component.css'
})
export class ChemicalDirectoryComponent implements OnChanges {

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @Output() activeTabChange = new EventEmitter<string>();
  @Output() handleROSChange = new EventEmitter<any>();
  @Output() handlePDFDownload = new EventEmitter<number>();
  @Input() CurrentAPIBody: any;
  @Input() isSplitDownload: boolean = false;
  @Input() hasTabDataFlag: boolean = false;
  @Input() selectedIndex: number = 0;
  private _currentChildAPIBody: any;
  @Input() keyword: string = '';
  isExportingExcel: boolean = false;
  chemicalDirectoryApiBody: any;
  @Input()
  set data(value: any) {
    this._data = value;
    this.handleResultTabData.emit(this._data || []);

  }

  get data() {
    return this._data;
  }

  _data: any = [];
  resultTabs: any = {};
  searchThrough: string = '';
  showTechnicalRoute = false;


  @Input()
  get currentChildAPIBody(): any {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    // optionally add logic here
  }

  @Input() index: any;
  @Input() tabName?: string;

  constructor(
    private utilityService: UtilityService,
    private apiConfigService: ApiConfigService,
    private mainSearchService: MainSearchService,
    public loadingService: LoadingService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      console.log('✅ ChemicalDirectoryComponent received new data:', this._data);
      // this.handleResultTabData.emit(this._data);
    }
  }

  updateDataFromPagination(newData: any) {
    this._data = newData.chem_dir_data || [];
    this.handleResultTabData.emit(newData);
    console.log("✅ Updated data from pagination:", newData);
  }

  onROSChange(event: any) {
    console.log('📥 Received ROS change from child:', event);
  }

  onActiveTabChange(tabName: string) {
    this.activeTabChange.emit(tabName);
  }
  
  private formatDate(): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    return `${now.getDate()}-${months[now.getMonth()]}-${now.getFullYear()}`;
  }

  // Helper function to load image as base64
  private async loadImageAsBase64(imagePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fetch(imagePath)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject('Failed to load image');
          reader.readAsDataURL(blob);
        })
        .catch(() => reject('Failed to load image'));
    });
  }

  // Create Excel with header using ExcelJS
  private async createExcelWithHeader(data: any[], keyword: string): Promise<Blob> {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const tabLabel = this.resultTabs.chemicalDirectory?.label || 'Chemical Directory';
    const worksheet = workbook.addWorksheet(tabLabel);
  
    //================= KEYS & HIDE GBRN =================//
    let validKeys = Object.keys(data[0] || {}).filter(key =>
      data.some(row => row[key] !== null && row[key] !== undefined && row[key] !== '')
    );
    validKeys = validKeys.filter(k => k.toLowerCase() !== 'gbrn');
  
    const dateStr = this.formatDate();
    const searchTerm = `SEARCH: ${keyword}`;
    const title = `${tabLabel.toUpperCase()} (BUILDING BLOCK) DATA REPORT`;
  
    //================= HEADER WITH LOGO =================//
    const headerRow = worksheet.addRow([]);
    headerRow.height = 80;  // ⬆ increased header height
  
    try {
      const logoBase64 = await this.loadImageAsBase64('assets/images/logo.png');
      const img = workbook.addImage({ base64: logoBase64, extension: 'png' });
  
      // ⬆ Increase logo display area
      worksheet.addImage(img, { tl:{ col:0, row:0 }, ext:{ width:180, height:80 } });
      
      // Make column for logo wider
      worksheet.getColumn(1).width = 28;  // ←⭐ wider space for logo
    } catch {}
  
    //================= TITLE + DATE =================//
    worksheet.mergeCells('B1:D1');
    const titleCell = worksheet.getCell('B1');
    titleCell.value = title;
    titleCell.font = { bold:true, size:15, color:{argb:'FF0032A0'} };
    titleCell.alignment = { horizontal:'center', vertical:'middle' };
  
    worksheet.getCell('E1').value = dateStr;
    worksheet.getCell('E1').font = { bold:true };
    worksheet.getCell('E1').alignment = { horizontal:'center', vertical:'middle', wrapText:true };
  
    worksheet.getCell('F1').value = searchTerm;
    worksheet.getCell('F1').font = { bold:true };
    worksheet.getCell('F1').alignment = { horizontal:'center', vertical:'middle', wrapText:true };
  
    worksheet.addRow([]);
    worksheet.addRow([]);
  
    //================= Column Header =================//
    const headerRow2 = worksheet.addRow(validKeys);
    headerRow2.height = 35; // bigger heading row
    headerRow2.eachCell(cell => {
      cell.font = { bold:true };
      cell.alignment = { vertical:"middle", horizontal:"center", wrapText:true };
      cell.border = { top:{style:'thin'}, bottom:{style:'thin'} };
    });
  
    worksheet.views = [{ state:'frozen', ySplit:4 }];
  
    //================= Data Rows (global height increased) =================//
    data.forEach(row => {
      const excelRow = worksheet.addRow(validKeys.map(k => row[k] ?? ''));
      excelRow.height = 100;
    
      excelRow.eachCell((cell, colNumber) => {
    
        const key = validKeys[colNumber - 1]; // Get actual column key name
    
        // 📌 Default style
        cell.alignment = { wrapText:true, vertical:"middle", horizontal:"left" };
    
        // 🎨 Apply **light blue background to chemical_name**
        if (key.toLowerCase() === 'chemical_name') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D6EAF8' }  // Light Blue HEX → ExcelJS format
          };
          cell.font = { bold:true };   // Optional if you want bold text also
        }
      });
    
      excelRow.commit();
    });
    
  
    //================= Auto Width =================//
    validKeys.forEach((key, i) => {
      const col = worksheet.getColumn(i+1);
      const maxLength = Math.max(
        key.length + 5,
        ...data.map(r => (r[key] ? String(r[key]).length : 5))
      );
      col.width = Math.min(Math.max(maxLength * 0.65, 22), 60); // Wider & wrapped
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  
  downloadExcel(): void {
    this.isExportingExcel = true;

    // 🧠 Safely get keyword
    const keyword =
      this.keyword?.trim() ||
      this.currentChildAPIBody?.keyword?.trim() ||
      this.chemicalDirectoryApiBody?.keyword?.trim() ||
      '';

    if (!keyword) {
      alert('Please perform a search before downloading Excel.');
      this.isExportingExcel = false;
      return;
    }

    // ✅ Prepare API request body
    this._currentChildAPIBody = {
      ...this.chemicalDirectoryApiBody,
      keyword,
    };

    console.log('✅ Final Excel download body:', this._currentChildAPIBody);

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.chemicalDirectorySearchSpecific(this._currentChildAPIBody).subscribe({
      next: async (res: Blob) => {
        try {
          if (!res || res.size === 0) {
            console.warn('⚠️ Empty response from backend. Exporting local data.');
            this.exportLocalData(keyword);
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
            this.exportLocalData(keyword);
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

          // ✅ Create Excel with styled header using ExcelJS
          const blob = await this.createExcelWithHeader(cleanedData, keyword);

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'ChemicalDirectory.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          console.log('✅ Excel downloaded successfully with header.');
          this.isExportingExcel = false;
          window.scrollTo(0, scrollTop);
        } catch (error) {
          console.error('Excel processing error:', error);
          this.isExportingExcel = false;
          this.exportLocalData(keyword);
        }
      },
      error: (err) => {
        console.error('Excel download error:', err);
        console.warn('⚠️ Falling back to local data export due to API error.');
        this.isExportingExcel = false;
        this.exportLocalData(keyword);
        window.scrollTo(0, scrollTop);
      },
    });
  }

  private async exportLocalData(keyword: string = ''): Promise<void> {
    if (!this._data || !this._data.length) {
      alert('No data available to export.');
      return;
    }

    const validKeys = Object.keys(this._data[0]).filter((key) =>
      this._data.some((row: any) => {
        const val = row[key];
        return val !== null && val !== undefined && val !== '';
      })
    );

    const filteredData = this._data.map((row: any) => {
      const newRow: any = {};
      validKeys.forEach((key) => (newRow[key] = row[key]));
      return newRow;
    });

    // Create Excel with styled header using ExcelJS
    const blob = await this.createExcelWithHeader(filteredData, keyword);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ChemicalDirectory.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    console.log('✅ Exported local data successfully with styled header.');
  }
  // downloadExcel(): void {
  //   this.isExportingExcel = true;
  
  //   // 🧠 Safely get keyword
  //   const keyword =
  //     this.keyword?.trim() ||
  //     this.currentChildAPIBody?.keyword?.trim() ||
  //     this.chemicalDirectoryApiBody?.keyword?.trim() ||
  //     '';
  
  //   if (!keyword) {
  //     alert('Please perform a search before downloading Excel.');
  //     this.isExportingExcel = false;
  //     return;
  //   }
  
  //   this._currentChildAPIBody = {
  //     search_type: this.chemicalDirectoryApiBody?.search_type || 'TRRN', // or use dynamic if needed
  //     keyword:
  //       this.keyword?.trim() ||
  //       this.currentChildAPIBody?.keyword?.trim() ||
  //       this.chemicalDirectoryApiBody?.keyword?.trim() ||
  //       '',
  //     filters: this.chemicalDirectoryApiBody?.filters || {},
  //   };
    
  //   console.log('✅ Final Excel download body:', this._currentChildAPIBody);
  
  //   const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  //   this.mainSearchService.ChemicalStructuredownloadexcel(this._currentChildAPIBody).subscribe({
  //     next: async (res: Blob) => {
  //       try {
  //         if (!res || res.size === 0) {
  //           console.warn('⚠️ Empty response from backend. Exporting local data.');
  //           this.exportLocalData();
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
  //           this.exportLocalData();
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
  
  //         // ✅ Create worksheet with only valid columns
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
  //         a.download = 'Chemical Directory.xlsx';
  //         document.body.appendChild(a);
  //         a.click();
  //         document.body.removeChild(a);
  //         window.URL.revokeObjectURL(url);
  
  //         console.log('✅ Excel downloaded successfully with cleaned columns.');
  //         this.isExportingExcel = false;
  //         window.scrollTo(0, scrollTop);
  //       } catch (error) {
  //         console.error('Excel processing error:', error);
  //         this.isExportingExcel = false;
  //         this.exportLocalData();
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Excel download error:', err);
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
  //     XLSX.writeFile(workbook, 'Chemical Directory.xlsx');
  
  //     console.log('✅ Exported local data successfully with cleaned columns.');
  //   });
  // }

}

