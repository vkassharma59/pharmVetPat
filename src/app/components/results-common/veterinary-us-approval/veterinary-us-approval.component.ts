import { CommonModule } from '@angular/common';
import { Component,EventEmitter, Input, Output } from '@angular/core';
import { VeterinaryUsApprovalCardComponent } from '../veterinary-us-approval-card/veterinary-us-approval-card.component';
import { ChildPagingComponent } from "../../../commons/child-paging/child-paging.component";
import { UtilityService } from '../../../services/utility-service/utility.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { Auth_operations } from '../../../Utils/SetToken';

@Component({
  selector: 'app-veterinary-us-approval',
  standalone: true,
  imports: [CommonModule, VeterinaryUsApprovalCardComponent, ChildPagingComponent],
  templateUrl: './veterinary-us-approval.component.html',
  styleUrl: './veterinary-us-approval.component.css'
})
export class VeterinaryUsApprovalComponent {
  @Output() handleResultTabData = new EventEmitter<any>();
   @Output() handleSetLoading = new EventEmitter<boolean>();
 
  isPopupOpen = false;
  searchThrough: string = '';
  resultTabs: any = {};
  _currentChildAPIBody: any = {};
  _data: any = [];
   @Input() index: any;
   @Input() tabName?: string;
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    if (value) {
      console.log(value);
      this._data = value;
    }
  }
   @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    // if (value) {
    //   this.ImpurityBody = JSON.parse(JSON.stringify(this._currentChildAPIBody)) || this._currentChildAPIBody;
    //   this.handleFetchFilters();
    // }
  }
  viewProduct: boolean = false;
  constructor(
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService,
    public loadingService: LoadingService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }
  ngOnInit() {
    console.log('Received ROS Count:', this._data);

  }
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
