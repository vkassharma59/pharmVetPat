import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Auth_operations } from '../../../Utils/SetToken';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-litigation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './litigation-card.component.html',
  styleUrl: './litigation-card.component.css'
})
export class LitigationCardComponent implements OnInit, OnDestroy {

  _data: any = [];
  MoreInfo: boolean = false;
  pageNo: number = 1;
  litigation_column: any = {};
  resultTabs: any = {};
  copied: boolean = false;

  static apiCallCount: number = 0; // Global static counter
  localCount: number = 0; // Stores instance-specific count

  @Input()
  get data() {  
    return this._data;  
  }
  set data(value: any) {    
    if (value && Object.keys(value).length > 0) {
      LitigationCardComponent.apiCallCount++; // Increment static counter
      this.localCount = LitigationCardComponent.apiCallCount; // Assign to local instance
     
      console.log(`API data received ${this.localCount} times`);

      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();

      if (column_list[this.resultTabs.litigation?.name]?.length > 0) {
        for (let i = 0; i < column_list[this.resultTabs.litigation.name].length; i++) {
          this.litigation_column[column_list[this.resultTabs.litigation.name][i].value] =
            column_list[this.resultTabs.litigation.name][i].name;
        }
      }

      this._data = value;
    }
  }

  constructor(private dialog: MatDialog, private utilityService: UtilityService) {}

  ngOnInit() {
    // Reset counter only when the component is first loaded
    if (LitigationCardComponent.apiCallCount === 0) {
      LitigationCardComponent.apiCallCount = 0;
    }
  }

  ngOnDestroy() {
    // Reset counter when navigating away from the component
    LitigationCardComponent.apiCallCount = 0;
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
  
  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: any) {
    return this.litigation_column[value];
  }

  getPubchemId(value: any) {
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

  handleCopy(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);

    textArea.select();
    textArea.setSelectionRange(0, 99999);
    document.execCommand('copy');

    document.body.removeChild(textArea);
    this.copied = true;

    // Reset to original icon after 1.5s
    setTimeout(() => {
      this.copied = false;
    }, 1500);
  }

  getImageUrl(data: any): string {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${this._data?.defendant_logo}`;
  }

  getImageUrl1(data: any): string {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${this._data?.plaintiff_logo}`;
  }
}
