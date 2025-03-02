import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { Auth_operations } from '../../../Utils/SetToken';
import { ChemDiscriptionModelComponent } from '../../../commons/chem-discription-model/chem-discription-model.component';
import { ChemDiscriptionViewModelComponent } from '../../../commons/chem-discription-viewmodel/chem-discription-viewmodel.component';
import { UtilityService } from '../../../services/utility-service/utility.service';

@Component({
  selector: 'chem-product-info-card',
  standalone: true,
  imports: [
    CommonModule,
    ChemDiscriptionModelComponent,
    ChemDiscriptionViewModelComponent,
  ],
  templateUrl: './basic-route-card.component.html',
  styleUrl: './basic-route-card.component.css',
})
export class BasicRouteCardComponent {

  
  resultTabs: any = {};
  processedSynonyms: { number: string; text: string }[] = [];
  basic_column: any = {};
  _data: any = [];

  @Input() 
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
    this.resultTabs = this.utilityService.getAllTabsName();
    const column_list = Auth_operations.getColumnList();
    if(column_list[this.resultTabs.productInfo?.name]?.length > 0 && Object.keys(value).length > 0 &&  value) {
      for (let i = 0; i < column_list[this.resultTabs.productInfo.name].length; i++) {
        this.basic_column[column_list[this.resultTabs.productInfo.name][i].value] =
          column_list[this.resultTabs.productInfo.name][i].name;
      }
      this.processSynonyms();
      this._data = value;
    }
  }

  MoreApplicationInfo: any = false;
  linkdata: any = {
    SYNONYMSCOMMON_NAME: `1. BROMOACETIC ACID
                          2. 2-Bromoacetic acid
                          3. 79-08-3
                          4. Monobromoacetic acid
                          5. Bromoethanoic acid
                          6. Acetic acid, bromo-
                          7. To NTU
                          8. Bromoacetate ion
                          9. Acide bromacetique
                          10. 2-Bromoacetyl Group
                          11. 2-bromoethanoic acid
                          12. Acetic acid, 2-bromo-
                          13. Bromo-acetic acid
                          14. Monobromessigsaeure
                          15. Kyselina bromoctova`,
  };

  constructor(
    private dialog: MatDialog,
    private utilityService: UtilityService
  ) {}

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  getInventorLogo(data: any) {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${data?.INVENTOR_LOGO}`;
  }

  toggleMoreApplicationInfo() {
    this.MoreApplicationInfo = !this.MoreApplicationInfo;
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

  getColumnName(value: any) {
    return this.basic_column[value];
  }

  getPubchemId(value: any) {
    return `https://pubchem.ncbi.nlm.nih.gov/#query=${value}`;
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
  processSynonyms() {
    if (this.data?.SYNONYMSCOMMON_NAME) {
      const synonymList = this.data.SYNONYMSCOMMON_NAME.split('\n').map(
        (synonym: string) => synonym.trim()
      );
      this.processedSynonyms = synonymList.map((synonym: string) => {
        const match = synonym.match(/^(\d+)\.\s*(.*)$/);
        return match
          ? { number: match[1], text: match[2] }
          : { number: '', text: synonym };
      });
    }
  }

  getImageUrl = (props: any) => {
    return (
      environment.baseUrl +
      environment.domainNameBasicRoutStructure +
      this.data?.CHEMICAL_STRUCTURE
    );
  };

  getPatentUrl(data: any) {
    return `https://patentscope.wipo.int/search/en/result.jsf?inchikey=${data?.INCHIKEY}`;
  }
  OpenDescriptionModal() {
    const dialogRef = this.dialog.open(
      ChemDiscriptionViewModelComponent,
      {
        width: 'calc(100vw - 50px)',
        height: '400px', // Fixed height
        panelClass: 'full-screen-modal',
      }
    );
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
