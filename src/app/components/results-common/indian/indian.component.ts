import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { IndianMedicineCardComponent } from '../indian-medicine-card/indian-medicine-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
@Component({
  selector: 'chem-indian',
  standalone: true,
  imports: [CommonModule,IndianMedicineCardComponent,ChildPagingComponent],
  templateUrl: './indian.component.html',
  styleUrl: './indian.component.css'
})
export class IndianComponent {
  
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @Input() currentChildAPIBody: any;
  isExportingExcel: boolean = false;
  filterOrSearchSource: 'filter' | 'search' | null = null;
  @Input() keyword: string = '';
  _currentChildAPIBody: any;
  indianApiBody: any;
     resultTabs: any = {};
     searchThrough: string = '';
     _data: any = [];
     @Input()
     get data() {
       return this._data;
     }
     set data(value: any) {
       this._data = value;
     }
     @Input() index: any;
     @Input() tabName?: string;
   
     constructor(private utilityService: UtilityService, public loadingService: LoadingService, private dialog: MatDialog, private mainsearchsearvice: MainSearchService) {
       this.resultTabs = this.utilityService.getAllTabsName();
       this.searchThrough = Auth_operations.getActiveformValues().activeForm;
     }
     ngOnChanges() {
      console.log('JapanComponent received data:', this._data);
    }
    downloadExcel(): void {
      this.isExportingExcel = true;
    
      // 🧠 Safely get keyword
      const keyword =
        this.keyword?.trim() ||
        this.currentChildAPIBody?.keyword?.trim() ||
        this.indianApiBody?.keyword?.trim() ||
        '';
    
      if (!keyword) {
        alert('Please perform a search before downloading Excel.');
        this.isExportingExcel = false;
        return;
      }
    
      // ✅ Prepare API request body
      this._currentChildAPIBody = {
        ...this.indianApiBody,
        keyword,
      };
    
      console.log('✅ Final Excel download body:', this._currentChildAPIBody);
    
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
      this.mainsearchsearvice.scientificDocsdownloadexcel(this._currentChildAPIBody).subscribe({
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
            a.download = 'Indian-Medicine.xlsx';
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
        XLSX.writeFile(workbook, 'Indian-Data.xlsx');
    
        console.log('✅ Exported local data successfully with cleaned columns.');
      });
    }
    
}
