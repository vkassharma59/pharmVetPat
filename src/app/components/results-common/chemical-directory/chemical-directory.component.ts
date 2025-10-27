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
  @Input() CurrentAPIBody: any;
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
  
    this.mainSearchService.koreaApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
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
          a.download = 'chemicalDirectory.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
  
          console.log('✅ Excel downloaded successfully with cleaned columns (Korea).');
          this.isExportingExcel = false;
          window.scrollTo(0, scrollTop);
        } catch (error) {
          console.error('Excel processing error (Korea):', error);
          this.isExportingExcel = false;
          this.exportLocalData();
        }
      },
      error: (err) => {
        console.error('Excel download error (Korea):', err);
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
      XLSX.writeFile(workbook, 'ChemicalDirectory.xlsx');
  
      console.log('✅ Exported local data successfully with cleaned columns (Korea).');
    });
  }

}

