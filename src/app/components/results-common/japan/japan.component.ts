import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { JapanPMDAComponent } from "../japan-pmda/japan-pmda.component";
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';

@Component({
  selector: 'chem-japan',
  standalone: true,
  imports: [CommonModule, JapanPMDAComponent, ChildPagingComponent, TruncatePipe],
  templateUrl: './japan.component.html',
  styleUrl: './japan.component.css'
})
export class JapanComponent {
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  _currentChildAPIBody: any;
  @Input() index: any;
  @Input() tabName?: string;
  searchThrough: string = '';
  resultTabs: any = {};
  _data: any = [];
  @Input() keyword: string = '';
  isExportingExcel: boolean = false;
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
    this.handleResultTabData.emit(this._data || []);

  }
  @Input()
  get currentChildAPIBody() {

    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    if (value) {
      this.japanApiBody = JSON.parse(JSON.stringify(this._currentChildAPIBody)) || this._currentChildAPIBody;
      this.handleFetchFilters();
    }
  }
  japanApiBody: any;
  japanFilters: any = {};
  lastClickedFilterKey: string | null = null;
  filterOrSearchSource: 'filter' | 'search' | null = null;
  filterConfigs = [
    {
      key: 'company',
      label: 'company',
      dataKey: 'companyFilters',
      filterType: 'company',
      dropdownState: false
    },
    {
      key: 'active_ingredients',
      label: 'Product Name',
      dataKey: 'productFilters',
      filterType: 'active_ingredients',
      dropdownState: false
    }
  ];
  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInsideAny = this.dropdownRefs?.some((dropdown: ElementRef) =>
      dropdown.nativeElement.contains(event.target)
    );


    if (!clickedInsideAny) {
      this.filterConfigs = this.filterConfigs.map(config => ({
        ...config,
        dropdownState: false
      }));
    }
  }
  constructor(
    private utilityService: UtilityService,
    public loadingService: LoadingService,
    private mainSearchService: MainSearchService,
    private cdr: ChangeDetectorRef
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }

  // ngOnChanges() {
  //   console.log('JapanComponent received data:', this._data);
  //   this.handleResultTabData.emit(this._data);
  // }
  // ngOnInit(): void {
  //   this.japanApiBody = { ...this.currentChildAPIBody };
  //   this.japanApiBody.filters = this.japanApiBody.filters || {};
  //   this.handleFetchFilters();
  // }
  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'company':
              label = 'company';
              break;
            case 'active_ingredients':
              label = 'Product Name';
              break;
          }
        }
        return { ...item, label: label };
      }
      return item;
    });

  }

  onFilterButtonClick(filterKey: string) {
    this.lastClickedFilterKey = filterKey;
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        return { ...item, dropdownState: !item.dropdownState };
      }
      return { ...item, dropdownState: false };
    });
  }
  handleFetchFilters() {
    this.japanApiBody.filter_enable = true;

    this.mainSearchService.japanApprovalSearchSpecific(this.japanApiBody).subscribe({
      next: (result: any) => {
        const rawCompanyData = result?.data?.company || [];
        const rawProductData = result?.data?.active_ingredients || [];

        const companyFilters = rawCompanyData.map(item => ({
          name: item.name,
          value: item.value
        })) || [];

        const productFilters = rawProductData.map(item => ({
          name: item.name,
          value: item.value
        })) || [];

        this.japanFilters = {
          companyFilters: companyFilters,  
          productFilters: productFilters
        };

        this.japanApiBody.filter_enable = false;
      },
      error: (err) => {
        this.japanApiBody.filter_enable = false;
      }
    });
  }

  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    this.filterOrSearchSource = 'filter';
    this.handleSetLoading.emit(true);

    if (value === '') {
      delete this.japanApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.japanApiBody.filters[filterKey] = value;  // ✅ Only value goes in filters
      this.setFilterLabel(filterKey, name || '');
    }
    // ✅ Close dropdowns
    this.filterConfigs = this.filterConfigs.map(item => ({
      ...item,
      dropdownState: false
    }));
    // Log constructed filter object

    this._currentChildAPIBody = {
      ...this.japanApiBody,
      filters: { ...this.japanApiBody.filters }
    };
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.mainSearchService.japanApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        const resultData = res?.data || {};

        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: resultData?.japan_pmda_count
        };
        this._data = resultData?.japan_pmda_data || [];

        // ✅ Emit updated data to parent (optional)
        this.handleResultTabData.emit(resultData);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: (err) => {
        console.error("❌ Error while filtering data", err);
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          filter_enable: false
        };
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      }
    });
  }
  onChildPagingDataUpdate(eventData: any) {
    this._data = eventData?.japan_pmda_data || [];

    this._currentChildAPIBody = {
      ...this._currentChildAPIBody,
      count: eventData?.japan_pmda_count
    };
    this.cdr.detectChanges(); // Optional — use only if UI isn't updating as expected
    this.handleResultTabData.emit(eventData); // Optional — needed if parent needs it
  }
  clear() {
    this.filterConfigs = this.filterConfigs.map(config => {
      this.filterOrSearchSource = null;
      let defaultLabel = '';
      switch (config.key) {
        case 'company': defaultLabel = 'company'; break;
        case 'active_ingredients': defaultLabel = 'Product Name'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    this.japanApiBody.filters = {};
    this._currentChildAPIBody = {
      ...this.japanApiBody,
      filters: {}
    };

    this.handleSetLoading.emit(true);
    this.mainSearchService.japanApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.japan_pmda_count
        };
        this._data = res?.data?.japan_pmda_data || [];
        this.handleResultTabData.emit(res.data);
        this.handleSetLoading.emit(false);
      },
      error: (err) => {
        console.error(err);
        this._currentChildAPIBody.filter_enable = false;
        this.handleSetLoading.emit(false);
      }
    });

    window.scrollTo(0, 0);
  }
  private formatDate(): string {
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const now = new Date();
    return `${now.getDate()}-${months[now.getMonth()]}-${now.getFullYear()}`;
  }
  
  // Convert Logo into Base64
  private async loadImageAsBase64(imagePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fetch(imagePath)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject();
          reader.readAsDataURL(blob);
        })
        .catch(() => reject());
    });
  }
  
  
  // ⭐ MASTER EXCEL EXPORT FUNCTION — Header + Logo + Row Expand + Wrap Text
  private async createExcelWithHeader(data: any[], titleKeyword: string): Promise<Blob> {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Japan');
    let validKeys = Object.keys(data[0] || {}).filter(key =>
      data.some(row => row[key] !== null && row[key] !== undefined && row[key] !== '')
    );
    validKeys = validKeys.filter(k => k.toLowerCase() !== 'gbrn');
  
    const dateStr = this.formatDate();
    const searchTerm = `SEARCH: ${titleKeyword}`;
    const title = `Japan PMDA Approval Report`;
    const keyword = `SEARCH: ${titleKeyword}`;
  
    // ==== Header Row with Logo ====
    const headerRow = worksheet.addRow([]);
    headerRow.height = 70;
  
    try {
      const logoBase64 = await this.loadImageAsBase64('assets/images/logo.png');
      const img = workbook.addImage({ base64: logoBase64, extension:'png' });
      worksheet.addImage(img,{ tl:{col:0,row:0}, ext:{width:170,height:70} });
      worksheet.getColumn(1).width = 20;
    } catch {}
  
    worksheet.mergeCells('B1:C1');
    const titleCell = worksheet.getCell('B1');
    titleCell.value = title;
    titleCell.font = { bold:true, size:15, color:{argb:'FF0032A0'} };
    titleCell.alignment = {horizontal:'center',vertical:'middle'};
  
    worksheet.getCell('D1').value = dateStr;
    worksheet.getCell('D1').font = { bold:true };
    worksheet.getCell('D1').alignment = {horizontal:'center',vertical:'middle',wrapText:true};
  
    worksheet.getCell('E1').value = keyword;
    worksheet.getCell('E1').font = { bold:true };
    worksheet.getCell('E1').alignment = {horizontal:'center',vertical:'middle',wrapText:true};
  
    worksheet.addRow([]);
    worksheet.addRow([]);
  
    // ==== Column Headers ====
    const keys = Object.keys(data[0]);
    const headerRow2 = worksheet.addRow(keys);
    headerRow2.height = 35;
    headerRow2.eachCell(cell => {
      cell.font = { bold:true };
      cell.alignment = {horizontal:"center",vertical:"middle",wrapText:true};
      cell.border = { top:{style:'thin'}, bottom:{style:'thin'} };
    });
  
    worksheet.views = [{ state:'frozen', ySplit:4 }];
  
    // ==== Data with Wrap Text + Auto Height ====
    data.forEach(row => {
      const excelRow = worksheet.addRow(keys.map(k => row[k] ?? ''));
      excelRow.eachCell(cell => cell.alignment = {wrapText:true,vertical:"top"});
      excelRow.commit();
    });
  
    // ==== Column Auto Width ====
    keys.forEach((key,i)=>{
      worksheet.getColumn(i+1).width = Math.min(Math.max(key.length * 2,30),60);
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  }
  
  downloadExcel(): void {
    this.isExportingExcel = true;
  
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
    this._currentChildAPIBody = { ...this.japanApiBody, filters:{...this.japanApiBody.filters} };
  
    this.mainSearchService.japanApprovaldownloadexcel(this._currentChildAPIBody).subscribe({
      next: async(res:Blob)=>{
        try{
          const buffer = await res.arrayBuffer();
          const XLSX = await import('xlsx');
          const wb = XLSX.read(buffer,{type:'array'});
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const jsonData:any[] = XLSX.utils.sheet_to_json(sheet);
  
          if(!jsonData.length){ this.isExportingExcel=false; return;}
  
          // clean empty cols
          const keys = Object.keys(jsonData[0]).filter(k=>jsonData.some(r=>r[k]));
          const finalData = jsonData.map(r=>{ let obj:any={}; keys.forEach(k=>obj[k]=r[k]); return obj; });
  
          // 🔥 Generate styled excel with header
          const blob = await this.createExcelWithHeader(finalData,this.searchThrough);
  
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href=url;
          a.download='Japan.xlsx';
          a.click();
          URL.revokeObjectURL(url);
  
        }catch(e){ console.error(e); }
  
        this.isExportingExcel=false;
        window.scrollTo(0,scrollTop);
      },
      error:(err)=>{
        console.error(err);
        this.isExportingExcel=false;
        window.scrollTo(0,scrollTop);
      }
    });
  }
}



