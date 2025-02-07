import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { Auth_operations } from '../../../Utils/SetToken';
import { ChemDiscriptionViewModelComponent } from '../../../commons/chem-discription-viewmodel/chem-discription-viewmodel.component';
import { UtilityService } from '../../../services/utility-service/utility.service';

@Component({
  selector: 'chem-technical-route',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './technical-routes-card.component.html',
  styleUrl: './technical-routes-card.component.css',
})
export class TechnicalRoutesCardComponent {

  downloadable_values: string[] = [];
  doc_values: any = [];
  tech_column: any = {};
  resultTabs: any = {};
  _data: any;

  @Input() CurrentAPIBody: any;
  @Input() index: any;
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this.resultTabs = this.utilityService.getAllTabsName();
    const column_list = Auth_operations.getColumnList();
    if(column_list[this.resultTabs.technicalRoutes?.name]?.length > 0 && value) {
      for (let i = 0; i < column_list[this.resultTabs.technicalRoutes.name].length; i++) {
        this.tech_column[column_list[this.resultTabs.technicalRoutes.name][i].value] =
          column_list[this.resultTabs.technicalRoutes.name][i].name;
      }

      this._data = value;
      console.log(column_list[this.resultTabs.technicalRoutes?.name]);
      console.log(value);
    }
  }

  constructor(
    private dialog: MatDialog,
    private utilityService: UtilityService
  ) {}

  getColumnName(value: any) {
    return this.tech_column[value];
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
    alert('Item Copied!');
  }

  getStringLength(value: any) {
    if (value.length > 800) {
      return true;
    }
    return false;
  }

  isDateTimeString(dateString: any) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  getUpdationDate(data: any) {
    const isoDate = data;
    if (this.isDateTimeString(isoDate)) {
      const date = new Date(isoDate);

      // Extract the date in yyyy-mm-dd format
      const formattedDate = date.toISOString().split('T')[0];

      return formattedDate;
    } else return data;
  }

  getImageUrl(props: any): string {
    return (
      environment.baseUrl +
      environment.domainNameRouteOfSynthesis +
      this.data?.route_of_synthesis
    );
  }

  getImageUrl2(props: any): string {
    return (
      environment.baseUrl +
      environment.domainNameCompanyLogo +
      this.data?.company_logo
    );
  }

  getGooglrPatentUrl(value: any): string {
    return `${environment.domianNameGooglePatent}${value}`;
  }

  getCountryUrl(value: any) {
    return `${environment.baseUrl}${environment.countryNameLogoDomain}${value?.country_of_company}.png`;
  }

  getespaceneturl(value: any): string {
    const URL = environment.domainNameEspacenetUrl;
    const queryParam = value;
    return `${URL}${queryParam}A1?q=${queryParam}`;
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
    const dialogRef = this.dialog.open(ChemDiscriptionViewModelComponent, {
      width: 'calc(100vw - 50px)',
      height: 'auto',
      panelClass: 'full-screen-modal',
      data: {
        dataRecord: data,
        title: title,
      },
    });
  }

  openImageModal(imageUrl: string): void {
    const dialogRef = this.dialog.open(ImageModalComponent, {
      width: 'auto',
      height: 'auto',
      panelClass: 'full-screen-modal',
      data: { dataImage: imageUrl },
    });
  }
}
