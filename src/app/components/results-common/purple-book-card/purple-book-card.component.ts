import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Auth_operations } from '../../../Utils/SetToken';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChildPagningTableComponent } from '../../../commons/child-pagning-table/child-pagning-table.component';

@Component({
  selector: 'app-purple-book-card',
  standalone: true,
  imports: [CommonModule, ChildPagningTableComponent],
  templateUrl: './purple-book-card.component.html',
  styleUrl: './purple-book-card.component.css'
})
export class PurpleBookCardComponent {
  isFilterApplied: boolean = false;
  childPaginationData: any = {};
  loading: boolean = false;
  _data: any = [];
  MoreInfo: boolean = false;
  pageNo: number = 1;
  us_approval_column: any = {};
  resultTabs: any = {};
  us_column: any = {};
  us_column2: any = {};
  @Input() index: number = 0;
  static apiCallCount: number = 0; // Global static counter
  localCount: number = 0; // Instance-specific count
  @Input() currentChildAPIBody: any;
  column: any = {};
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    if (value && Object.keys(value).length > 0) {

      PurpleBookCardComponent.apiCallCount++;
      this.localCount = PurpleBookCardComponent.apiCallCount;
      this._data = value;
      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();

      if (column_list[this.resultTabs.purpleBook?.name]?.patentColumnList?.length > 0) {
        for (let col of column_list[this.resultTabs.purpleBook?.name]?.patentColumnList) {
          if (column_list[this.resultTabs.purpleBook?.name]?.patentColumnList?.length > 0) {
            for (let col of column_list[this.resultTabs.purpleBook?.name]?.patentColumnList) {
              this.us_column[col.value] = col.name;
            }
          }
          if (column_list[this.resultTabs.purpleBook?.name]?.columns?.length > 0) {
            for (let col of column_list[this.resultTabs.purpleBook?.name]?.columns) {
              this.us_approval_column[col.value] = col.name;
            }
          }
        }
      }
    }
  }

  convertNewlinesToBr(text: string): string {
    return text?.replace(/\n/g, '<br>');
  }
  showFull = false;
  toggleView() {
    this.showFull = !this.showFull;
  }
  formattedNotes: SafeHtml = '';

  constructor(
    private dialog: MatDialog,
    private utilityService: UtilityService,
    private http: HttpClient,
    private sanitizer: DomSanitizer // ← ADD THIS
  ) { }
  isArray(value: any): boolean {
    return Array.isArray(value);
  }
  patentColumns: any[] = [];
  patentData: any[] = [];
  productColumns: any[] = [];
  productData: any[] = [];
  ngOnInit() {
  
  // Initialize pagination setup
  this.currentChildAPIBody = {
    page_no: 1,
    start: 0,
    length: 25,
    count: this._data?.recordsTotal || 0
  };

  this.childPaginationData = this._data;
  }
  // getVisibleColumns(): string[] {
  //   // Get all keys from us_column
  //   const allKeys = this.getObjectKeys(this.us_column);

  //   // Filter keys to include only those which have at least one non-empty value in any row
  //   return allKeys.filter(key => {
  //     return this._data?.patentData?.some(item => {
  //       const value = item[key];
  //       return value !== null && value !== undefined && value !== '';
  //     });
  //   });
  // }
  getVisibleColumns(): string[] {
    const allKeys = this.getObjectKeys(this.us_column);

    const visible = allKeys.filter(key => {
      const hasValue = this._data?.patentData?.some(item => {
        const value = item[key];
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined && value !== '';
      });
      if (!hasValue) {
      }
      return hasValue;
    });

    return visible;
  }

  handleChildPageChange(updatedApiBody: any) {
    // Save the new API body for current state
    this.currentChildAPIBody = updatedApiBody;
  
    // Example: make your API call or emit event here
    // You can adapt this to use your service if needed
    this.loading = true;
    // Suppose you already have _data containing results
    // Here you can update it after fetching new data
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  handleSetLoading(state: boolean) {
    this.loading = state;
  }
  ngOnChanges() {

    if (this.data && Array.isArray(this.data.patent_list)) {
      this.patentData = this.data.patent_list;
      this.patentColumns = this.data.patentColumnList;
    } else if (this.data?.patentData) {
      this.patentData = this.data.patentData;
    } 
    if (this.data && Array.isArray(this.data.product_list)) {
      this.productData = this.data.product_list;
      this.productColumns = this.data.productColumnList;
    }

  }

  objectValues(obj: any): any[] {
    return Object.values(obj);
  }
  getColumnName1(value: any) {
    return this.us_column[value];
  }
  ngOnDestroy() {
    // Reset counter when navigating away from the component
    PurpleBookCardComponent.apiCallCount = 0;
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
  allowedColumns: string[] = ['gbrn', 'products', 'bla_number', 'applicant_name', 'applicant_logo', 'proprietary_name', 'proper_name', 'jarvis_rn', 'drug_substance_flag', 'drug_product_flag', 'patent_use_code', 'submission_date', 'remark_s'];

  getObjectKeysOrdered(): string[] {
    return this.allowedColumns.filter(key => this.us_column?.hasOwnProperty(key));
  }
  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }
  getColumnName(value: any) {
    const colName = this.us_approval_column?.[value];
    return colName // fallback display
  }


  getPubchemId(value: any) {
    return `https://pubchem.ncbi.nlm.nih.gov/#query=${value}`;
  }


  getCompanyLogo(value: any): string {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${value?.company_logo}`;
  }

  getCountryUrl(value: any): string {
    return `${environment.baseUrl}${environment.countryNameLogoDomain}${value?.country_of_company}.png`;
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
  onImgError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/no-image.jpg';
    imgElement.src = '/assets/no-image.jpg';
  }
  openImageModal(imageUrl: string): void {
    this.dialog.open(ImageModalComponent, {
      width: 'auto',
      height: 'auto',
      panelClass: 'full-screen-modal',
      data: { dataImage: imageUrl },
    });
  }
  isPopupOpen = false;
  selectedPatent: any = null;
  viewPatent: boolean = false;



  openPopup(item: any): void {
    this.selectedPatent = item;
    this.viewPatent = !this.viewPatent;

    if (item?.notes) {
      this.formattedNotes = this.sanitizer.bypassSecurityTrustHtml(
        item.notes.replace(/\n/g, '<br>')
      );
    } else {
      this.formattedNotes = '';
    }
  }

  closePopup(): void {
    this.selectedPatent = null;
    this.viewPatent = false;
  }
  copyText(elementId: string, event: Event) {
    const el = event.currentTarget as HTMLElement;
    const textToCopy = document.getElementById(elementId)?.innerText;

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        // el is already the <i> element, no need for querySelector
        if (el.classList.contains('fa-copy')) {
          el.classList.remove('fa-copy');
          el.classList.add('fa-check');

          setTimeout(() => {
            el.classList.remove('fa-check');
            el.classList.add('fa-copy');
          }, 1500);
        }
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  }
}
