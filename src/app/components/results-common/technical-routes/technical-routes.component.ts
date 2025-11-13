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
  @Input() currentChildAPIBody: any;
  @Input() specialCount: any;
  @Input() CurrentAPIBody: any;
  @Input() MainDataResultShow: any;
  @Input() index: any;
  @Input() tabName: string | undefined;
  searchThrough: string = '';
  isExportingExcel: boolean = false;
  _currentChildAPIBody: any;
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
}
