import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Auth_operations } from '../../../Utils/SetToken';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
@Component({
  selector: 'app-us-approval-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './us-approval-card.component.html',
  styleUrl: './us-approval-card.component.css'
})
export class UsApprovalCardComponent {

  _data: any = [];
  MoreInfo: boolean = false;
  pageNo: number = 1;
  us_approval_column: any = {};
  resultTabs: any = {};
  @Input() index: number = 0;
  static apiCallCount: number = 0; // Global static counter
  localCount: number = 0; // Instance-specific count
  @Input() currentChildAPIBody: any;
  column: any = {};
  @Input()
  get data() {
    console.log("hnfdjd", this._data);
    return this._data;
  }
  set data(value: any) {
    if (value && Object.keys(value).length > 0) {
      UsApprovalCardComponent.apiCallCount++;
      this.localCount = UsApprovalCardComponent.apiCallCount;

      this._data = value; // ✅ SET FIRST
      console.log("hnfdjd", this._data);
      this.resultTabs = this.utilityService.getAllTabsName();
      console.log("result", this.resultTabs);

      const column_list = Auth_operations.getColumnList();

      if (column_list[this.resultTabs.usApproval?.name]?.length > 0) {
        for (let i = 0; i < column_list[this.resultTabs.usApproval.name].length; i++) {
          this.us_approval_column[column_list[this.resultTabs.usApproval.name][i].value] =
            column_list[this.resultTabs.usApproval.name][i].name;
        }
      }
      const tabName = this.resultTabs?.usApproval?.name || 'US_APPROVAL';
      this.us_approval_column = column_list?.[tabName];

      console.log('Resolved tabName:', tabName);
      console.log('us_approval_column:', this.us_approval_column);
      console.log("data", this._data);
    }
  }

  constructor(private dialog: MatDialog, private utilityService: UtilityService) { }
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  ngOnInit() {
    // Reset counter only when the component is first loaded
    if (UsApprovalCardComponent.apiCallCount === 0) {
      UsApprovalCardComponent.apiCallCount = 0;
    }
  }

  ngOnDestroy() {
    // Reset counter when navigating away from the component
    UsApprovalCardComponent.apiCallCount = 0;
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  toggleMoreInfo() {
    this.MoreInfo = !this.MoreInfo;
  }
  getColumnName(field: string): string {
    const colName = this.us_approval_column?.[field];
    console.log(`getColumnName(${field}) =>`, colName);
    return colName || field.replace(/_/g, ' ').toUpperCase(); // fallback display
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
  } onImgError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/components/noimg.png';
  }
    openImageModal(imageUrl: string): void {
      this.dialog.open(ImageModalComponent, {
        width: 'calc(100vw - 5vw)',
        height: '700px',
        panelClass: 'full-screen-modal',
        data: { dataImage: imageUrl },
      });
    }
  isPopupOpen = false;

  openPopup() {
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
  }

  // =========================
  isPopupOpen2 = false;

  openPopup2() {
    this.isPopupOpen2 = true;
  }

  closePopup2() {
    this.isPopupOpen2 = false;
  }
  // ============================
  isPopupOpen3 = false;

  openPopup3() {
    this.isPopupOpen3 = true;
  }

  closePopup3() {
    this.isPopupOpen3 = false;
  }

  // ==============================

  isPopupOpen4 = false;

  openPopup4() {
    this.isPopupOpen4 = true;
  }

  closePopup4() {
    this.isPopupOpen4 = false;
  }

  // ==================================

  isPopupOpen5 = false;

  openPopup5() {
    this.isPopupOpen5 = true;
  }

  closePopup5() {
    this.isPopupOpen5 = false;
  }

  // ==================================

  isPopupOpen6 = false;

  openPopup6() {
    this.isPopupOpen6 = true;
  }

  closePopup6() {
    this.isPopupOpen6 = false;
  }

  // ==================================

  isPopupOpen7 = false;

  openPopup7() {
    this.isPopupOpen7 = true;
  }

  closePopup7() {
    this.isPopupOpen7 = false;
  }

  // ==================================

  isPopupOpen8 = false;

  openPopup8() {
    this.isPopupOpen8 = true;
  }

  closePopup8() {
    this.isPopupOpen8 = false;
  }

  // ==================================

  isPopupOpen9 = false;

  openPopup9() {
    this.isPopupOpen9 = true;
  }

  closePopup9() {
    this.isPopupOpen9 = false;
  }

  // ==================================

  isPopupOpen10 = false;

  openPopup10() {
    this.isPopupOpen10 = true;
  }

  closePopup10() {
    this.isPopupOpen10 = false;
  }

  // ==================================

  isPopupOpen11 = false;

  openPopup11() {
    this.isPopupOpen11 = true;
  }

  closePopup11() {
    this.isPopupOpen11 = false;
  }

  // ==================================

  isPopupOpen12 = false;

  openPopup12() {
    this.isPopupOpen12 = true;
  }

  closePopup12() {
    this.isPopupOpen12 = false;
  }

  // ==================================

  isPopupOpen13 = false;

  openPopup13() {
    this.isPopupOpen13 = true;
  }

  closePopup13() {
    this.isPopupOpen13 = false;
  }

  // ==================================

  isPopupOpen14 = false;

  openPopup14() {
    this.isPopupOpen14 = true;
  }

  closePopup14() {
    this.isPopupOpen14 = false;
  }
  // ==================================

  isPopupOpen15 = false;

  openPopup15() {
    this.isPopupOpen15 = true;
  }

  closePopup15() {
    this.isPopupOpen15 = false;
  }
  // ==================================

  isPopupOpen16 = false;

  openPopup16() {
    this.isPopupOpen16 = true;
  }

  closePopup16() {
    this.isPopupOpen16 = false;
  }

  // ==================================

  isPopupOpen17 = false;

  openPopup17() {
    this.isPopupOpen17 = true;
  }

  closePopup17() {
    this.isPopupOpen17 = false;
  }

  // ==================================

  isPopupOpen18 = false;

  openPopup18() {
    this.isPopupOpen18 = true;
  }

  closePopup18() {
    this.isPopupOpen18 = false;
  }

  // ==================================

  isPopupOpen19 = false;

  openPopup19() {
    this.isPopupOpen19 = true;
  }

  closePopup19() {
    this.isPopupOpen19 = false;
  }

  // ==================================

  isPopupOpen20 = false;

  openPopup20() {
    this.isPopupOpen20 = true;
  }

  closePopup20() {
    this.isPopupOpen20 = false;
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
