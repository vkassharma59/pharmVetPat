 import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { environment } from '../../../../environments/environment';
import { VeterinaryUsApprovalComponent } from '../veterinary-us-approval/veterinary-us-approval.component';

@Component({
  selector: 'app-veterinary-us-approval-card',
  standalone: true,
   imports: [CommonModule],
  templateUrl: './veterinary-us-approval-card.component.html',
  styleUrl: './veterinary-us-approval-card.component.css'
})
export class VeterinaryUsApprovalCardComponent implements OnInit, OnDestroy {
  private static apiCallCount: number = 0; // ✅ Global static counter
 _data: any = {};
  MoreInfo: boolean = false;
  searchType: string = 'trrn';
   keyword: string = '';
  pageNo: number = 1;
  litigation_column: any = {};
  resultTabs: any = {};
  copied: boolean = false;

   apiCallInstance: number = 0; // ✅ Instance-specific count

  localCount: number = 0;
  
  constructor(private dialog: MatDialog, private utilityService: UtilityService) {}

  ngOnInit() {
    // ✅ Assign static mock data
    this._data = {
      active_ingredient_biologics_combination: "ATORVASTATIN CALCIUM",
         defendants: "ACEPROMAZINE MALEATE",
      gbrn: "GBR98765",
      patent_numbers: "015-030",
      country: "PROMACE® INJECTABLE",
      uniform_resource_locator_url: "https://chemrobotics.com/litigation/pfizer-vs-ranbaxy",
      plaintiff_logo: "assets/images/pfizer_logo.png",
      defendant_logo: "assets/images/ranbaxy_logo.png"
    };

    this.resultTabs = {
      litigation: { name: 'litigation', label: 'Litigation' }
    };

    this.litigation_column = {
      
      gbrn: "GBRN",
      patent_numbers: "Application Number",
      defendants: "Active Ingredient",
      country: "Trade Name",
      uniform_resource_locator_url: "URL"
    };

    VeterinaryUsApprovalCardComponent.apiCallCount++;
    this.localCount = VeterinaryUsApprovalCardComponent.apiCallCount;
  }

  ngOnDestroy() {
    VeterinaryUsApprovalCardComponent.apiCallCount = 0;
  }

  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: any) {
    return this.litigation_column[value];
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
