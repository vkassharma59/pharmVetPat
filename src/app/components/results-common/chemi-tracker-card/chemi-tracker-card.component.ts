import { Component, Input, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { environment } from '../../../../environments/environment';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';

@Component({
  selector: 'chem-chemi-tracker-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chemi-tracker-card.component.html',
  styleUrl: './chemi-tracker-card.component.css'
})
export class ChemiTrackerCardComponent implements OnDestroy {

  private static counter = 0; // ✅ Static counter across instances
  _data: any = [];
  MoreInfo: boolean = false;
  pageNo: number = 1;
  localCount: number;
  chemi_tracker_column: Record<string, string> = {};
  resultTabs: any = {};

  constructor(private dialog: MatDialog, private utilityService: UtilityService) {
    this.localCount = ++ChemiTrackerCardComponent.counter; // ✅ Assign unique count per instance
    console.log(`Instance Created: ${this.localCount}, Total Count: ${ChemiTrackerCardComponent.counter}`);
  }

  ngOnDestroy() {
    ChemiTrackerCardComponent.counter = 0; // ✅ Reset counter on component destruction
  }

  @Input()
  get data() {  
    return this._data;  
  }
  set data(value) {    
    if (value && Object.keys(value).length > 0) {
      this._data = value;
      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();

      if (column_list[this.resultTabs.chemiTracker?.name]?.length > 0) {
        column_list[this.resultTabs.chemiTracker.name].forEach((col: any) => {
          this.chemi_tracker_column[col.value] = col.name;
        });
      }
    }
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
  
  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: string) {
    return this.chemi_tracker_column[value] || value;
  }

  getPubchemId(value: string) {
    return `https://pubchem.ncbi.nlm.nih.gov/#query=${value}`;
  }

  getCompanyLogo(value: any): string {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${value?.company_logo}`;
  }

  getCountryUrl(value: any): string {
    return `${environment.baseUrl}${environment.countryNameLogoDomain}${value?.country_of_company}.png`;
  }
  
  getCompanyWebsite(value: string) {
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

  getChemicalImage(): string {
    return `${environment.baseUrl}${environment.domainNameChemicalDirectoryStructure}${this._data?.chemical_structure}`;
  }


  openImageModal(imageUrl: string): void {
    this.dialog.open(ImageModalComponent, {
      width: 'calc(100vw - 5vw)',
      height: '700px',
      panelClass: 'full-screen-modal',
      data: { dataImage: imageUrl },
    });
  }
}