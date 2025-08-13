import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';

@Component({
  selector: 'app-veterinary-us-approval-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './veterinary-us-approval-card.component.html',
  styleUrl: './veterinary-us-approval-card.component.css'
})
export class VeterinaryUsApprovalCardComponent implements OnInit, OnDestroy {
  static apiCallCount: number = 0; // Global static counter
  _data: any = [];
  MoreInfo: boolean = false;
  searchType: string = 'trrn';
  keyword: string = '';
  pageNo: number = 1;
  litigation_column: any = {};
  resultTabs: any = {};
  copied: boolean = false;
  veterinary_column: any = {};
  veterinary_column1: any = {};
  veterinary_column2: any = {};
  veterinary_column3: any = {};
  veterinary_column4: any = {};
  veterinary_column5: any = {};
  apiCallInstance: number = 0; // ✅ Instance-specific count
  // columnMap: { [key: string]: any[] } = {};
  dataMap: { [key: string]: any[] } = {};
  columnMap: any = {}; // already being used
  showFull = false;
  toggleView() {
    this.showFull = !this.showFull;
  }
  localCount: number = 0;
  @Input()
  get data() {
    return this._data;
  }

  set data(value: any) {
    if (value && Object.keys(value).length > 0) {
      VeterinaryUsApprovalCardComponent.apiCallCount++; // Increment global counter
      this.localCount = VeterinaryUsApprovalCardComponent.apiCallCount; // Assign to local instance
      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();
      // ✅ Only get the voluntaryWithdrawalColumnList
      //  console.log("oluntaryCols?.columns",voluntaryCols[this.resultTabs.veterinaryUsApproval?.name])
      // const column_list = voluntaryCols?.columns;
      if (column_list[this.resultTabs.veterinaryUsApproval?.name]?.exclusivityColumnList?.length > 0) {
        for (let col of column_list[this.resultTabs.veterinaryUsApproval?.name]?.exclusivityColumnList) {
          this.veterinary_column3[col.value] = col.name;
        }
      }
      if (column_list[this.resultTabs.veterinaryUsApproval?.name]?.columns?.length > 0) {
        for (let col of column_list[this.resultTabs.veterinaryUsApproval?.name]?.columns) {
          this.veterinary_column[col.value] = col.name;
        }
      }
      if (column_list[this.resultTabs.veterinaryUsApproval?.name]?.nadaAnadaColumnList?.length > 0) {
        for (let col of column_list[this.resultTabs.veterinaryUsApproval?.name]?.nadaAnadaColumnList) {
          this.veterinary_column1[col.value] = col.name;
        }
      }
      if (column_list[this.resultTabs.veterinaryUsApproval?.name]?.noticeOfHearingColumnList?.length > 0) {
        for (let col of column_list[this.resultTabs.veterinaryUsApproval?.name]?.noticeOfHearingColumnList) {
          this.veterinary_column4[col.value] = col.name;
        }
      }
      if (column_list[this.resultTabs.veterinaryUsApproval?.name]?.patentInfoColumnList?.length > 0) {
        for (let col of column_list[this.resultTabs.veterinaryUsApproval?.name]?.patentInfoColumnList) {
          this.veterinary_column2[col.value] = col.name;
        }
      }
      if (column_list[this.resultTabs.veterinaryUsApproval?.name]?.voluntaryWithdrawalColumnList?.length > 0) {
        for (let col of column_list[this.resultTabs.veterinaryUsApproval?.name]?.voluntaryWithdrawalColumnList) {
          this.veterinary_column5[col.value] = col.name;
        }
      }
      this._data = value;
    }
  }
  constructor(private dialog: MatDialog, private utilityService: UtilityService) { }
  ngOnInit() {
     console.log('get data called--------------',this._data);
    if (VeterinaryUsApprovalCardComponent.apiCallCount === 0) {
      VeterinaryUsApprovalCardComponent.apiCallCount = 0;
    }
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  ngOnDestroy() {
    VeterinaryUsApprovalCardComponent.apiCallCount = 0;
  }

  getColumns(sectionName: string): any[] {
    return this.columnMap[sectionName] || [];
  }
  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  getSectionTitle(key: string): string {
    const sectionMap: any = {
      nadaAnadaData: 'NADA ANADA',
      exclusivityData: 'Exclusivity Periods',
      noticeOfHearingData: 'Notice of Hearing',
      patentInfoData: 'Patent Information',
      voluntaryWithdrawalData: 'Voluntary Withdrawal'
    };
    return sectionMap[key] || key;
  }




  toggleMoreInfo(): void {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: any) {
    return this.veterinary_column[value];
  }
  getColumnName1(value: any) {
    return this.veterinary_column1[value];
  }
  getColumnName2(value: any) {
    return this.veterinary_column2[value];
  }
  getColumnName3(value: any) {
    return this.veterinary_column3[value];
  }
  getColumnName4(value: any) {
    return this.veterinary_column4[value];
  }
  getColumnName5(value: any) {
    return this.veterinary_column5[value];
  }
  getCompanyLogo(value: any): string {
    return `assets/images/${value?.company_logo}`;
  }

  getImageUrl1(): string {
    return this._data?.plaintiff_logo;
  }

  getImageUrl(): string {
    return this._data?.defendant_logo;
  }

  getCountryUrl(): string {
    return `assets/flags/${this._data?.country?.toLowerCase()}.png`;
  }

  getCompanyWebsite(value: any): string {
    return `https://${value}`;
  }

  handleCopy(text: string, el: HTMLElement) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);

    textArea.select();
    textArea.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(textArea);

    const icon = el.querySelector('i');
    if (icon?.classList.contains('fa-copy')) {
      icon.classList.remove('fa-copy');
      icon.classList.add('fa-check');
      setTimeout(() => {
        icon.classList.remove('fa-check');
        icon.classList.add('fa-copy');
      }, 1500);
    }
  }
}
