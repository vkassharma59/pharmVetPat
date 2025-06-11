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

  static apiCallCount: number = 0; // Static counter (shared across instances)
  localCount: number = 0; // Instance-specific count

  @Input()
  get data() {  
    return this._data;  
  }
  set data(value: any) {    
    if (value && Object.keys(value).length > 0) {
      JapanPMDAComponent.apiCallCount++; // Increment global counter
      this.localCount = JapanPMDAComponent.apiCallCount; // Assign to local instance

      

      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();

      if (column_list[this.resultTabs.japanApproval?.name]?.length > 0) {
        for (let i = 0; i < column_list[this.resultTabs.japanApproval.name].length; i++) {
          this.japan_approval_column[column_list[this.resultTabs.japanApproval.name][i].value] =
            column_list[this.resultTabs.japanApproval.name][i].name;
        }
      }

      this._data = value;
    }
  }

  constructor(private dialog: MatDialog, private utilityService: UtilityService) {}

  ngOnInit() {
    // Reset static counter only when the component is first loaded
    if (JapanPMDAComponent.apiCallCount === 0) {
      JapanPMDAComponent.apiCallCount = 0;
    }
  }

  ngOnDestroy() {
    // Reset counter when navigating away from the component
    JapanPMDAComponent.apiCallCount = 0;
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
  
  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: any) {
    return this.japan_approval_column[value];
  }
onImgError(event: Event) {
  const imgElement = event.target as HTMLImageElement;
  imgElement.src = 'assets/components/noimg.png';
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

  // Step 2: Find the icon inside the clicked span and swap classes
  const icon = el.querySelector('i');

  if (icon?.classList.contains('fa-copy')) {
    icon.classList.remove('fa-copy');
    icon.classList.add('fa-check');

    // Step 3: Revert it back after 1.5 seconds
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
}
