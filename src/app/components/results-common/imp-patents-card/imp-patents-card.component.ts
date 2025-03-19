import { Component, Input } from '@angular/core';
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
export class ImpPatentsCardComponent {

  _data: any = [];
  MoreInfo: boolean = false;
  pageNo: number = 1;
  imp_patents_column: Record<string, string> = {};
  resultTabs: any = {};

  // API Call Counter (Static for all instances)
  static apiCallCount: number = 0; 
  localCount: number = 0; 

  @Input()
  get data() {  
    return this._data;  
  }
  set data(value: any) {    
    if (value && Object.keys(value).length > 0) {
      // Increment Global and Local API call counts
      ImpPatentsCardComponent.apiCallCount++;
      this.localCount = ImpPatentsCardComponent.apiCallCount;
      console.log(`API data received ${this.localCount} times`);

      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();
      
      if (column_list[this.resultTabs.impPatents?.name]?.length > 0) {
        this.imp_patents_column = column_list[this.resultTabs.impPatents.name].reduce(
          (acc: Record<string, string>, column: any) => {
            acc[column.value] = column.name;
            return acc;
          }, {}
        );
      }

      this._data = value;
    }
  }

  constructor(private dialog: MatDialog, private utilityService: UtilityService) {}

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
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${value?.company_logo || ''}`;
  }

  getCountryUrl(value: any): string {
    return `${environment.baseUrl}${environment.countryNameLogoDomain}${value?.country_of_company || ''}.png`;
  }
  
  getCompanyWebsite(value: any): string {
    return value ? `https://${value}` : '#';
  }

  handleCopy(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('Item Copied!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }

  getImageUrl(): string {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${this._data?.company_logo || ''}`;
  }
}
