import {
  Component,
  Output,
  Input,
  EventEmitter,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { LoaderComponent } from '../../commons/loader/loader.component';
import { CommonModule } from '@angular/common';
import { searchTypes, UtilityService } from '../../services/utility-service/utility.service';
import { RouteResultComponent } from '../route-result/route-result.component';
import { UserPriviledgeService } from '../../services/user_priviledges/user-priviledge.service';
import { AppConfigValues } from '../../config/app-config';
import { ColumnListService } from '../../services/columnList/column-list.service';
import { Auth_operations } from '../../Utils/SetToken';
import { MainSearchService } from '../../services/main-search/main-search.service';

@Component({
  selector: 'chem-search-results',
  standalone: true,
  imports: [
    LoaderComponent,
    CommonModule,
    RouteResultComponent
  ],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.css',
})

export class SearchResultsComponent {
  
  @Output() showResultFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() showDataResultFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() backFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() generatePdf: EventEmitter<any> = new EventEmitter<any>();


  @Output() setLoadingState: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() allDataSets: any = [];  
  @Input() searchData: any;  
  @Input() CurrentAPIBody: any;

  userIsLoggedIn: boolean = false;
  loading = false;
  LimitValue = '';
  apiUrls = AppConfigValues.appUrls;
  resultTabs: any = [];

  @ViewChild('priviledgeModal') priviledgeModal!: ElementRef;

  constructor(
    private utilityService: UtilityService,
    private userPriviledgeService: UserPriviledgeService,
    private columnListService: ColumnListService,
    private mainSearchService: MainSearchService,
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }

  handleUserLoggedIn(loggedIn: boolean) {
    this.userIsLoggedIn = loggedIn;
  }
  handleLoadingState(data: any) {
    this.loading = data;
  }

  handleBack() {
    this.backFunction.emit(false);
  }

  closeModal() {
    const modalElement = this.priviledgeModal.nativeElement;
    modalElement.classList.remove('show');
    modalElement.style.display = 'none';
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.removeAttribute('aria-modal');
    modalElement.removeAttribute('role');
  }

  openPriviledgeModal(data: any) {
    this.LimitValue = data;
    const modalElement = this.priviledgeModal.nativeElement;
    modalElement.classList.add('show');
    modalElement.style.display = 'block';
    modalElement.setAttribute('aria-hidden', 'false');
    modalElement.setAttribute('aria-modal', 'true');
    modalElement.setAttribute('role', 'dialog');
  }

  checkPriviledgeAndHandleSearch(resultTabData: any) {
    
    let todaysLimit: any = '';
    this.setLoadingState.emit(true);
  
    // Fetch user privileges
    this.userPriviledgeService.getUserPriviledgesData().subscribe({
      next: (res: any) => {
        const userInfo = res?.data?.user_info;
        if (!userInfo) {
          this.setLoadingState.emit(false);
          return;
        }
  
        const { account_type, start_date, expired_date, privilege_json } = userInfo;
        const currentDate = new Date();
        const endTargetDate = new Date(expired_date);
        endTargetDate.setFullYear(endTargetDate.getFullYear() + 1);

  
        // Check for expired premium account
        if (account_type === 'premium' && currentDate > endTargetDate) {
          this.setLoadingState.emit(false);
          this.openPriviledgeModal('Your Premium Account is expired. Please renew your account');
          return;
        }
  
        const userPrivilegeKey = `user_${userInfo.user_id}`;
        const privilegeData = privilege_json?.[userPrivilegeKey];
  
        if (!this.hasSearchPrivileges(privilegeData)) {
          this.setLoadingState.emit(false);
          this.openPriviledgeModal('You do not have permission to Search or View. Please upgrade the account.');
          return;
        }
  
        // Fetch today's privileges
        this.userPriviledgeService.getUserTodayPriviledgesData().subscribe({
          next: (res: any) => {
            todaysLimit = res?.data;
  
            const remainingLimit = privilegeData?.technicalroutesmongo?.DailySearchLimit - todaysLimit?.searchCount;
            if (remainingLimit <= 0) {
              this.setLoadingState.emit(false);
              this.openPriviledgeModal('Your Daily Search Limit is over for this Platform.');
              return;
            }
  
            // Perform main search operation
            
          },
          error: (e) => {
            console.error('Error fetching today’s privileges:', e);
            this.setLoadingState.emit(false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching user privileges:', e);
        this.setLoadingState.emit(false);
      },
    });
  }

  private hasSearchPrivileges(privilegeData: any): boolean {
    if (!privilegeData) return false;
  
    const { technicalroutesmongo } = privilegeData;
    return (
      technicalroutesmongo?.View !== 'false' &&
      technicalroutesmongo?.Search !== '' &&
      technicalroutesmongo?.Search !== 0
    );
  }
  
  private searchBasedOnTabName(resultTabData: any) { 
    this.setLoadingState.emit(true);
    const currentTabData = resultTabData.currentTabData.name;
    switch(currentTabData) {
      case this.resultTabs?.technicalRoutes.name: 
        if(Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.technicalRoutes.name]).length === 0) {
          this.performTechnicalRouteSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }        
        break;
      case this.resultTabs?.productInfo.name:
        if(Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.productInfo.name]).length === 0) {
          this.perforProductInfoSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }     
        break;
      case this.resultTabs?.chemicalDirectory.name:
        if(Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.chemicalDirectory.name]).length === 0) {
          this.perforChemicalDirectorySearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }     
        break;
      case this.resultTabs?.impurity.name:
        if(Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.impurity.name]).length === 0) {
          this.perforImpuritySearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }     
        break;
      case this.resultTabs?.chemiTracker.name:
        if(Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.chemiTracker.name]).length === 0) {
          this.perforChemiTrackerSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }     
        break;
      case this.resultTabs?.canadaApproval.name:
        if(Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.canadaApproval.name]).length === 0) {
          this.performCanadaApprovalSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }     
        break;
      default:
        this.setLoadingState.emit(false);
    }
  }

  private performTechnicalRouteSearch(resultTabData: any): void {

    if(resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.technicalRoutes.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    const body = {
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
    }
  
    const tech_API = this.apiUrls.technicalRoutes.columnList;  
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.technicalRoutes.name, response);
  
        this.mainSearchService.technicalRoutesSearchSpecific(body).subscribe({
          next: (result: any) => {              
            if(result?.data?.ros_data.length > 0) {
              this.allDataSets[resultTabData.index][this.resultTabs.technicalRoutes.name] = result?.data?.ros_data;
            }      
            this.setLoadingState.emit(false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
      },
    });
  }

  private perforProductInfoSearch(resultTabData: any): void {

    if(resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.productInfo.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    const body = {
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
    }
  
    const tech_API = this.apiUrls.basicProductInfo.columnList;  
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.productInfo.name, response);
  
        this.mainSearchService.basicProductSearchSpecific(body).subscribe({
          next: (result: any) => {     
            if(result?.data?.basic_product_data.length > 0) {
              this.allDataSets[resultTabData.index][this.resultTabs.productInfo.name] = result?.data?.basic_product_data;
            }      
            this.setLoadingState.emit(false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
      },
    });
  }

  private perforChemicalDirectorySearch(resultTabData: any): void {

    // Auth_operations.getActiveformValues().activeForm

    if(resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.chemicalDirectory.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    const body = {
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
    }
  
    const tech_API = this.apiUrls.chemicalDirectory.columnList;  
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.chemicalDirectory.name, response);
  
        this.mainSearchService.chemicalDirectorySearchSpecific(body).subscribe({
          next: (result: any) => {     
            if(result?.data?.chem_dir_data.length > 0) {
              this.allDataSets[resultTabData.index][this.resultTabs.chemicalDirectory.name] = result?.data?.chem_dir_data;
            }      
            this.setLoadingState.emit(false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
      },
    });
  }

  private perforImpuritySearch(resultTabData: any): void {

    if(resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.impurity.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    const body = {
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
    }
  
    const tech_API = this.apiUrls.impurity.columnList;  
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.impurity.name, response);
  
        this.mainSearchService.impuritySearchSpecific(body).subscribe({
          next: (result: any) => {     
            if(result?.data?.impurity_data.length > 0) {
              this.allDataSets[resultTabData.index][this.resultTabs.impurity.name] = result?.data?.impurity_data;
            }      
            this.setLoadingState.emit(false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
      },
    });
  }

  private perforChemiTrackerSearch(resultTabData: any): void {

    if(resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.chemiTracker.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    const body = {
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
    }
  
    const tech_API = this.apiUrls.chemiTracker.columnList;  
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.chemiTracker.name, response);
  
        this.mainSearchService.chemiTrackerSearchSpecific(body).subscribe({
          next: (result: any) => {     
            if(result?.data?.chemi_tracker_data.length > 0) {
              this.allDataSets[resultTabData.index][this.resultTabs.chemiTracker.name] = result?.data?.chemi_tracker_data;
            }      
            this.setLoadingState.emit(false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
      },
    });
  }

  private performCanadaApprovalSearch(resultTabData: any): void {

    if(resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.canadaApproval.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    const body = {
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
    }
  
    const tech_API = this.apiUrls.canadaApproval.columnList;  
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.canadaApproval.name, response);
  
        this.mainSearchService.chemiTrackerSearchSpecific(body).subscribe({
          next: (result: any) => {     
            if(result?.data?.chemi_tracker_data.length > 0) {
              this.allDataSets[resultTabData.index][this.resultTabs.canadaApproval.name] = result?.data?.chemi_tracker_data;
            }      
            this.setLoadingState.emit(false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
      },
    });
  }

  onResultTabChange(data: Event){
    this.searchBasedOnTabName(data);
  }
}
