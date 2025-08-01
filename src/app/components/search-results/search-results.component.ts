import {
  Component,
  Output,
  Input,
  EventEmitter,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
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
import { PaginationComponent } from '../../commons/pagination/pagination.component';
import { ResultTabComponent } from '../../commons/result-tab/result-tab.component';
import { LoadingService } from '../../services/loading-service/loading.service';
@Component({
  selector: 'chem-search-results',
  standalone: true,
  imports: [
    LoaderComponent,
    CommonModule,
    ResultTabComponent,
    RouteResultComponent,
    PaginationComponent,

  ],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.css',
})

export class SearchResultsComponent {

  _searchData: any;
  @Output() showDataResultFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() showResultFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() backFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() generatePdf: EventEmitter<any> = new EventEmitter<any>();
  @Output() setLoadingState: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() allDataSets: any = [];
  @Input()
  get searchData() {
    return this._searchData;
  }
  set searchData(value: any) {
    this._searchData = value;
  }
  @Input() CurrentAPIBody: any;

  paginationRerenderTrigger: any = 0;
  userIsLoggedIn: boolean = false;
  loading = false;
  LimitValue = '';
  apiUrls = AppConfigValues.appUrls;
  resultTabs: any = [];
  searchThrough: string = '';
  currentTabData: any = {};
  childApiBody: any = [];
  FilterObjectLength = false;

  @ViewChild('priviledgeModal') priviledgeModal!: ElementRef;
  searchTypes: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private utilityService: UtilityService,
    private userPriviledgeService: UserPriviledgeService,
    private columnListService: ColumnListService,
    private mainSearchService: MainSearchService,
    private loadingService: LoadingService // <-- add this
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
    this.searchTypes = searchTypes;
    this.childApiBody = [];
  }
  patentColumns: any[] = []; // to store column headers
  patentData: any[] = [];    // optional if you want to extract separately

  ngOnChanges(_changes: any) {
    this.paginationRerenderTrigger = !this.paginationRerenderTrigger;
    if (this.CurrentAPIBody?.body?.filters) {
      this.FilterObjectLength =
        Object.keys(this.CurrentAPIBody?.body?.filters).length !== 0;
    }
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

  checkPriviledgeAndHandleSearch(_resultTabData: any) {

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

            const remainingLimit = privilegeData?.['pharmvetpat-mongodb']?.DailySearchLimit - todaysLimit?.searchCount;
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

    const key = 'pharmvetpat-mongodb'; // dynamic key
    const section = privilegeData[key];

    return (
      section?.View !== 'false' &&
      section?.Search != '' &&
      section?.Search != "0" &&
      section?.Search != 0
    );
  }

  onResultTabChange(resultTabData: any) {
    this.setLoadingState.emit(true);
    this.currentTabData = resultTabData?.currentTabData;

    // Set loading flag for this tab/index
    this.loadingService.setLoading(this.currentTabData?.name, resultTabData.index, true);
    this.CurrentAPIBody.currentTab = this.currentTabData?.name;
    switch (this.currentTabData.name) {
      case this.resultTabs?.technicalRoutes.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.technicalRoutes.name]).length === 0) {
          this.performTechnicalRouteSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.productInfo.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.productInfo.name]).length === 0) {
          this.perforProductInfoSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.chemicalDirectory.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.chemicalDirectory.name]).length === 0) {
          this.perforChemicalDirectorySearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.impurity.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.impurity.name]).length === 0) {
          this.perforImpuritySearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.chemiTracker.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.chemiTracker.name]).length === 0) {
          this.perforChemiTrackerSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.impPatents.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.impPatents.name]).length === 0) {
          this.performImpPatentsSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.canadaApproval.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.canadaApproval.name]).length === 0) {
          this.performCanadaApprovalSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.japanApproval.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.japanApproval.name]).length === 0) {
          this.performJapanApprovalSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.koreaApproval.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.koreaApproval.name]).length === 0) {
          this.performKoreaApprovalSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.indianMedicine.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.indianMedicine.name]).length === 0) {
          this.performIndianMedicineSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.litigation.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.litigation.name]).length === 0) {
          this.performLitigationSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.europeApproval.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.europeApproval.name]).length === 0) {
          this.performEuropeApprovalSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      // For new tab work
      case this.resultTabs?.usApproval.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.usApproval.name]).length === 0) {
          this.performUsApprovalSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.veterinaryUsApproval.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.veterinaryUsApproval.name]).length === 0) {
          this.performveterinaryUsApprovalSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.activePatent.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.activePatent.name]).length === 0) {
          this.performactivePatentSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.nonPatentLandscape.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.nonPatentLandscape.name]).length === 0) {
          this.performNonPatentSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.scientificDocs.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.scientificDocs.name]).length === 0) {
          this.scientificDocsSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.spcDb.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.spcDb.name]).length === 0) {
          this.spcDbSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.gppdDb.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.gppdDb.name]).length === 0) {
          this.gppdDbSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.eximData.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.eximData.name]).length === 0) {
          this.eximDataSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      case this.resultTabs?.dmf.name:
        if (Object.keys(this.allDataSets?.[resultTabData.index]?.[this.resultTabs.dmf.name]).length === 0) {
          this.performDMFSearch(resultTabData);
        } else {
          this.setLoadingState.emit(false);
        }
        break;
      default:
        this.setLoadingState.emit(false);
    }
  }

  private performTechnicalRouteSearch(resultTabData: any): void {
    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.technicalRoutes.name] = {};
      this.setLoadingState.emit(false);
      return;
    }
    console.log("resultTabData.index]", resultTabData.index)
    console.log("resultTabData", resultTabData)
    console.log("this.allDataSets", this.allDataSets)
    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.technicalRoutes.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    this.childApiBody[resultTabData.index][this.resultTabs?.technicalRoutes.name] = {
      api_url: this.apiUrls.technicalRoutes.searchSpecific,
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      index: resultTabData.index,
      count: 0
    }

    const tech_API = this.apiUrls.technicalRoutes.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.technicalRoutes.name, response);

        this.mainSearchService.technicalRoutesSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs?.technicalRoutes.name]).subscribe({
          next: (result: any) => {
            this.childApiBody[resultTabData.index][this.resultTabs?.technicalRoutes.name].count = result?.data?.ros_count;
            this.allDataSets[resultTabData.index][this.resultTabs.technicalRoutes.name] = result?.data;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.technicalRoutes.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.technicalRoutes.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.technicalRoutes.name, resultTabData.index, false);
      },
    });
  }



  private perforProductInfoSearch(resultTabData: any): void {

    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.productInfo.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.productInfo.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    this.childApiBody[resultTabData.index][this.resultTabs.productInfo.name] = {
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      api_url: this.apiUrls.basicProductInfo.searchSpecific,
      page_no: 1,
      filter_enable: false,
      filters: {},
      index: resultTabData.index,
      order_by: '',
    }

    const tech_API = this.apiUrls.basicProductInfo.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.productInfo.name, response);

        this.mainSearchService.basicProductSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.productInfo.name]).subscribe({
          next: (result: any) => {
            this.childApiBody[resultTabData.index][this.resultTabs.productInfo.name].count = result?.data?.basic_product_count;
            this.allDataSets[resultTabData.index][this.resultTabs.productInfo.name] = result?.data?.basic_product_data;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.productInfo.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.productInfo.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.productInfo.name, resultTabData.index, false);
      },
    });
  }

  private perforChemicalDirectorySearch(resultTabData: any): void {

    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.chemicalDirectory.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.chemicalDirectory.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    this.childApiBody[resultTabData.index][this.resultTabs.chemicalDirectory.name] = {
      api_url: this.apiUrls.chemicalDirectory.searchSpecific,
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      index: resultTabData.index,
    }

    const tech_API = this.apiUrls.chemicalDirectory.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.chemicalDirectory.name, response);

        this.mainSearchService.chemicalDirectorySearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.chemicalDirectory.name]).subscribe({
          next: (result: any) => {
            this.childApiBody[resultTabData.index][this.resultTabs.chemicalDirectory.name].count = result?.data?.chem_dir_count;
            this.allDataSets[resultTabData.index][this.resultTabs.chemicalDirectory.name] = result?.data?.chem_dir_data;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.chemicalDirectory.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.chemicalDirectory.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.chemicalDirectory.name, resultTabData.index, false);
      },
    });
  }

  private perforImpuritySearch(resultTabData: any): void {

    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.impurity.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.impurity.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    this.childApiBody[resultTabData.index][this.resultTabs.impurity.name] = {
      api_url: this.apiUrls.impurity.searchSpecific,
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      index: resultTabData.index,
    }

    const tech_API = this.apiUrls.impurity.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.impurity.name, response);

        this.mainSearchService.impuritySearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.impurity.name]).subscribe({
          next: (result: any) => {
            this.childApiBody[resultTabData.index][this.resultTabs.impurity.name].count = result?.data?.impurity_count;
            this.allDataSets[resultTabData.index][this.resultTabs.impurity.name] = result?.data?.impurity_data;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.impurity.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.impurity.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.impurity.name, resultTabData.index, false);
      },
    });
  }

  private perforChemiTrackerSearch(resultTabData: any): void {

    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.chemiTracker.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.chemiTracker.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    this.childApiBody[resultTabData.index][this.resultTabs.chemiTracker.name] = {
      api_url: this.apiUrls.chemiTracker.searchSpecific,
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      index: resultTabData.index,
    }

    const tech_API = this.apiUrls.chemiTracker.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.chemiTracker.name, response);

        this.mainSearchService.chemiTrackerSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.chemiTracker.name]).subscribe({
          next: (result: any) => {
            this.childApiBody[resultTabData.index][this.resultTabs.chemiTracker.name].count = result?.data?.chemi_tracker_count;
            this.allDataSets[resultTabData.index][this.resultTabs.chemiTracker.name] = result?.data?.chemi_tracker_data;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.chemiTracker.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.chemiTracker.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.chemiTracker.name, resultTabData.index, false);
      },
    });
  }

  private performCanadaApprovalSearch(resultTabData: any): void {

    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.canadaApproval.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.canadaApproval.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    this.childApiBody[resultTabData.index][this.resultTabs.canadaApproval.name] = {
      api_url: this.apiUrls.canadaApproval.searchSpecific,
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      index: resultTabData.index,
    }

    const tech_API = this.apiUrls.canadaApproval.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.canadaApproval.name, response);
        this.mainSearchService.canadaApprovalSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.canadaApproval.name]).subscribe({
          next: (result: any) => {
            this.childApiBody[resultTabData.index][this.resultTabs.canadaApproval.name].count = result?.data?.health_canada_count;
            this.allDataSets[resultTabData.index][this.resultTabs.canadaApproval.name] = result?.data?.health_canada_data;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.canadaApproval.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.canadaApproval.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.canadaApproval.name, resultTabData.index, false);
      },
    });
  }
  private performJapanApprovalSearch(resultTabData: any): void {

    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.japanApproval.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.japanApproval.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    this.childApiBody[resultTabData.index][this.resultTabs.japanApproval.name] = {
      api_url: this.apiUrls.japanApproval.searchSpecific,
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      index: resultTabData.index
    }

    const tech_API = this.apiUrls.japanApproval.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.japanApproval.name, response);

        this.mainSearchService.japanApprovalSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.japanApproval.name]).subscribe({
          next: (result: any) => {
            this.childApiBody[resultTabData.index][this.resultTabs.japanApproval.name].count = result?.data?.japan_pmda_count;
            this.allDataSets[resultTabData.index][this.resultTabs.japanApproval.name] = result?.data?.japan_pmda_data;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.japanApproval.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.japanApproval.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.japanApproval.name, resultTabData.index, false);
      },
    });
  }
  private performKoreaApprovalSearch(resultTabData: any): void {

    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.koreaApproval.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.koreaApproval.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    this.childApiBody[resultTabData.index][this.resultTabs.koreaApproval.name] = {
      api_url: this.apiUrls.koreaApproval.searchSpecific,
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      index: resultTabData.index
    }

    const tech_API = this.apiUrls.koreaApproval.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.koreaApproval.name, response);

        this.mainSearchService.koreaApprovalSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.koreaApproval.name]).subscribe({
          next: (result: any) => {
            this.childApiBody[resultTabData.index][this.resultTabs.koreaApproval.name].count = result?.data?.korea_orange_book_count;
            this.allDataSets[resultTabData.index][this.resultTabs.koreaApproval.name] = result?.data?.korea_orange_book_data;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.koreaApproval.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.koreaApproval.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.koreaApproval.name, resultTabData.index, false);
      },
    });
  }

  private performIndianMedicineSearch(resultTabData: any): void {

    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.indianMedicine.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.indianMedicine.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    this.childApiBody[resultTabData.index][this.resultTabs.indianMedicine.name] = {
      api_url: this.apiUrls.indianMedicine.searchSpecific,
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      index: resultTabData.index
    }

    const tech_API = this.apiUrls.indianMedicine.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.indianMedicine.name, response);

        this.mainSearchService.indianMedicineSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.indianMedicine.name]).subscribe({
          next: (result: any) => {
            this.childApiBody[resultTabData.index][this.resultTabs.indianMedicine.name].count = result?.data?.indian_medicine_count;
            this.allDataSets[resultTabData.index][this.resultTabs.indianMedicine.name] = result?.data?.indian_medicine_data;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.indianMedicine.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.indianMedicine.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.indianMedicine.name, resultTabData.index, false);
      },
    });
  }

  private performLitigationSearch(resultTabData: any): void {

    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.litigation.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.litigation.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    this.childApiBody[resultTabData.index][this.resultTabs.litigation.name] = {
      api_url: this.apiUrls.litigation.searchSpecific,
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      index: resultTabData.index
    }

    const tech_API = this.apiUrls.litigation.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.litigation.name, response);

        this.mainSearchService.litigationSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.litigation.name]).subscribe({
          next: (result: any) => {
            this.childApiBody[resultTabData.index][this.resultTabs.litigation.name].count = result?.data?.litigation_count;
            this.allDataSets[resultTabData.index][this.resultTabs.litigation.name] = result?.data?.litigation_data;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.litigation.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.litigation.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.litigation.name, resultTabData.index, false);
      },
    });
  }

  private performImpPatentsSearch(resultTabData: any): void {

    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.impPatents.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.impPatents.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    this.childApiBody[resultTabData.index][this.resultTabs.impPatents.name] = {
      api_url: this.apiUrls.impPatents.searchSpecific,
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      index: resultTabData.index
    }

    const tech_API = this.apiUrls.impPatents.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.impPatents.name, response);

        this.mainSearchService.impPatentsSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.impPatents.name]).subscribe({
          next: (result: any) => {
            this.childApiBody[resultTabData.index][this.resultTabs.impPatents.name].count = result?.data?.imp_patent_count;
            this.allDataSets[resultTabData.index][this.resultTabs.impPatents.name] = result?.data?.imp_patent_data;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.impPatents.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.impPatents.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.impPatents.name, resultTabData.index, false);
      },
    });
  }

  private performEuropeApprovalSearch(resultTabData: any): void {

    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.usApproval.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.europeApproval.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    this.childApiBody[resultTabData.index][this.resultTabs.europeApproval.name] = {
      api_url: this.apiUrls.europeApproval.searchSpecific,
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      index: resultTabData.index
    }

    const tech_API = this.apiUrls.europeApproval.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.europeApproval.name, response);

        this.mainSearchService.europeApprovalSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.europeApproval.name]).subscribe({
          next: (result: any) => {
            this.childApiBody[resultTabData.index][this.resultTabs.europeApproval.name].count = result?.data?.ema_count;
            this.allDataSets[resultTabData.index][this.resultTabs.europeApproval.name] = result?.data?.ema_data;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.europeApproval.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.europeApproval.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.europeApproval.name, resultTabData.index, false);
      },
    });
  }

  private performUsApprovalSearch(resultTabData: any): void {
    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.usApproval.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    // 🛠 Setup childApiBody if not already present
    if (!this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index] = {};
    }

    // 🛠 Setup request body for search
    this.childApiBody[resultTabData.index][this.resultTabs.usApproval.name] = {
      api_url: this.apiUrls.usApproval.searchSpecific,
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      index: resultTabData.index
    };

    const tech_API = this.apiUrls.usApproval.columnList;

    // ✅ Step 1: Get Column List
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data;

        // ✅ Extract patentColumnList
        const patentColumns = response?.patentColumnList || [];
        this.patentColumns = patentColumns;  // You need to define this.patentColumns in component

        // 🔐 Optionally store in Auth if needed globally
        Auth_operations.setColumnList(this.resultTabs.usApproval.name, response);

        // ✅ Step 2: Call Main Search API
        this.mainSearchService.usApprovalSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.usApproval.name])
          .subscribe({
            next: (result: any) => {
              // ✅ Log to verify
              const data = result?.data?.orange_book_us_data || [];
              const count = result?.data?.orange_book_us_count || 0;

              this.childApiBody[resultTabData.index][this.resultTabs.usApproval.name].count = count;
              this.allDataSets[resultTabData.index][this.resultTabs.usApproval.name] = data;

              this.setLoadingState.emit(false);
              this.loadingService.setLoading(this.resultTabs.usApproval.name, resultTabData.index, false);
            },
            error: (e) => {
              console.error('Error during main search:', e);
              this.setLoadingState.emit(false);
              this.loadingService.setLoading(this.resultTabs.usApproval.name, resultTabData.index, false);
            },
          });


      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.usApproval.name, resultTabData.index, false);
      },
    });
  }


  private performveterinaryUsApprovalSearch(resultTabData: any): void {

    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.veterinaryUsApproval.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.veterinaryUsApproval.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    this.childApiBody[resultTabData.index][this.resultTabs.veterinaryUsApproval.name] = {
      api_url: this.apiUrls.veterinaryUsApproval.searchSpecific,
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      // filter_enable: false,
      // filters: {},
      // order_by: '',
      // filter_enable: false,
      // filters: {},
      // order_by: '',
      index: resultTabData.index
    }

    const tech_API = this.apiUrls.veterinaryUsApproval.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data;
        Auth_operations.setColumnList(this.resultTabs.veterinaryUsApproval.name, response);

        this.mainSearchService.veterinaryusApprovalSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.veterinaryUsApproval.name]).subscribe({
          next: (result: any) => {

            this.childApiBody[resultTabData.index][this.resultTabs.veterinaryUsApproval.name].count = result?.data?.green_book_us_count;
            this.allDataSets[resultTabData.index][this.resultTabs.veterinaryUsApproval.name] = result?.data?.green_book_us_data;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.veterinaryUsApproval.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.veterinaryUsApproval.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.veterinaryUsApproval.name, resultTabData.index, false);
      },
    });
  }

  private scientificDocsSearch(resultTabData: any): void {

    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.scientificDocs.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.scientificDocs.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    this.childApiBody[resultTabData.index][this.resultTabs.scientificDocs.name] = {
      api_url: this.apiUrls.scientificDocs.searchSpecific,
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      // filter_enable: false,
      // filters: {},
      // order_by: '',
      // filter_enable: false,
      // filters: {},
      // order_by: '',
      index: resultTabData.index
    }

    const tech_API = this.apiUrls.scientificDocs.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data;
        Auth_operations.setColumnList(this.resultTabs.scientificDocs.name, response);

        this.mainSearchService.scientificDocsSpecific(this.childApiBody[resultTabData.index][this.resultTabs.scientificDocs.name]).subscribe({
          next: (result: any) => {

            this.childApiBody[resultTabData.index][this.resultTabs.scientificDocs.name].count = result?.data?.recordsTotal
            this.allDataSets[resultTabData.index][this.resultTabs.scientificDocs.name] = result?.data?.data;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.scientificDocs.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.scientificDocs.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.scientificDocs.name, resultTabData.index, false);
      },
    });
  }

  // private scientificDocsSearch(resultTabData: any,): void {
  //   const pageSize = 25;
  //   const page_no = 1
  //   if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
  //     this.allDataSets[resultTabData.index][this.resultTabs.scientificDocs.name] = {};
  //     this.setLoadingState.emit(false);
  //     return;
  //   }
  //   if (!this.childApiBody[resultTabData.index]) {
  //     this.childApiBody[resultTabData.index] = {};
  //   }
  //   // Step 1: Prepare API body
  //   this.childApiBody[resultTabData.index][this.resultTabs.scientificDocs.name] = {
  //     api_url: this.apiUrls.scientificDocs.searchSpecific,
  //     search_type: resultTabData?.searchWith,
  //     keyword: [resultTabData?.searchWithValue],
  //     draw: 1,
  //     page_no: 1,
  //     start: (page_no - 1) * pageSize,
  //     length: pageSize
  //   };
  //   // Step 2: Fetch Column List First
  //   this.columnListService.getColumnList(this.apiUrls.scientificDocs.columnList).subscribe({
  //     next: (res: any) => {
  //       const columnList = res?.data?.columns || [];


  //       // Step 3: Save column list locally
  //       Auth_operations.setColumnList(this.resultTabs.scientificDocs.name, columnList);

  //       // ✅ SAVE to pass to component
  //       this.allDataSets[resultTabData.index][this.resultTabs.scientificDocs.name] = {
  //         columns: columnList,  // <- for <app-scientific-docs-card>
  //         rows: []              // <- we’ll fill this after searchSpecific
  //       };

  //       // Step 4: Call main search API
  //       this.mainSearchService.scientificDocsSpecific(this.childApiBody[resultTabData.index][this.resultTabs.scientificDocs.name]).subscribe({
  //         next: (result: any) => {

  //           const dataRows = result?.data?.data || [];

  //           // ✅ Append search result (rows) to saved structure
  //           this.allDataSets[resultTabData.index][this.resultTabs.scientificDocs.name].rows = dataRows;

  //           this.childApiBody[resultTabData.index][this.resultTabs.scientificDocs.name].count = result?.data?.recordsTotal;

  //           this.setLoadingState.emit(false);
  //           this.loadingService.setLoading(this.resultTabs.scientificDocs.name, resultTabData.index, false);
  //         },
  //         error: (e) => {
  //           console.error('Error during main search:', e);
  //           this.setLoadingState.emit(false);
  //           this.loadingService.setLoading(this.resultTabs.scientificDocs.name, resultTabData.index, false);
  //         },
  //       });
  //     },
  //     error: (e) => {
  //       console.error('Error fetching column list:', e);
  //       this.setLoadingState.emit(false);
  //       this.loadingService.setLoading(this.resultTabs.scientificDocs.name, resultTabData.index, false);
  //     },
  //   });
  // }
  private spcDbSearch(resultTabData: any): void {
    const pageSize = 25;
    const page_no = 1
    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.spcDb.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.spcDb.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    // Step 1: Prepare API body
    this.childApiBody[resultTabData.index][this.resultTabs.spcDb.name] = {
      api_url: this.apiUrls.spcDb.searchSpecific,
      keyword: resultTabData?.searchWithValue,
      draw: 1,
      page_no: 1,
      start: (page_no - 1) * pageSize,
      length: pageSize
    };


    // Step 2: Fetch Column List First
    this.columnListService.getColumnList(this.apiUrls.spcDb.columnList).subscribe({
      next: (res: any) => {
        const columnList = res?.data?.columns || [];
        Auth_operations.setColumnList(this.resultTabs.spcDb.name, columnList);

        if (!this.allDataSets[resultTabData.index]) {
          this.allDataSets[resultTabData.index] = {};
        }
        // ✅ SAVE to pass to component
        this.allDataSets[resultTabData.index][this.resultTabs.spcDb.name] = {
          columns: columnList,  // <- for <app-scientific-docs-card>
          rows: []              // <- we’ll fill this after searchSpecific
        };

        // Step 4: Call main search API
        this.mainSearchService.spcdbSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.spcDb.name]).subscribe({
          next: (result: any) => {

            const dataRows = result?.data?.data || [];

            // ✅ Append search result (rows) to saved structure
            this.allDataSets[resultTabData.index][this.resultTabs.spcDb.name].rows = dataRows;
            this.childApiBody[resultTabData.index][this.resultTabs.spcDb.name].count = result?.data?.recordsTotal;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.spcDb.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.spcDb.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.spcDb.name, resultTabData.index, false);
      },
    });
  }


  private gppdDbSearch(resultTabData: any): void {
    const pageSize = 25;
    const page_no = 1
    this.setLoadingState.emit(true);
    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.gppdDb.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.gppdDb.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    // Step 1: Prepare API body
    this.childApiBody[resultTabData.index][this.resultTabs.gppdDb.name] = {
      api_url: this.apiUrls.gppdDb.searchSpecific,
      keyword: resultTabData?.searchWithValue,
      draw: 1,
      page_no: 1,
      start: (page_no - 1) * pageSize,
      length: pageSize
    };
    // Step 2: Fetch Column List First
    this.columnListService.getColumnList(this.apiUrls.gppdDb.columnList).subscribe({
      next: (res: any) => {
        const columnList = res?.data?.columns || [];
        Auth_operations.setColumnList(this.resultTabs.gppdDb.name, columnList);

        if (!this.allDataSets[resultTabData.index]) {
          this.allDataSets[resultTabData.index] = {};
        }
        // ✅ SAVE to pass to component
        this.allDataSets[resultTabData.index][this.resultTabs.gppdDb.name] = {
          columns: columnList,  // <- for <app-scientific-docs-card>
          rows: []              // <- we’ll fill this after searchSpecific
        };
        // Step 4: Call main search API
        this.mainSearchService.gppdDbSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.gppdDb.name]).subscribe({
          next: (result: any) => {
            const dataRows = result?.data?.data || [];
            // ✅ Append search result (rows) to saved structure
            this.allDataSets[resultTabData.index][this.resultTabs.gppdDb.name].rows = dataRows;
            this.childApiBody[resultTabData.index][this.resultTabs.gppdDb.name].count = result?.data?.recordsTotal;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.gppdDb.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.gppdDb.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.gppdDb.name, resultTabData.index, false);
      },
    });
  }
  private performactivePatentSearch(resultTabData: any): void {
    const pageSize = 25;
    const page_no = 1
    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.activePatent.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.activePatent.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    // Step 1: Prepare API body
    this.childApiBody[resultTabData.index][this.resultTabs.activePatent.name] = {
      api_url: this.apiUrls.activePatent.searchSpecific,
      keyword: resultTabData?.searchWithValue,
      draw: 1,
      page_no: 1,
      start: (page_no - 1) * pageSize,
      length: pageSize
    };
    // Step 2: Fetch Column List First
    this.columnListService.getColumnList(this.apiUrls.activePatent.columnList).subscribe({
      next: (res: any) => {
        const columnList = res?.data?.columns || [];
        Auth_operations.setColumnList(this.resultTabs.activePatent.name, columnList);
        if (!this.allDataSets[resultTabData.index]) {
          this.allDataSets[resultTabData.index] = {};
        }
        // ✅ SAVE to pass to component
        this.allDataSets[resultTabData.index][this.resultTabs.activePatent.name] = {
          columns: columnList,  // <- for <app-scientific-docs-card>
          rows: []              // <- we’ll fill this after searchSpecific
        };
        // Step 4: Call main search API
        this.mainSearchService.activePatentSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.activePatent.name]).subscribe({
          next: (result: any) => {
            const dataRows = result?.data?.data || [];
            // ✅ Append search result (rows) to saved structure
            this.allDataSets[resultTabData.index][this.resultTabs.activePatent.name].rows = dataRows;
            this.childApiBody[resultTabData.index][this.resultTabs.activePatent.name].count = result?.data?.recordsTotal;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.activePatent.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.activePatent.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.activePatent.name, resultTabData.index, false);
      },
    });
  }
  private performNonPatentSearch(resultTabData: any): void {
    console.log('Search Input:', resultTabData);
    const pageSize = 25;
    const page_no = 1
    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.nonPatentLandscape.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.nonPatentLandscape.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    // Step 1: Prepare API body
    this.childApiBody[resultTabData.index][this.resultTabs.nonPatentLandscape.name] = {
      api_url: this.apiUrls.nonPatentLandscape.searchSpecific,
      keyword: resultTabData?.searchWithValue,
      search_type: resultTabData?.searchWith,
      draw: 1,
      page_no: 1,
      start: (page_no - 1) * pageSize,
      length: pageSize
    };
    // Step 2: Fetch Column List First
    this.columnListService.getColumnList(this.apiUrls.nonPatentLandscape.columnList).subscribe({
      next: (res: any) => {
        const columnList = res?.data?.columns || [];
        Auth_operations.setColumnList(this.resultTabs.nonPatentLandscape.name, columnList);

        if (!this.allDataSets[resultTabData.index]) {
          this.allDataSets[resultTabData.index] = {};
        }
        // ✅ SAVE to pass to component
        this.allDataSets[resultTabData.index][this.resultTabs.nonPatentLandscape.name] = {
          columns: columnList,  // <- for <app-scientific-docs-card>
          rows: []              // <- we’ll fill this after searchSpecific
        };
        // Step 4: Call main search API
        this.mainSearchService.NonPatentSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.nonPatentLandscape.name]).subscribe({
          next: (result: any) => {
            const dataRows = result?.data?.data || [];

            // ✅ Append search result (rows) to saved structure
            this.allDataSets[resultTabData.index][this.resultTabs.nonPatentLandscape.name].rows = dataRows;
            this.childApiBody[resultTabData.index][this.resultTabs.nonPatentLandscape.name].count = result?.data?.recordsTotal;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.nonPatentLandscape.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.nonPatentLandscape.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.nonPatentLandscape.name, resultTabData.index, false);
      },
    });
  }
  private eximDataSearch(resultTabData: any): void {

    const pageSize = 25;
    const page_no = 1
    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.eximData.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.eximData.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    // Step 1: Prepare API body
    this.childApiBody[resultTabData.index][this.resultTabs.eximData.name] = {
      api_url: this.apiUrls.eximData.searchSpecific,
      keyword: resultTabData?.searchWithValue,
      draw: 1,
      page_no: 1,
      start: (page_no - 1) * pageSize,
      length: pageSize
    };
    // Step 2: Fetch Column List First
    this.columnListService.getColumnList(this.apiUrls.eximData.columnList).subscribe({
      next: (res: any) => {
        const columnList = res?.data?.columns || [];
        Auth_operations.setColumnList(this.resultTabs.eximData.name, columnList);

        if (!this.allDataSets[resultTabData.index]) {
          this.allDataSets[resultTabData.index] = {};
        }
        // ✅ SAVE to pass to component
        this.allDataSets[resultTabData.index][this.resultTabs.eximData.name] = {
          columns: columnList,  // <- for <app-scientific-docs-card>
          rows: []              // <- we’ll fill this after searchSpecific
        };

        // Step 4: Call main search API
        this.mainSearchService.EximDataSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.eximData.name]).subscribe({
          next: (result: any) => {
            const dataRows = result?.data?.data || [];
            // ✅ Append search result (rows) to saved structure
            this.allDataSets[resultTabData.index][this.resultTabs.eximData.name].rows = dataRows;
            this.childApiBody[resultTabData.index][this.resultTabs.eximData.name].count = result?.data?.recordsTotal;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.eximData.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.eximData.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.eximData.name, resultTabData.index, false);
      },
    });
  }
