import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Auth_operations } from '../../../Utils/SetToken';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'chem-imp-patents-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imp-patents-card.component.html',
  styleUrl: './imp-patents-card.component.css'
})
export class ImpPatentsCardComponent implements OnInit, OnDestroy {

  _data: any = [];
  MoreInfo: boolean = false;
  pageNo: number = 1;
  imp_patents_column: Record<string, string> = {};
  resultTabs: any = {};

  static apiCallCount: number = 0; // Global static counter
  localCount: number = 0; // Instance-specific count

  constructor(private dialog: MatDialog, private utilityService: UtilityService) {}

  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    if (value && Object.keys(value).length > 0) {
      ImpPatentsCardComponent.apiCallCount++; // Increment static counter
      this.localCount = ImpPatentsCardComponent.apiCallCount; // Assign instance count
      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();

      if (column_list[this.resultTabs.impPatents?.name]?.length > 0) {
        for (let i = 0; i < column_list[this.resultTabs.impPatents.name].length; i++) {
          this.imp_patents_column[column_list[this.resultTabs.impPatents.name][i].value] =
            column_list[this.resultTabs.impPatents.name][i].name;
        }
      }

      this._data = value;
    }
  }

  ngOnInit() {
    if (ImpPatentsCardComponent.apiCallCount === 0) {
      ImpPatentsCardComponent.apiCallCount = 0;
    }
  }

  ngOnDestroy() {
    ImpPatentsCardComponent.apiCallCount = 0;
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
  
  toggleMoreInfo(): void {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: any): string {
    return this.imp_patents_column[value] || value;
  }

  getPubchemId(value: any): string {
    return `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(value)}`;
  }

  getCompanyLogo(value: any): string {
    return value?.company_logo ? `${environment.baseUrl}${environment.domainNameCompanyLogo}${value.company_logo}` : '';
  }

  getCountryUrl(value: any): string {
    return value?.country_of_company ? `${environment.baseUrl}${environment.countryNameLogoDomain}${value.country_of_company}.png` : '';
  }

  getCompanyWebsite(value: any): string {
    return value ? `https://${value}` : '#';
  }

  handleCopy(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);

    textArea.select();
    textArea.setSelectionRange(0, 99999);
    document.execCommand('copy');

    document.body.removeChild(textArea);
  }

  getImageUrl(): string {
    return this._data?.company_logo ? `${environment.baseUrl}${environment.domainNameCompanyLogo}${this._data.company_logo}` : '';
  }
}