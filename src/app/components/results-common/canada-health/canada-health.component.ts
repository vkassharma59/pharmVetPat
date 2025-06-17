import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Auth_operations } from '../../../Utils/SetToken';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-canada-health',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './canada-health.component.html',
  styleUrl: './canada-health.component.css'
})
export class CanadaHealthComponent implements OnInit, OnDestroy {

  _data: any = [];
  MoreInfo: boolean = false;
  pageNo: number = 1;
  canada_approval_column: any = {};
  resultTabs: any = {};

  static apiCallCount: number = 0;
  localCount: number = 0;

  @Input()
  get data() {
    return this._data;
  }

  set data(value: any) {
    if (value && Object.keys(value).length > 0) {
      CanadaHealthComponent.apiCallCount++;
      this.localCount = CanadaHealthComponent.apiCallCount;

      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();

      const tabKey = this.resultTabs?.canadaApproval?.name || 'CANADA_APPROVAL';

      if (column_list?.[tabKey]?.length > 0) {
        for (const col of column_list[tabKey]) {
          this.canada_approval_column[col.value] = col.name;
        }
      } else {
        console.warn(`⚠️ No columns found for tab key: ${tabKey}`);
      }

      this._data = value;
    }
  }

  constructor(private dialog: MatDialog, private utilityService: UtilityService) { }

  ngOnInit() {
    // No need to reset - already initialized
  }

  ngOnDestroy() {
    CanadaHealthComponent.apiCallCount = 0;
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: any) {
    return this.canada_approval_column?.[value] ?? value;
  }

  getPubchemId(value: any): string {
    return `https://pubchem.ncbi.nlm.nih.gov/#query=${value}`;
  }

  getCompanyLogo(value: any): string {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${value?.company_logo}`;
  }

  getCountryUrl(value: any): string {
    return `${environment.baseUrl}${environment.countryNameLogoDomain}${value?.country_of_company}.png`;
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

  getImageUrl(data: any): string {
    return (
      environment.baseUrl +
      environment.domainNameCompanyLogo +
      data?.company_logo
    );
  }
}
