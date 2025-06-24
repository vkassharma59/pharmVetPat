import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';

@Component({
  selector: 'app-veterinary-us-approval-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './veterinary-us-approval-card.component.html',
  styleUrl: './veterinary-us-approval-card.component.css'
})
export class VeterinaryUsApprovalCardComponent implements OnInit, OnDestroy {
  static apiCallCount: number = 0; // Global static counter
  _data: any = [];
  MoreInfo: boolean = false;
  searchType: string = 'trrn';
  keyword: string = '';
  pageNo: number = 1;
  litigation_column: any = {};
  resultTabs: any = {};
  copied: boolean = false;
  veterinary_column: any = {};
  apiCallInstance: number = 0; // ✅ Instance-specific count

  localCount: number = 0;
  @Input()
  get data() {
    return this._data;
  }
  // set data(value: any) {
  //   if (value) {
  //     console.log(value);
  //     this._data = value;
  //   }
  // }
  set data(value: any) {
    if (value && Object.keys(value).length > 0) {
      VeterinaryUsApprovalCardComponent.apiCallCount++; // Increment global counter
      this.localCount = VeterinaryUsApprovalCardComponent.apiCallCount; // Assign to local instance
      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();
      if (column_list[this.resultTabs.veterinaryUsApproval?.name]?.length > 0) {
        for (let i = 0; i < column_list[this.resultTabs.veterinaryUsApproval.name].length; i++) {
          this.veterinary_column[column_list[this.resultTabs.veterinaryUsApproval.name][i].value] =
            column_list[this.resultTabs.veterinaryUsApproval.name][i].name;
        }
      }

      this._data = value;
    }
  }


  constructor(private dialog: MatDialog, private utilityService: UtilityService) { }

  ngOnInit() {
    console.log("bydayfhuasg", this._data)
    // ✅ Assign static mock data
    // this._data = {
    //   active_ingredient_biologics_combination: "ATORVASTATIN CALCIUM",
    //   defendants: "ACEPROMAZINE MALEATE",
    //   gbrn: "GBR98765",
    //   patent_numbers: "015-030",
    //   country: "PROMACE® INJECTABLE",
    //   uniform_resource_locator_url: "https://chemrobotics.com/litigation/pfizer-vs-ranbaxy",
    //   plaintiff_logo: "assets/images/pfizer_logo.png",
    //   defendant_logo: "assets/images/ranbaxy_logo.png"
    // };
    // this.litigation_column = {
    //   gbrn: "GBRN",
    //   patent_numbers: "Application Number",
    //   defendants: "Active Ingredient",
    //   country: "Trade Name",
    //   uniform_resource_locator_url: "URL"
    // };
    if (VeterinaryUsApprovalCardComponent.apiCallCount === 0) {
      VeterinaryUsApprovalCardComponent.apiCallCount = 0;
    }
    // VeterinaryUsApprovalCardComponent.apiCallCount++;
    // this.localCount = VeterinaryUsApprovalCardComponent.apiCallCount;
  }


  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  ngOnDestroy() {
    VeterinaryUsApprovalCardComponent.apiCallCount = 0;
  }

  toggleMoreInfo(): void {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: any) {
    return this.veterinary_column[value] || value;
  }

  getCompanyLogo(value: any): string {
    return `assets/images/${value?.company_logo}`;
  }

  getImageUrl1(): string {
    return this._data?.plaintiff_logo;
  }

  getImageUrl(): string {
    return this._data?.defendant_logo;
  }

  getCountryUrl(): string {
    return `assets/flags/${this._data?.country?.toLowerCase()}.png`;
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
}
