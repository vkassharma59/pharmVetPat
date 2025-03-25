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
  japan_approval_column: any = {};
  resultTabs: any = {};

  @Input() count!: number;  // Receiving API count from parent

  @Input()
  get data() {  
    return this._data;  
  }
  set data(value: any) {    
    if (value && Object.keys(value).length > 0) {
      console.log(`API data received for item ${this.count}`);
      
      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();
      const japanApprovalName = this.resultTabs.japanApproval?.name;

      if (column_list[japanApprovalName]?.length > 0) {
        this.japan_approval_column = column_list[japanApprovalName].reduce((acc: any, item: any) => {
          acc[item.value] = item.name;
          return acc;
        }, {});
      }

      this._data = value;
    }
  }

  constructor(private dialog: MatDialog, private utilityService: UtilityService) {}

  ngOnInit() {}

  ngOnDestroy() {}

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
  
  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: any) {
    return this.japan_approval_column[value] || value;
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

  handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Item Copied!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }

  getImageUrl(): string {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${this._data?.company_logo}`;
  }
}
