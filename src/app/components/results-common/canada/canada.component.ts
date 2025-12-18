import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChildren,
  QueryList,
  ElementRef,
  OnInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanadaHealthComponent } from '../canada-health/canada-health.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';

@Component({
  selector: 'chem-canada',
  standalone: true,
  imports: [CommonModule, CanadaHealthComponent, ChildPagingComponent, TruncatePipe],
  templateUrl: './canada.component.html',
  styleUrl: './canada.component.css'
})
export class CanadaComponent implements OnInit {
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();

  @Input() index: any;
  @Input() tabName?: string;
  filterOrSearchSource: 'filter' | 'search' | null = null;
  _data: any = [];
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }
  @Input() keyword: string = '';
  isExportingExcel: boolean = false;
 @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    if (value) {
      this.canadaPatentApiBody = JSON.parse(JSON.stringify(value)) || value;
      this.handleFetchFilters();
    }
  }
  searchThrough: string = '';
  resultTabs: any = {};

  _currentChildAPIBody: any;
  canadaPatentApiBody: any;
  canadaPatentFilters: any = {};
  lastClickedFilterKey: string | null = null;

  filterConfigs = [
    {
      key: 'product_name',
      label: 'Select Product',
      dataKey: 'productFilters',
      filterType: 'product_name',
      dropdownState: false
    },
    {
      key: 'company',
      label: 'Company',
      dataKey: 'CompanyFilters',
      filterType: 'company',
      dropdownState: false
    },
    {
      key: 'dosage_forms',
      label: 'Dosage Forms',
      dataKey: 'DosageFilters',
      filterType: 'dosage_forms',
      dropdownState: false
    },
    {
      key: 'strength',
      label: 'Strengths',
      dataKey: 'strengthFilters',
      filterType: 'strength',
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
    private mainSearchService: MainSearchService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }

  ngOnInit(): void {
    this.canadaPatentApiBody = { ...this.currentChildAPIBody };
    this.canadaPatentApiBody.filters = this.canadaPatentApiBody.filters || {};
  }


  setFilterLabel(filterKey: string, label: string) {
    this.filterConfigs = this.filterConfigs.map((item) => {
      if (item.key === filterKey) {
        if (label === '') {
          switch (filterKey) {
            case 'product_name': label = 'Select Product'; break;
            case 'company': label = 'Company'; break;
            case 'dosage_forms': label = 'Dosage Forms'; break;
            case 'strength': label = 'Strengths'; break;
          }
        }
        return { ...item, label: label };
      }
      return item;
    });
  }

  onFilterButtonClick(filterKey: string) {
    this.lastClickedFilterKey = filterKey;
    this.filterConfigs = this.filterConfigs.map((item) => ({
      ...item,
      dropdownState: item.key === filterKey ? !item.dropdownState : false
    }));
  }

  handleFetchFilters() {
    this.canadaPatentApiBody.filter_enable = true;
    this.mainSearchService.canadaApprovalSearchSpecific(this.canadaPatentApiBody).subscribe({
      next: (res: any) => {
        const productFilters = res?.data?.product_name?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const strengthFilters = res?.data?.product_name?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const companyFiltersRaw = res?.data?.company?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        const dosageFilters = res?.data?.dosage_forms?.map(item => ({
          name: item.name,
          value: item.value
        })) || [];
        this.canadaPatentFilters = {
          productFilters,
          strengthFilters,
          CompanyFilters: companyFiltersRaw,
          DosageFilters: dosageFilters
        };
        this.canadaPatentApiBody.filter_enable = false;
      },
      error: (err) => {
        console.error('Error fetching Health Canada filters:', err);
        this.canadaPatentApiBody.filter_enable = false;
      }
    });
  }
  handleSelectFilter(filterKey: string, value: any, name?: string): void {
    this.filterOrSearchSource = 'filter';
    this.handleSetLoading.emit(true);
    this.canadaPatentApiBody.filters = this.canadaPatentApiBody.filters || {};
    // Set or remove the filter
    if (value === '') {
      delete this.canadaPatentApiBody.filters[filterKey];
      this.setFilterLabel(filterKey, '');
    } else {
      this.canadaPatentApiBody.filters[filterKey] = value;
      this.setFilterLabel(filterKey, name || '');
    }
    // Close all dropdowns
    this.filterConfigs = this.filterConfigs.map(item => ({
      ...item,
      dropdownState: false
    }));

    // ✅ Reset pagination when filter changes
    const updatedBody = {
      ...this.canadaPatentApiBody,
      page_no: 1,
      start: 0,
      filters: { ...this.canadaPatentApiBody.filters }
    };
    this._currentChildAPIBody = updatedBody;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.canadaApprovalSearchSpecific(updatedBody).subscribe({
      next: (res) => {
        let resultData = res?.data || {};

        this._currentChildAPIBody = {
          ...updatedBody,
          count: resultData?.health_canada_count
        };
        this._data = resultData?.health_canada_data || [];

        this.handleResultTabData.emit(resultData);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: () => {
        this._currentChildAPIBody.filter_enable = false;
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      }
    });
  }
  clear() {
    // Reset all filter labels
    this.filterConfigs = this.filterConfigs.map(config => {
      this.filterOrSearchSource = null;
      let defaultLabel = '';
      switch (config.key) {
        case 'product_name': defaultLabel = 'Select Product'; break;
        case 'company': defaultLabel = 'Company'; break;
        case 'dosage_forms': defaultLabel = 'Dosage Forms'; break;
        case 'strength': defaultLabel = 'Strengths'; break;
      }
      return { ...config, label: defaultLabel, dropdownState: false };
    });

    // ✅ Clear filters and reset pagination
    const clearedBody = {
      ...this.canadaPatentApiBody,
      page_no: 1,
      start: 0,
      filters: {}
    };
    this.canadaPatentApiBody.filters = {};
    this._currentChildAPIBody = clearedBody;

    this.handleSetLoading.emit(true);

    this.mainSearchService.canadaApprovalSearchSpecific(clearedBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...clearedBody,
          count: res?.data?.health_canada_count
        };
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
    const months = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];
    const now = new Date();
    return `${now.getDate()}-${months[now.getMonth()]}-${now.getFullYear()}`;
  }
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
  
  private async createExcelWithHeader(
    data: any[],
    titleKeyword: string
  ): Promise<Blob> {
  
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Canada Health');
  
    // ================= HEADER INFO =================
    const dateStr = this.formatDate();
    const title = 'Canada Health';
    const keyword = `SEARCH: ${titleKeyword}`;
  
    // ================= HEADER ROW (LOGO) =================
    const headerRow = worksheet.addRow([]);
    headerRow.height = 70;
  
    try {
      const logoBase64 = await this.loadImageAsBase64('assets/images/logo.png');
      const img = workbook.addImage({ base64: logoBase64, extension: 'png' });
  
      worksheet.addImage(img, {
        tl: { col: 0, row: 0 },
        ext: { width: 170, height: 70 }
      });
  
      worksheet.getColumn(1).width = 20;
    } catch {}
  
    worksheet.mergeCells('B1:C1');
    const titleCell = worksheet.getCell('B1');
    titleCell.value = title;
    titleCell.font = { bold: true, size: 15, color: { argb: 'FF0032A0' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
    worksheet.getCell('D1').value = dateStr;
    worksheet.getCell('D1').font = { bold: true };
    worksheet.getCell('D1').alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
  
    worksheet.getCell('E1').value = keyword;
    worksheet.getCell('E1').font = { bold: true };
    worksheet.getCell('E1').alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
  
    worksheet.addRow([]);
    worksheet.addRow([]);
  
    // ================= COLUMN HEADERS (FROM EXCEL 5th ROW) =================
    const headers = Object.keys(data[0] || {}).filter(h => h);
  
    const headerRow2 = worksheet.addRow(headers);
    headerRow2.height = 35;
  
    headerRow2.eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' }
      };
    });
  
    worksheet.views = [{ state: 'frozen', ySplit: 4 }];
  
    // ================= DATA ROWS =================
    data.forEach(row => {
      const excelRow = worksheet.addRow(
        headers.map(h => row[h] ?? '')
      );
  
      excelRow.eachCell(cell => {
        cell.alignment = { wrapText: true, vertical: 'top' };
      });
    });
  
    // ================= AUTO WIDTH =================
    headers.forEach((key, i) => {
      worksheet.getColumn(i + 1).width =
        Math.min(Math.max(key.length * 2, 30), 60);
    });
  
    // ================= 🔥 HIDE EMPTY COLUMNS =================
    worksheet.columns.forEach(col => {
      if (!col || typeof col.eachCell !== 'function') return;
  
      let hasData = false;
  
      col.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber > 4 && cell.value !== null && cell.value !== '') {
          hasData = true;
        }
      });
  
      if (!hasData) {
        col.hidden = true;
      }
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }
  
  downloadExcel(): void {
    this.isExportingExcel = true;
  
    const scrollTop =
      window.pageYOffset || document.documentElement.scrollTop;
  
    this._currentChildAPIBody = {
      ...this.canadaPatentApiBody,
      filters: { ...this.canadaPatentApiBody.filters }
    };
  
    this.mainSearchService
      .canadadownloadexcel(this._currentChildAPIBody)
      .subscribe({
        next: async (res: Blob) => {
          try {
            const buffer = await res.arrayBuffer();
            const XLSX = await import('xlsx');
            const wb = XLSX.read(buffer, { type: 'array' });
            const sheet = wb.Sheets[wb.SheetNames[0]];
  
            // 🔥 RAW DATA
            const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, {
              header: 1,
              defval: ''
            });
  
            if (!rawData.length) {
              this.isExportingExcel = false;
              return;
            }
  
            // 🔥 5th row as header
            const headerRow = rawData[3];
            const dataRows = rawData.slice(4);
  
            // Build JSON
            const jsonData = dataRows.map(row => {
              const obj: any = {};
              headerRow.forEach((key, index) => {
                if (key) {
                  obj[key] = row[index] ?? '';
                }
              });
              return obj;
            });
  
            // 🔥 Remove fully empty columns
            const finalData = jsonData.map(r => {
              const obj: any = {};
              Object.keys(r).forEach(k => {
                if (jsonData.some(row => row[k])) {
                  obj[k] = r[k];
                }
              });
              return obj;
            });
  
            if (!finalData.length) {
              this.isExportingExcel = false;
              return;
            }
  
            const blob = await this.createExcelWithHeader(
              finalData,
              this.searchThrough
            );
  
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Canada Health.xlsx';
            a.click();
            URL.revokeObjectURL(url);
  
          } catch (e) {
            console.error(e);
          }
  
          this.isExportingExcel = false;
          window.scrollTo(0, scrollTop);
        },
        error: err => {
          console.error(err);
          this.isExportingExcel = false;
          window.scrollTo(0, scrollTop);
        }
      });
  }

}
