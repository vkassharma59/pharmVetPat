import { Component, EventEmitter, Input, Output,ViewChildren,
  QueryList,
  ElementRef,HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { UsApprovalCardComponent } from '../us-approval-card/us-approval-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';

@Component({
  selector: 'chem-us',
  standalone: true,
  imports: [CommonModule, UsApprovalCardComponent, ChildPagingComponent,TruncatePipe],
  templateUrl: './us.component.html',
  styleUrl: './us.component.css'
})
export class UsComponent {
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;
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
  usApiBody: any;
  usFilters: any = {};
  lastClickedFilterKey: string | null = null;

  filterConfigs = [
    {
      key: 'product_name',
      label: 'Select RLD',
      dataKey: 'productFilters',
      filterType: 'product',
      dropdownState: false
    },
    {
      key: 'company',
      label: 'Select Appl Type',
      dataKey: 'CompanyFilters',
      filterType: 'company',
      dropdownState: false
    },
    {
      key: 'dosage_forms',
      label: 'Select Applicant',
      dataKey: 'DosageFilters',
      filterType: 'dosage_forms',
      dropdownState: false
    },
    {
      key: 'strength',
      label: 'Select Strength',
      dataKey: 'strengthFilters',
      filterType: 'strength',
      dropdownState: false
    }
  ];
  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent) {
   const clickedInsideAny = this.dropdownRefs?.some((dropdown: ElementRef) =>
     dropdown.nativeElement.contains(event.target)
   );
 
   if (!clickedInsideAny) {
     this.filterConfigs = this.filterConfigs.map(config => ({
       ...config,
       dropdownState: false
     }));
   }
 }

  constructor(
    private utilityService: UtilityService,
    public loadingService: LoadingService,
    private mainSearchService: MainSearchService
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
onFilterButtonClick(filterKey: string) {
  this.lastClickedFilterKey = filterKey;
  this.filterConfigs = this.filterConfigs.map((item) => ({
    ...item,
    dropdownState: item.key === filterKey ? !item.dropdownState : false
  }));
}

handleFetchFilters() {
  this.usApiBody.filter_enable = true;
  

  this.mainSearchService.canadaApprovalSearchSpecific(this.usApiBody).subscribe({
    next: (res: any) => {
      const hcData = res?.data?.health_canada_data || [];

      const getUnique = (arr: any[]) => [...new Set(arr.filter(Boolean))];

      const productFilters = getUnique(hcData.map(item => item.product_name));
      const strengthFilters = getUnique(hcData.map(item => item.strength));
      const companyFiltersRaw = getUnique(hcData.map(item => item.company));
      const dosageFilters = getUnique(hcData.map(item => item.dosage_forms));
      console.log("23425435647d",dosageFilters)
      console.log("-------s------",strengthFilters)
      console.log("-------c------",companyFiltersRaw)
      console.log("-------p------",productFilters)

      this.usFilters = {
        productFilters,
        strengthFilters,
        CompanyFilters: companyFiltersRaw.map(name => ({ name, value: name })),
        DosageFilters: dosageFilters
      };

      this.usApiBody.filter_enable = false;
      
      
    },
    error: (err) => {
      console.error('Error fetching Health Canada filters:', err);
      this.usApiBody.filter_enable = false;

    }
  });
}

ngOnInit(): void {
  this.usApiBody = { ...this.currentChildAPIBody };
  this.usApiBody.filters = this.usApiBody.filters || {};

  console.log('[ngOnInit] Initial usApiBody:', JSON.stringify(this.usApiBody, null, 2));

  this.handleFetchFilters();
}


setFilterLabel(filterKey: string, label: string) {
  this.filterConfigs = this.filterConfigs.map((item) => {
    if (item.key === filterKey) {
      if (label === '') {
        switch (filterKey) {
          case 'product_name': label = 'Select Product'; break;
          case 'company': label = 'Company'; break;
          case 'dosage_forms': label = 'Dosage Forms'; break;
          case 'strength': label = 'Strengths'; break;
        }
      }
      return { ...item, label: label };
    }
    return item;
  });
}

handleSelectFilter(filterKey: string, value: any, name?: string): void {
  this.handleSetLoading.emit(true);
  this.usApiBody.filters = this.usApiBody.filters || {};

  if (value === '') {
    delete this.usApiBody.filters[filterKey];
    this.setFilterLabel(filterKey, '');
  } else {
    this.usApiBody.filters[filterKey] = value;
    this.setFilterLabel(filterKey, name || '');
  }

  this._currentChildAPIBody = {
    ...this.usApiBody,
    filters: { ...this.usApiBody.filters }
  };

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  this.mainSearchService.canadaApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
    next: (res) => {
      let resultData = res?.data || {};
      const sortValue = this.usApiBody.filters['order_by'];

      resultData.health_canada_data = this.sortPatentData(resultData.health_canada_data, sortValue);

      this._currentChildAPIBody = {
        ...this._currentChildAPIBody,
        count: resultData?.health_canada_count
      };

      this.handleResultTabData.emit(resultData);
      this.handleSetLoading.emit(false);
      window.scrollTo(0, scrollTop);
    },
    error: () => {
      this._currentChildAPIBody.filter_enable = false;
      this.handleSetLoading.emit(false);
      window.scrollTo(0, scrollTop);
    }
  });
}
sortPatentData(data: any[], order: string): any[] {
  if (!Array.isArray(data)) return [];

  if (order === 'Newest') {
    return data.sort((a, b) =>
      new Date(b.APPLICATION_DATE).getTime() - new Date(a.APPLICATION_DATE).getTime()
    );
  } else if (order === 'Oldest') {
    return data.sort((a, b) =>
      new Date(a.APPLICATION_DATE).getTime() - new Date(b.APPLICATION_DATE).getTime()
    );
  }

  return data;
}

clear() {
  this.filterConfigs = this.filterConfigs.map(config => {
    let defaultLabel = '';
    switch (config.key) {
      case 'product_name': defaultLabel = 'Select Product'; break;
      case 'company': defaultLabel = 'Company'; break;
      case 'dosage_forms': defaultLabel = 'Dosage Forms'; break;
      case 'strength': defaultLabel = 'Strengths'; break;
    }
    return { ...config, label: defaultLabel, dropdownState: false };
  });

  this.usApiBody.filters = {};
  this._currentChildAPIBody = {
    ...this.usApiBody,
    filters: {}
  };

  this.handleSetLoading.emit(true);
  this.mainSearchService.canadaApprovalSearchSpecific(this._currentChildAPIBody).subscribe({
    next: (res) => {
      this._currentChildAPIBody = {
        ...this._currentChildAPIBody,
        count: res?.data?.health_canada_count
      };
      this.handleResultTabData.emit(res.data);
      this.handleSetLoading.emit(false);
    },
    error: (err) => {
      console.error(err);
      this._currentChildAPIBody.filter_enable = false;
      this.handleSetLoading.emit(false);
    }
  });

  window.scrollTo(0, 0);
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
