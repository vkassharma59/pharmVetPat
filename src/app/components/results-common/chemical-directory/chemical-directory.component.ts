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
  // Helper function to format date
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

    // Get valid keys
    const validKeys = Object.keys(data[0] || {}).filter((key) =>
      data.some((row) => {
        const val = row[key];
        return val !== null && val !== undefined && val !== '';
      })
    );

    const dateStr = this.formatDate();
    const searchTerm = `SEARCH TERM : ${keyword}`;
    const title = `${tabLabel.toUpperCase()} Data Report`;

    // Row 1: Header row with logo, title, date, search term
    const headerRow = worksheet.addRow([]);
    headerRow.height = 50;

    // Add logo image
    try {
      const logoBase64 = await this.loadImageAsBase64('assets/images/logo.png');
      const logoId = workbook.addImage({
        base64: logoBase64,
        extension: 'png',
      });
      worksheet.addImage(logoId, {
        tl: { col: 0, row: 0 },
        ext: { width: 80, height: 45 }
      });
    } catch (e) {
      console.warn('Could not load logo:', e);
    }

    // Set title in cell B1
    worksheet.getCell('B1').value = title;
    worksheet.getCell('B1').font = { 
      bold: true, 
      size: 14, 
      color: { argb: 'FF0032A0' } // Blue color
    };
    worksheet.getCell('B1').alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.mergeCells('B1:E1');

    // Set date in cell F1
    worksheet.getCell('F1').value = dateStr;
    worksheet.getCell('F1').font = { bold: true, size: 11 };
    worksheet.getCell('F1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.mergeCells('F1:H1');

    // Set search term in cell I1
    worksheet.getCell('I1').value = searchTerm;
    worksheet.getCell('I1').font = { bold: true, size: 11 };
    worksheet.getCell('I1').alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.mergeCells('I1:N1');

    // Row 2 & 3: Empty rows for spacing
    worksheet.addRow([]);
    worksheet.addRow([]);

    // Row 4: Column headers (simple format like before)
    const columnHeaderRow = worksheet.addRow(validKeys);
    columnHeaderRow.font = { bold: true };

    // Add data rows (simple format - no styling, just like before)
    data.forEach((row) => {
      worksheet.addRow(validKeys.map(key => row[key] ?? ''));
    });

    // Set column widths (increased for better readability)
    validKeys.forEach((key, index) => {
      const colNumber = index + 1;
      // Column 2 and 3 - reduced width
      if (colNumber === 2 || colNumber === 3) {
        worksheet.getColumn(colNumber).width = 10;
      } else {
        worksheet.getColumn(colNumber).width = Math.min(Math.max(key.length + 10, 25), 60);
      }
    });

    // Generate blob
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
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

}