private performDMFSearch(resultTabData: any): void {

    if (resultTabData?.searchWith === '' || resultTabData?.searchWithValue === '') {
      this.allDataSets[resultTabData.index][this.resultTabs.dmf.name] = {};
      this.setLoadingState.emit(false);
      return;
    }

    if (this.childApiBody?.[resultTabData.index]) {
      this.childApiBody[resultTabData.index][this.resultTabs.dmf.name] = {};
    } else {
      this.childApiBody[resultTabData.index] = {};
    }

    this.childApiBody[resultTabData.index][this.resultTabs.dmf.name] = {
      api_url: this.apiUrls.dmf.searchSpecific,
      search_type: resultTabData?.searchWith,
      keyword: resultTabData?.searchWithValue,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      index: resultTabData.index,
    }

    const tech_API = this.apiUrls.dmf.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.dmf.name, response);

        this.mainSearchService.dmfSearchSpecific(this.childApiBody[resultTabData.index][this.resultTabs.dmf.name]).subscribe({
          next: (result: any) => {
            this.childApiBody[resultTabData.index][this.resultTabs.dmf.name].count = result?.data?.tech_supplier_count;
            this.allDataSets[resultTabData.index][this.resultTabs.dmf.name] = result?.data?.tech_supplier_data;
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.dmf.name, resultTabData.index, false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
            this.loadingService.setLoading(this.resultTabs.dmf.name, resultTabData.index, false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
        this.loadingService.setLoading(this.resultTabs.dmf.name, resultTabData.index, false);
      },
    });
  }


  ButtonROSSearch(SearchKey: any, index: number): void {

    this.setLoadingState.emit(true);
    this.loadingService.setLoading(this.resultTabs.technicalRoutes.name, index, true);

    const isROS = SearchKey === 'ROS_search';
    const searchValue = this.allDataSets[index]?.[this.resultTabs?.chemicalDirectory.name][0].trrn;

    if (!searchValue) {
      this.setLoadingState.emit(false);
      this.loadingService.setLoading(this.resultTabs.technicalRoutes.name, index, false);
      return;
    }

    const body = {
      api_url: this.apiUrls.technicalRoutes.searchSpecific,
      search_type: 'TRRN',
      keyword: this.allDataSets[index]?.[this.resultTabs?.chemicalDirectory.name][0].trrn,
      page_no: 1,
      filter_enable: false,
      filters: isROS ? {} : { types_of_route: 'KSM' },
      order_by: '',
      index: index,
    };

    if (!Array.isArray(this.childApiBody)) {
      this.childApiBody = [];
    }

    if (!this.childApiBody[index]) {
      this.childApiBody[index] = {};
    }

    this.childApiBody[index][this.resultTabs.technicalRoutes.name] = body;
    const tech_API = this.apiUrls.technicalRoutes.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const columns = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.technicalRoutes.name, columns);

        this.mainSearchService.technicalRoutesSearchSpecific(body).subscribe({
          next: (result: any) => {
            this.childApiBody[index][this.resultTabs?.technicalRoutes.name].count = result?.data?.ros_count;
            this.allDataSets[index][this.resultTabs.technicalRoutes.name] = result?.data;
            this.loadingService.setLoading(this.resultTabs.technicalRoutes.name, index, false);
            this.utilityService.setActiveTab(this.resultTabs.technicalRoutes.name);
            this.currentTabData = {
              isActive: true,
              label: this.resultTabs.technicalRoutes.label,
              name: this.resultTabs.technicalRoutes.name
            };
            this.setLoadingState.emit(false);
            this.CurrentAPIBody.currentTab = this.resultTabs.technicalRoutes.name;
            this.cdr.detectChanges();

          },
          error: (e) => {
            console.error('❌ ROS API error:', e);
            this.setLoadingState.emit(false);
          }
        });
      },
      error: (err) => {
        console.error('❌ Column list fetch error:', err);
        this.setLoadingState.emit(false);
      }
    });
  }


  onChildPaginationChange(data: any, index) {
    switch (this.currentTabData.name) {
      case this.resultTabs?.technicalRoutes.name:
        this.childApiBody[index][this.resultTabs?.technicalRoutes.name].count = data?.ros_count ?? 0;
        if (!this.allDataSets[index]) {
          this.allDataSets[index] = {};
        }
        this.allDataSets[index][this.resultTabs.technicalRoutes.name] = data ?? [];
        break;
      case this.resultTabs?.productInfo.name:
        if (data?.basic_product_data.length > 0) {
          this.childApiBody[index][this.resultTabs?.productInfo.name].count = data?.basic_product_count;
          if (!this.allDataSets[index]) {
            this.allDataSets[index] = {};
          }
          this.allDataSets[index][this.resultTabs.productInfo.name] = data?.basic_product_data;
        }
        break;
      case this.resultTabs?.chemicalDirectory.label:
        if (data?.chem_dir_data.length > 0) {
          this.childApiBody[index][this.resultTabs?.chemicalDirectory.label].count = data?.chem_dir_count;
          if (!this.allDataSets[index]) {
            this.allDataSets[index] = {};
          }
          this.allDataSets[index][this.resultTabs.chemicalDirectory.name] = data?.chem_dir_data;
        }
        break;
      case this.resultTabs?.impurity.name:
        if (data?.impurity_data.length > 0) {
          this.childApiBody[index][this.resultTabs?.impurity.name].count = data?.impurity_count;
          if (!this.allDataSets[index]) {
            this.allDataSets[index] = {};
          }
          this.allDataSets[index][this.resultTabs.impurity.name] = data?.impurity_data;
        }
        break;
      case this.resultTabs?.chemiTracker.name:
        if (data?.chemi_tracker_data.length > 0) {
          this.childApiBody[index][this.resultTabs?.chemiTracker.name].count = data?.chemi_tracker_count;
          if (!this.allDataSets[index]) {
            this.allDataSets[index] = {};
          }
          this.allDataSets[index][this.resultTabs.chemiTracker.name] = data?.chemi_tracker_data;
        }
        break;
      case this.resultTabs?.impPatents.name:
        if (data?.imp_patent_data.length > 0) {
          this.childApiBody[index][this.resultTabs?.impPatents.name].count = data?.imp_patent_count;
          if (!this.allDataSets[index]) {
            this.allDataSets[index] = {};
          }
          this.allDataSets[index][this.resultTabs.impPatents.name] = data?.imp_patent_data;
        }
        break;
      case this.resultTabs?.canadaApproval.name:
        if (data?.health_canada_data.length > 0) {
          this.childApiBody[index][this.resultTabs?.canadaApproval.name].count = data?.health_canada_count;
          if (!this.allDataSets[index]) {
            this.allDataSets[index] = {};
          }
          this.allDataSets[index][this.resultTabs.canadaApproval.name] = data?.health_canada_data;
        }
        break;
      case this.resultTabs?.japanApproval.name:
        if (data?.japan_pmda_data.length > 0) {
          this.childApiBody[index][this.resultTabs?.japanApproval.name].count = data?.japan_pmda_count;
          if (!this.allDataSets[index]) {
            this.allDataSets[index] = {};
          }
          this.allDataSets[index][this.resultTabs.japanApproval.name] = data?.japan_pmda_data;
        }
        break;
      case this.resultTabs?.koreaApproval.name:
        if (data?.korea_orange_book_data.length > 0) {
          this.childApiBody[index][this.resultTabs?.koreaApproval.name].count = data?.korea_orange_book_count;
          if (!this.allDataSets[index]) {
            this.allDataSets[index] = {};
          }
          this.allDataSets[index][this.resultTabs.koreaApproval.name] = data?.korea_orange_book_data;
        }
        break;
      case this.resultTabs?.indianMedicine.name:
        if (data?.indian_medicine_data.length > 0) {
          this.childApiBody[index][this.resultTabs?.indianMedicine.name].count = data?.indian_medicine_count;
          if (!this.allDataSets[index]) {
            this.allDataSets[index] = {};
          }
          this.allDataSets[index][this.resultTabs.indianMedicine.name] = data?.indian_medicine_data;
        }
        break;
      case this.resultTabs?.litigation.name:
        if (data?.litigation_data.length > 0) {
          this.childApiBody[index][this.resultTabs?.litigation.name].count = data?.litigation_count;
          if (!this.allDataSets[index]) {
            this.allDataSets[index] = {};
          }
          this.allDataSets[index][this.resultTabs.litigation.name] = data?.litigation_data;
        }
        break;
      case this.resultTabs?.europeApproval.name:
        if (data?.ema_data.length > 0) {
          this.childApiBody[index][this.resultTabs?.europeApproval.name].count = data?.ema_count;
          if (!this.allDataSets[index]) {
            this.allDataSets[index] = {};
          }
          this.allDataSets[index][this.resultTabs.europeApproval.name] = data?.ema_data;
        }
        break;
      default:
        this.setLoadingState.emit(false);
    }
  }

  resetPagination(data: boolean, index) {
    switch (this.currentTabData.name) {
      case this.resultTabs?.technicalRoutes.name:
        if (data) {
          this.childApiBody[index][this.resultTabs?.technicalRoutes.name].page_no = 1;
        }
        break;
      default:
      // do nothing
    }
  }
}