import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Auth_operations } from '../../../Utils/SetToken';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-korea-orangebook',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './korea-orangebook.component.html',
  styleUrl: './korea-orangebook.component.css'
})
export class KoreaOrangebookComponent implements OnInit, OnDestroy {

  _data: any = [];
  MoreInfo: boolean = false;
  pageNo: number = 1;
  korea_approval_column: any = {};
  resultTabs: any = {};
  @Input() currentChildAPIBody: any;
  @Input() index: number = 0;
 showFull = false;
  toggleView() {
    this.showFull = !this.showFull;
  }
  static apiCallCount: number = 0; // Global static counter
  localCount: number = 0; // Instance-specific count

  @Input()
  get data() {
    return this._data;
  }

  set data(value: any) {
    if (value && Object.keys(value).length > 0) {
      KoreaOrangebookComponent.apiCallCount++;
      this.localCount = KoreaOrangebookComponent.apiCallCount;

      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();

      const tabKey = this.resultTabs?.koreaApproval?.name || 'KOREA_APPROVAL';
      console.log('🟡 column_list:', column_list);
      console.log('🟡 resultTabs:', this.resultTabs);
      console.log('🟡 tabKey:', tabKey);

      if (column_list?.[tabKey]?.length > 0) {
        column_list[tabKey].forEach((col: any) => {
          this.korea_approval_column[col.value] = col.name;
        });
      } else {
        console.warn(`⚠️ No column list found for key: ${tabKey}`);
      }

      this._data = value;
    }
  }

  constructor(private dialog: MatDialog, private utilityService: UtilityService) { }

  ngOnInit() {
    if (KoreaOrangebookComponent.apiCallCount === 0) {
      KoreaOrangebookComponent.apiCallCount = 0;
    }
  }

  ngOnDestroy() {
    KoreaOrangebookComponent.apiCallCount = 0;
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: any): string {
    const label = this.korea_approval_column?.[value];
    return label ?? value; // fallback to key if no label found
  }

  getPubchemId(value: any) {
    return `https://pubchem.ncbi.nlm.nih.gov/#query=${value}`;
  }

  getCompanyLogo(value: any): string {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${value?.company_logo}`;
  }

  getCountryUrl(value: any) {
    return `${environment.baseUrl}${environment.countryNameLogoDomain}${value?.country_of_company}.png`;
  }

  getCompanyWebsite(value: any) {
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
