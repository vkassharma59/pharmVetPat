import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { UsApprovalCardComponent } from '../us-approval-card/us-approval-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { LoadingService } from '../../../services/loading-service/loading.service';

@Component({
  selector: 'chem-us',
  standalone: true,
  imports: [CommonModule, UsApprovalCardComponent, ChildPagingComponent],
  templateUrl: './us.component.html',
  styleUrl: './us.component.css'
})
export class UsComponent {
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  _currentChildAPIBody: any;
  searchThrough: string = '';
  resultTabs: any = {};
  _data: any = [];
  @Input()
  get data() {
    console.log("hfkjhf", this.data);
    return this._data;
  }
  set data(name: any) {
    this._data = name;
    console.log("hfngefenhdd", this._data)
    this.handleResultTabData.emit(this._data);
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
  @Input() index: any;
  @Input() tabName?: string;

  constructor(
    private utilityService: UtilityService,
    public loadingService: LoadingService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }
  patentColumns: any[] = []; // Column list from currentChildAPIBody
  patentData: any[] = [];    // Data from @Input() data

  ngOnChanges() {
  console.log('incoming _data', this._data);
  console.log('currentChildAPIBody', this._currentChildAPIBody);

  // Fix 1: Wrap _data in array if it's not one already
  if (this._data && !Array.isArray(this._data)) {
    this.patentData = [this._data];
    console.log('✅ Wrapped object in array:', this.patentData);
  } else if (Array.isArray(this._data)) {
    this.patentData = this._data;
    console.log('✅ patentData is array:', this.patentData);
  } else {
    console.warn('⚠️ patentData is missing or not valid');
  }

  // Fix 2: Handle column definitions
  if (this.currentChildAPIBody?.columnList?.patentColumnList?.length) {
    this.patentColumns = this.currentChildAPIBody.columnList.patentColumnList;
    console.log('✅ patentColumns set:', this.patentColumns);
  } else {
    console.warn('⚠️ patentColumns not available from currentChildAPIBody');
  }
}


  //   isPopupOpen = false;

  //   openPopup() {
  //     this.isPopupOpen = true;
  //   }

  //   closePopup() {
  //     this.isPopupOpen = false;
  //   }

  //   // =========================
  //   isPopupOpen2 = false;

  //   openPopup2() {
  //     this.isPopupOpen2 = true;
  //   }

  //   closePopup2() {
  //     this.isPopupOpen2 = false;
  //   }
  // // ============================
  //   isPopupOpen3 = false;

  //   openPopup3() {
  //     this.isPopupOpen3 = true;
  //   }

  //   closePopup3() {
  //     this.isPopupOpen3 = false;
  //   }

  //   // ==============================

  //   isPopupOpen4 = false;

  //   openPopup4() {
  //     this.isPopupOpen4 = true;
  //   }

  //   closePopup4() {
  //     this.isPopupOpen4 = false;
  //   }

  //   // ==================================

  //   isPopupOpen5 = false;

  //   openPopup5() {
  //     this.isPopupOpen5 = true;
  //   }

  //   closePopup5() {
  //     this.isPopupOpen5 = false;
  //   }

  //   // ==================================

  //   isPopupOpen6 = false;

  //   openPopup6() {
  //     this.isPopupOpen6 = true;
  //   }

  //   closePopup6() {
  //     this.isPopupOpen6 = false;
  //   }

  //    // ==================================

  //    isPopupOpen7 = false;

  //    openPopup7() {
  //      this.isPopupOpen7 = true;
  //    }

  //    closePopup7() {
  //      this.isPopupOpen7 = false;
  //    }

  //    // ==================================

  //    isPopupOpen8 = false;

  //    openPopup8() {
  //      this.isPopupOpen8 = true;
  //    }

  //    closePopup8() {
  //      this.isPopupOpen8 = false;
  //    }

  //       // ==================================

  //       isPopupOpen9= false;

  //       openPopup9() {
  //         this.isPopupOpen9 = true;
  //       }

  //       closePopup9() {
  //         this.isPopupOpen9 = false;
  //       }

  //          // ==================================

  //          isPopupOpen10= false;

  //          openPopup10() {
  //            this.isPopupOpen10 = true;
  //          }

  //          closePopup10() {
  //            this.isPopupOpen10 = false;
  //          }

  //        // ==================================

  //        isPopupOpen11= false;

  //        openPopup11() {
  //          this.isPopupOpen11 = true;
  //        }

  //        closePopup11() {
  //          this.isPopupOpen11 = false;
  //        }     

  //        // ==================================

  //        isPopupOpen12= false;

  //        openPopup12() {
  //          this.isPopupOpen12 = true;
  //        }

  //        closePopup12() {
  //          this.isPopupOpen12 = false;
  //        }     

  //         // ==================================

  //         isPopupOpen13= false;

  //         openPopup13() {
  //           this.isPopupOpen13 = true;
  //         }

  //         closePopup13() {
  //           this.isPopupOpen13 = false;
  //         }  

  //          // ==================================

  //          isPopupOpen14= false;

  //          openPopup14() {
  //            this.isPopupOpen14 = true;
  //          }

  //          closePopup14() {
  //            this.isPopupOpen14 = false;
  //          }  
  //   // ==================================

  //   isPopupOpen15= false;

  //   openPopup15() {
  //     this.isPopupOpen15 = true;
  //   }

  //   closePopup15() {
  //     this.isPopupOpen15 = false;
  //   }  
  //   // ==================================

  //   isPopupOpen16= false;

  //   openPopup16() {
  //     this.isPopupOpen16 = true;
  //   }

  //   closePopup16() {
  //     this.isPopupOpen16 = false;
  //   }  

  //     // ==================================

  //     isPopupOpen17= false;

  //     openPopup17() {
  //       this.isPopupOpen17 = true;
  //     }

  //     closePopup17() {
  //       this.isPopupOpen17 = false;
  //     }  

  //       // ==================================

  //   isPopupOpen18= false;

  //   openPopup18() {
  //     this.isPopupOpen18 = true;
  //   }

  //   closePopup18() {
  //     this.isPopupOpen18 = false;
  //   }  

  //     // ==================================

  //     isPopupOpen19= false;

  //     openPopup19() {
  //       this.isPopupOpen19 = true;
  //     }

  //     closePopup19() {
  //       this.isPopupOpen19 = false;
  //     }  

  //       // ==================================

  //   isPopupOpen20= false;

  //   openPopup20() {
  //     this.isPopupOpen20 = true;
  //   }

  //   closePopup20() {
  //     this.isPopupOpen20 = false;
  //   }  

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
