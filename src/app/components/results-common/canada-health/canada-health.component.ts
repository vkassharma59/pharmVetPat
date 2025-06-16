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

  static apiCallCount: number = 0; // Global static counter
  localCount: number = 0; // Instance-specific count

  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    if (value && Object.keys(value).length > 0) {
      CanadaHealthComponent.apiCallCount++; // Increment static counter
      this.localCount = CanadaHealthComponent.apiCallCount; // Assign instance count



      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();

      if (column_list[this.resultTabs.canadaApproval?.name]?.length > 0) {
        for (let i = 0; i < column_list[this.resultTabs.canadaApproval.name].length; i++) {
          this.canada_approval_column[column_list[this.resultTabs.canadaApproval.name][i].value] =
            column_list[this.resultTabs.canadaApproval.name][i].name;
        }
      }

      this._data = value;
    }
  }

  constructor(private dialog: MatDialog, private utilityService: UtilityService) { }

  ngOnInit() {
    // Reset counter only when the component is first loaded
    if (CanadaHealthComponent.apiCallCount === 0) {
      CanadaHealthComponent.apiCallCount = 0;
    }
  }

  ngOnDestroy() {
    // Reset counter when navigating away from the component
    CanadaHealthComponent.apiCallCount = 0;
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }
  onImgError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/components/noimg.png';
  }

  getColumnName(value: any) {
    return this.canada_approval_column[value];
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
      this._data?.commentry
    );
  }
}
