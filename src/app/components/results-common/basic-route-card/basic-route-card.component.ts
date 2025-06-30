import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { Auth_operations } from '../../../Utils/SetToken';
import { ChemDiscriptionModelComponent } from '../../../commons/chem-discription-model/chem-discription-model.component';
import { ChemDiscriptionViewModelComponent } from '../../../commons/chem-discription-viewmodel/chem-discription-viewmodel.component';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
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

  static apiCallCount: number = 0; // Global static counter
  localCount: number = 0; // Instance-specific counter
  productHighlights: any[] = [];
  isLoading: boolean = false;
  toggleProductHighlights: boolean = false;
  resultTabs: any = {};
  processedSynonyms: { number: string; text: string }[] = [];
  basic_column: any = {};
  _data: any = [];
  routesList: any = {};
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    if (value && Object.keys(value).length > 0) {
      BasicRouteCardComponent.apiCallCount++;
      this.localCount = BasicRouteCardComponent.apiCallCount;
      this._data = value;

      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();

      if (column_list[this.resultTabs.productInfo?.name]?.length > 0) {
        for (let i = 0; i < column_list[this.resultTabs.productInfo.name].length; i++) {
          this.basic_column[column_list[this.resultTabs.productInfo.name][i].value] =
            column_list[this.resultTabs.productInfo.name][i].name;
        }
        this.processSynonyms();
      }
    }
  }
  viewProductHighlight: boolean = false;
  MoreApplicationInfo: any = false;

  constructor(
    private dialog: MatDialog,
    private utilityService: UtilityService,
    private MainSearchService: MainSearchService
  ) { }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  ngOnInit() {
    // Reset counter only when the component is first loaded
    if (BasicRouteCardComponent.apiCallCount === 0) {
      console.log('Resetting apiCallCount to 0');
      BasicRouteCardComponent.apiCallCount = 0;
    }
  }

  ngOnDestroy() {
    // Reset counter when navigating away from the component
    BasicRouteCardComponent.apiCallCount = 0;
  }

  getInventorLogo(data: any) {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${data?.INVENTOR_LOGO}`;
  }

  viewProduct() {
    this.toggleProductHighlights = !this.toggleProductHighlights;
    if(this.toggleProductHighlights && this.productHighlights.length === 0) {
      this.isLoading = true;
      this.MainSearchService.getProductHighlights().subscribe({
        next: (response) => {
          console.log('API response received:', response);
          if (response.status) {
            this.isLoading = false;
            this.productHighlights = response.data.productHighlights;
            console.log('Product Highlights:', this.productHighlights);
          } else {
            this.isLoading = false;
            console.warn('API response status not OK:', response.status, response.code);
          }
        },
        error: (err) => {
          console.error('API Error:', err);
        }
      });
    }
  }
  toggleMoreApplicationInfo() {
    this.MoreApplicationInfo = !this.MoreApplicationInfo;
  }

  handleCopy(text: string, el: HTMLElement) {
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
  //  onImgError(event: Event) {
  //   const imgElement = event.target as HTMLImageElement;
  //   imgElement.src = 'assets/components/noimg.png';
  // }
  getPatentUrl(data: any) {
    return `https://patentscope.wipo.int/search/en/result.jsf?inchikey=${data?.INCHIKEY}`;
  }

  OpenDescriptionModal() {
    this.dialog.open(ChemDiscriptionViewModelComponent, {
      width: 'calc(100vw - 50px)',
      height: '400px', // Fixed height
      panelClass: 'full-screen-modal',
    });
  }

  OpenViewModal(data: any, title: any) {
    this.dialog.open(ChemDiscriptionViewModelComponent, {
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
    this.dialog.open(ImageModalComponent, {
      width: 'auto',
      height: 'auto',
      panelClass: 'full-screen-modal',
      data: { dataImage: imageUrl },
    });
  }
}
