import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { environment } from '../../../../environments/environment';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'chem-chemi-tracker-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chemi-tracker-card.component.html',
  styleUrl: './chemi-tracker-card.component.css'
})

export class ChemiTrackerCardComponent {

  _data: any = [];
  MoreInfo: boolean = false;
  pageNo: number = 1;
  chemi_tracker_column: any = {};
  resultTabs: any = {};

  @Input()
  get data() {  
    return this._data;  
  }
  set data(value) {    
    this.resultTabs = this.utilityService.getAllTabsName();
    const column_list = Auth_operations.getColumnList();
    if(column_list[this.resultTabs.chemiTracker?.name]?.length > 0 && Object.keys(value).length > 0 && value) {
      for (let i = 0; i < column_list[this.resultTabs.chemiTracker.name].length; i++) {
        this.chemi_tracker_column[column_list[this.resultTabs.chemiTracker.name][i].value] =
          column_list[this.resultTabs.chemiTracker.name][i].name;
      }

      this._data = value;
    }
  }

  constructor(private dialog: MatDialog,
      private utilityService: UtilityService) {}

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
  
  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: any) {
    return this.chemi_tracker_column[value];
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

  handleCopy(text: any) {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);

    // Select the text
    textArea.select();
    textArea.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the textarea
    document.execCommand('copy');

    // Remove the temporary textarea element
    document.body.removeChild(textArea);
  }

  getChemicalImage = (data: any) => {
    return (
      environment.baseUrl +
      environment.domainNameChemicalDirectoryStructure +
      this.data?.chemical_structure
    );
  };

  openImageModal(imageUrl: string): void {
    const dialogRef = this.dialog.open(ImageModalComponent, {
      width: 'calc(100vw - 5vw)',
      height: '700px',
      panelClass: 'full-screen-modal',
      data: { dataImage: imageUrl },
    });
  }
}
