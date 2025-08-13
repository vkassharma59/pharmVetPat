import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Auth_operations } from '../../../Utils/SetToken';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-japan-pmda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './japan-pmda.component.html',
  styleUrl: './japan-pmda.component.css'
})
export class JapanPMDAComponent implements OnInit, OnDestroy {

  _data: any = [];
  MoreInfo: boolean = false;
  pageNo: number = 1;
  japan_approval_column: any = {};
  resultTabs: any = {};

  static apiCallCount: number = 0;
  localCount: number = 0;
 showFull = false;
  toggleView() {
    this.showFull = !this.showFull;
  }
  @Input()
  get data() {
    return this._data;
  }

  set data(value: any) {
    if (value && Object.keys(value).length > 0) {
      JapanPMDAComponent.apiCallCount++;
      this.localCount = JapanPMDAComponent.apiCallCount;

      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();

      const tabKey = this.resultTabs?.japanApproval?.name || 'JAPAN_APPROVAL'; // fallback key

      if (column_list?.[tabKey]?.length > 0) {
        for (const col of column_list[tabKey]) {
          this.japan_approval_column[col.value] = col.name;
        }
      } else {
        console.warn(`⚠️ No columns found for tab key: ${tabKey}`);
      }

      this._data = value;
    }
  }

  constructor(private dialog: MatDialog, private utilityService: UtilityService) {}

  ngOnInit() {
    // No need to reset, already initialized
  }

  ngOnDestroy() {
    JapanPMDAComponent.apiCallCount = 0;
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: string): string {
    return this.japan_approval_column?.[value];
  }

  getPubchemId(value: string) {
    return `https://pubchem.ncbi.nlm.nih.gov/#query=${value}`;
  }

  getCompanyLogo(value: any): string {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${value?.company_logo}`;
  }

  getCountryUrl(value: any) {
    return `${environment.baseUrl}${environment.countryNameLogoDomain}${value?.country_of_company}.png`;
  }

  getCompanyWebsite(value: string) {
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
      this._data?.company_logo
    );
  }
  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    element.src = '/assets/no-image.jpg'; // Fallback image path
    }
}
