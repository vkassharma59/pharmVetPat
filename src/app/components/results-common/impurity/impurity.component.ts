import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ImpurityCardComponent } from '../impurity-card/impurity-card.component';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { Auth_operations } from '../../../Utils/SetToken';
import { LoadingService } from '../../../services/loading-service/loading.service';

@Component({
  selector: 'chem-impurity',
  standalone: true,
  imports: [CommonModule, ImpurityCardComponent, ChildPagingComponent],
  templateUrl: './impurity.component.html',
  styleUrl: './impurity.component.css'
})
export class ImpurityComponent {
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();

  @ViewChild('dropdownMenu') dropdownMenuRef!: ElementRef;
  
  searchThrough: string = '';
  resultTabs: any = {};
  isOpen: boolean = false;
  _data: any = [];
  _currentChildAPIBody: any = {};
  ImpurityBody: any;
  category_filters: any;
  searchKeyword: string = '';
  category_value: any = 'Select Category';
  @Input() keyword: string = '';
  isExportingExcel: boolean = false;
  @Input() tabName?: string;
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
      this.ImpurityBody = JSON.parse(JSON.stringify(value)) || value;
      this.searchKeyword = value.keyword || ''; // ✅ store keyword for Excel
    }
  }  

  @Input() index: any;

  constructor(
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService,
    public loadingService: LoadingService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const clickedInside = this.dropdownMenuRef?.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isOpen = false;
    }
  }

  handleFilter() {
    this.isOpen = !this.isOpen;
  }

  clear() {
    this.handleSetLoading.emit(true);
    this.category_value = 'Select Category';
    this.isOpen = false;

    if (this.ImpurityBody.filters?.category) {
      delete this.ImpurityBody.filters['category'];
    }

    this._currentChildAPIBody = {
      ...this.ImpurityBody,
      filters: { ...this.ImpurityBody.filters }
    };

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.impuritySearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.impurity_count
        };
        this.handleResultTabData.emit(res.data);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: (err) => {
        console.error(err);
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          filter_enable: false
        };
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
    });
  }

  handleSelectFilter(value: string) {
    this.isOpen = false;
    this.handleSetLoading.emit(true);

    if (value === '') {
      delete this.ImpurityBody.filters['category'];
      this.category_value = 'Select Category';
    } else {
      this.ImpurityBody.filters['category'] = value;
      this.category_value = value;
    }

    this._currentChildAPIBody = {
      ...this.ImpurityBody,
      filters: { ...this.ImpurityBody.filters }
    };

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.impuritySearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.impurity_count
        };
        this.handleResultTabData.emit(res.data);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: (err) => {
        console.error(err);
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          filter_enable: false
        };
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
    });
  }

  handleFetchFilters() {
    this.ImpurityBody.filter_enable = true;
    this.mainSearchService.impuritySearchSpecific(this.ImpurityBody).subscribe({
      next: (res) => {
        this.category_filters = res?.data?.category;
        this.ImpurityBody.filter_enable = false;
      },
      error: (err) => {
        console.error(err);
        this.ImpurityBody.filter_enable = false;
      },
    });
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
  private async createExcelWithHeader(data: any[], titleKeyword: string): Promise<Blob> {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Impurity');
  
    let validKeys = Object.keys(data[0] || {}).filter(key =>
      data.some(row => row[key] !== null && row[key] !== undefined && row[key] !== '')
    );
    validKeys = validKeys.filter(k => k.toLowerCase() !== 'gbrn');
  
    const dateStr = this.formatDate();
    const title = `Impurity Report`;
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
  
    this._currentChildAPIBody = { ...this.ImpurityBody, filters:{...this.ImpurityBody.filters} };
  
    this.mainSearchService.impuritydownloadexcel(this._currentChildAPIBody).subscribe({
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
          a.download='Impurity.xlsx';
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
