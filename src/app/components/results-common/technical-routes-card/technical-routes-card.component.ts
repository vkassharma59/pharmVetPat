import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Component, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { Auth_operations } from '../../../Utils/SetToken';
import { ChemDiscriptionViewModelComponent } from '../../../commons/chem-discription-viewmodel/chem-discription-viewmodel.component';
import { UtilityService } from '../../../services/utility-service/utility.service';

@Component({
  selector: 'chem-technical-route-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './technical-routes-card.component.html',
  styleUrl: './technical-routes-card.component.css',
})
export class TechnicalRoutesCardComponent {
  
  static apiCallCount: number = 0; // Global static counter
  localCount: number = 0; // Instance-specific counter

  downloadable_values: string[] = [];
  doc_values: any = [];
  tech_column: any = {};
  resultTabs: any = {};
  _data: any = [];

  @Input() CurrentAPIBody: any;
  @Input() index: any;
  
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    if (value && Object.keys(value).length > 0) {
      TechnicalRoutesCardComponent.apiCallCount++; // Increment global counter
      this.localCount = TechnicalRoutesCardComponent.apiCallCount; // Assign to local instance

      

      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();
      if (column_list[this.resultTabs.technicalRoutes?.name]?.length > 0) {
        for (let i = 0; i < column_list[this.resultTabs.technicalRoutes.name].length; i++) {
          this.tech_column[column_list[this.resultTabs.technicalRoutes.name][i].value] =
            column_list[this.resultTabs.technicalRoutes.name][i].name;
        }
      }

      this._data = value;
    }
  }

  constructor(
    private dialog: MatDialog,
    private utilityService: UtilityService
  ) {}

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  getColumnName(value: any) {
    return this.tech_column[value];
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

  getStringLength(value: any) {
    return value.length > 800;
  }

  isDateTimeString(dateString: any) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  getUpdationDate(data: any) {
    if (this.isDateTimeString(data)) {
      const date = new Date(data);
      return date.toISOString().split('T')[0];
    } 
    return data;
  }

  getImageUrl(props: any): string {
    return `${environment.baseUrl}${environment.domainNameRouteOfSynthesis}${this.data?.route_of_synthesis}`;
  }

  getImageUrl2(props: any): string {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${this.data?.company_logo}`;
  }

  getGooglrPatentUrl(value: any): string {
    return `${environment.domianNameGooglePatent}${value}`;
  }

  getCountryUrl(value: any) {
    return `${environment.baseUrl}${environment.countryNameLogoDomain}${value?.country_of_company}.png`;
  }

  getespaceneturl(value: any): string {
    return `${environment.domainNameEspacenetUrl}${value}A1?q=${value}`;
  }

  getSplitValues(downloadable_docs: string) {
    this.downloadable_values = downloadable_docs.split(';');
    return true;
  }

  getDownloadableValues(downloadable_docs: any) {
    this.doc_values = downloadable_docs.split(';');
    return true;
  }

  getDocHrefvalue(value: any) {
    return `https://chemrobotics.com/agropat/pdf/gsda/docs/${value}`;
  }

  OpenViewModal(data: any, title: any) {
    this.dialog.open(ChemDiscriptionViewModelComponent, {
      width: 'calc(100vw - 50px)',
      height: 'auto',
      panelClass: 'full-screen-modal',
      data: { dataRecord: data, title: title },
    });
  }

  openImageModal(imageUrl: string): void {
    this.dialog.open(ImageModalComponent, {
      width: 'auto',
      height: 'auto',
      panelClass: 'full-screen-modal',
      data: { dataImage: imageUrl },
    });
  }
}
