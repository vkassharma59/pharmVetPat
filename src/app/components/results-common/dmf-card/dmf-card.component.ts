import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { environment } from '../../../../environments/environment';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dmf-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dmf-card.component.html',
  styleUrl: './dmf-card.component.css'
})
export class DmfCardComponent {
  _data: any = [];
  noMatchingData: boolean = false;
  MoreInfo: boolean = false;
  pageNo: number = 1;
  dmf_column: Record<string, string> = {};
  resultTabs: any = {};
  columns: any[] = [];

  static apiCallCount: number = 0;
  localCount: number = 0;

  constructor(private dialog: MatDialog, private utilityService: UtilityService) {

  }


  
  @Input()
  get data() {
    return this._data;
  }

  set data(value: any) {
 if (value && Object.keys(value).length > 0) {
     // this.noMatchingData = false;
      DmfCardComponent.apiCallCount++;
      this.localCount = DmfCardComponent.apiCallCount;
      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();

      if (column_list[this.resultTabs.dmf?.name]?.length > 0) {
        for (let i = 0; i < column_list[this.resultTabs.dmf.name].length; i++) {
          const col = column_list[this.resultTabs.dmf.name][i];
          this.dmf_column[col.value] = col.name;
        }
      }
      this._data = value;
    } 
  }

  // get dataKeys(): string[] {
  //   const keys = this._data ? Object.keys(this._data) : [];
  //   return keys;
  // }

  // get techSupplierList() {
  //   const list = this._data?.tech_supplier_data ?? [];
  //   return list;
  // }


  ngOnInit() {
    if (DmfCardComponent.apiCallCount === 0) {
      DmfCardComponent.apiCallCount = 0;
    }
  }

  ngOnDestroy() {
    DmfCardComponent.apiCallCount = 0;
  }

  isEmptyObject(obj: any): boolean {
    const isEmpty = Object.keys(obj).length === 0;
    return isEmpty;
  }

  toggleMoreInfo(): void {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: any): string {
    const name = this.dmf_column[value] || value;
    return name;
  }

  getPubchemId(value: any): string {
    const url = `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(value)}`;
    return url;
  }

  getCompanyLogo(value: any): string {
    const url = value?.company_logo ? `${environment.baseUrl}${environment.domainNameCompanyLogo}${value.company_logo}` : '';
    return url;
  }

  getCountryUrl(value: any): string {
    const url = value?.country_of_company ? `${environment.baseUrl}${environment.countryNameLogoDomain}${value.country_of_company}.png` : '';
    return url;
  }

  getCompanyWebsite(value: any): string {
    const url = value ? `https://${value}` : '#';
    return url;
  }

  handleCopy(text: string, event: MouseEvent) {
  
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
  
    textArea.select();
    textArea.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(textArea);
  
    // Get the clicked element from event
    const target = event.currentTarget as HTMLElement;
    const icon = target.querySelector('i');
  
    if (icon?.classList.contains('fa-copy')) {
      icon.classList.remove('fa-copy');
      icon.classList.add('fa-check');
      setTimeout(() => {
        icon.classList.remove('fa-check');
        icon.classList.add('fa-copy');
      }, 1500);
    }
  }
  

  getImageUrl(): string {
    const url = this._data?.company_logo ? `${environment.baseUrl}${environment.domainNameCompanyLogo}${this._data.company_logo}` : '';
    return url;
  }

  copyText(elementId: string, event: Event) {
    const el = event.currentTarget as HTMLElement;
    const textToCopy = document.getElementById(elementId)?.innerText;

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        if (el.classList.contains('fa-copy')) {
          el.classList.remove('fa-copy');
          el.classList.add('fa-check');
          setTimeout(() => {
            el.classList.remove('fa-check');
            el.classList.add('fa-copy');
          }, 1500);
        }
      }).catch(err => {
        console.error('[DmfCardComponent] ❌ Failed to copy text:', err);
      });
    }
  }
}

