import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { searchTypes, UtilityService } from '../../services/utility-service/utility.service';
import { CommonModule, JsonPipe, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { RouteTabsComponent } from '../route-tabs/route-tabs.component';
import { UserPriviledgeService } from '../../services/user_priviledges/user-priviledge.service';
import { Auth_operations } from '../../Utils/SetToken';
import { ImpComponent } from '../results-common/imp/imp.component';
import { UsComponent } from '../results-common/us/us.component';
import { KoreaComponent } from '../results-common/korea/korea.component';
import { LitigationComponent } from '../results-common/litigation/litigation.component';
import { EuropeApprovalComponent } from '../results-common/europe-approval/europe-approval.component';
import { CanadaComponent } from '../results-common/canada/canada.component';
import { JapanComponent } from '../results-common/japan/japan.component';
import { IndianComponent } from '../results-common/indian/indian.component';
import { SpcdbComponent } from '../results-common/spcdb/spcdb.component';
import { EximComponent } from '../results-common/exim/exim.component';
import { ActivePatentComponent } from '../results-common/active-patent/active-patent.component';
import { BasicRouteComponent } from '../results-common/basic-route/basic-route.component';
import { TechnicalRoutesComponent } from '../results-common/technical-routes/technical-routes.component';
import { ImpurityComponent } from '../results-common/impurity/impurity.component';
import { ChemiTrackerComponent } from '../results-common/chemi-tracker/chemi-tracker.component';
import { ChemicalDirectoryComponent } from '../results-common/chemical-directory/chemical-directory.component';
import { FormsModule } from '@angular/forms';
import { AppConfigValues } from '../../config/app-config';
import { ServiceResultTabFiltersService } from '../../services/result_tab/service-result-tab-filters.service';
import { MatDialog } from '@angular/material/dialog';
import { Chem_Robotics_QueryModalComponent } from '../Chem_Robotics_QueryModal/Chem_Robotics_QueryModal.component';
import { ScientificDocsComponent } from '../results-common/scientific-docs/scientific-docs.component';
import { GppdDbComponent } from '../results-common/gppd-db/gppd-db.component';
import { NonPatentComponent } from '../results-common/non-patent/non-patent.component';
import { MainSearchService } from '../../services/main-search/main-search.service';
import { VeterinaryUsApprovalComponent } from "../results-common/veterinary-us-approval/veterinary-us-approval.component";
import { DmfComponent } from '../results-common/dmf/dmf.component';
import { SharedRosService } from '../../shared-ros.service';
import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { PurpleBookComponent } from '../results-common/purple-book/purple-book.component';
import { CasRnService } from '../../services/casRn';
import { firstValueFrom } from 'rxjs';
declare var bootstrap: any; // ✅ Add this here
@Component({
  selector: 'chem-route-results',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, BasicRouteComponent, TechnicalRoutesComponent,
    ImpurityComponent, ChemiTrackerComponent, ImpComponent, IndianComponent, ChemicalDirectoryComponent,
    JapanComponent, CanadaComponent, EuropeApprovalComponent, KoreaComponent, LitigationComponent,
    UsComponent, SpcdbComponent, EximComponent, RouteTabsComponent, ActivePatentComponent,
    NgSwitch, NgSwitchCase, NgSwitchDefault, ScientificDocsComponent, GppdDbComponent, NonPatentComponent, VeterinaryUsApprovalComponent, DmfComponent, PurpleBookComponent],
  templateUrl: './route-result.component.html',
  styleUrl: './route-result.component.css'
})

export class RouteResultComponent {
  userIsLoggedIn: boolean = false;
  loading = false;
  FilterObjectLength = false;
  LimitValue = '';
  isBackHidden: boolean = true;
  accountType: string = '';
  public scientificDocsPayload: any[] = [];
  tabNameToReportKey: { [key: string]: string } = {
    productInfo: 'basicProduct',
    chemicalDirectory: 'chemDirectory',
    chemiTracker: 'chemiTracker',
    impPatents: 'impPatent',
    technicalRoutes: 'techRoute',
    impurity: 'impurity',
    dmf: "techSupplier",
    europeApproval: "ema",
    japanApproval: "pmda",
    canadaApproval: "healthCanada",
    indianMedicine: "indianMedicine",
    litigation: "litigation",
    koreaApproval: "koreaOrangeBook",
    usApproval: "usOrangeBook",
    veterinaryUsApproval: "usGreenBook",
    scientificDocs: "scientificDocs",
    purpleBook: "purpleBook",
  };
  showTotalAfterTab: boolean = false;
  currentTabData: any = {}
  resultTabs: any = [];
  resultTabWithKeys: any = [];
  _dataItem: any = {};
  AllSetData: any = [];
  raise_query_object: any;
  SingleDownloadCheckbox: { [key: string]: boolean } = {};
  generatePDFloader: any = false;
  userAuth: any = {};
  apiUrls = AppConfigValues.appUrls;
  searchThrough: string = '';
  isSplitDownload: boolean = false;
  isFullDownload: boolean = false;
  isDownloadPermit: boolean = false;
  activeTab: string = '';
  report_download = true;
  isDownloadAvailable: any = false;
  searchKeyword: string = '';
  @Output() handleSetLoading: EventEmitter<any> = new EventEmitter<any>();
  @Output() backFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() onResultTabChange = new EventEmitter<any>();
  @Output() handleChildPaginationSearch: EventEmitter<any> = new EventEmitter<any>();
  @Output() OpenPriviledgeModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() resetPagination: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleROSChange: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('downloadModal') downloadModalRef!: ElementRef;
  @Output() backFunction1 = new EventEmitter<void>();
  private initialTab: any;
  _MainDataResultShow: any;
  _currentChildAPIBody: any;
  @Input() specialCount: any;
  @Input() currentApiData: any;
  @Input() CurrentAPIBody: any;
  @Input() index: number | undefined;
  @Input() searchData: any;
  currentIndex: number = 0;
  selectedIndex: number = 0;
  @Input() activeIndex: number | null = null;

  private limitsFetched = false;
  setSelectedIndex(index: number): void {
    this.selectedIndex = index;
  }

  searchTypes = searchTypes

  @Input()
  get dataItem() {
    return this._dataItem;
  }
  set dataItem(value: any) {
    this._dataItem = value;
  }
  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
  }
  firstActiveTabName: string | null = null;
  lastSearchData: { searchType: string, keyword: string, criteria: any } | null = null;
  constructor(
    private dialog: MatDialog,
    private sharedRosService: SharedRosService,
    private serviceResultTabFiltersService: ServiceResultTabFiltersService,
    private utilityService: UtilityService,
    private userPriviledgeService: UserPriviledgeService,
    private MainsearchService: MainSearchService,
  ) {
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }
  ngOnChanges(_changes: any) {
    console.log("Current Tab Name for Download Button:", this.activeTab);
  }

  ngOnInit() {
    this.lastSearchData = this.sharedRosService.getSearchData();
    this.AllSetData = this.sharedRosService.getAllDataSets();
    this.resultTabs = Object.values(this.utilityService.getAllTabsName());
    this.currentTabData = this.resultTabs.find((tab: any) => tab.isActive);
    this.activeTab = this.currentTabData?.name || '';
    this.isDownloadAvailable = this.currentApiData?.isDownloadAvailable || false;
    this.initialTab = this.currentTabData;
    // if (!this.limitsFetched) {
    //   this.fetchAndStoreVerticalLimits();
    //   this.limitsFetched = true;
    // }
    this.resultTabWithKeys = this.utilityService.getAllTabsName();
    this.raise_query_object = this.CurrentAPIBody?.body;
    this.resultTabs.forEach(tab => {
      this.SingleDownloadCheckbox[tab.name] = false;
    });

    const accountType = localStorage.getItem('account_type');
    this.accountType = accountType ? accountType : '';
    const Account_type = localStorage.getItem('account_type');
    const Userdata = JSON.parse(localStorage.getItem('priviledge_json') || '');
    this.isFullDownload =
      Userdata?.['pharmvetpat-mongodb']?.Download == 'true' ? true : false;
    this.isSplitDownload =
      Userdata?.['pharmvetpat-mongodb']?.SplitDownload == 'true' ? true : false;
    this.isDownloadPermit = Account_type == 'premium' ? true : false;
    this.selectDefaultDownloadTabs();
    this.setFirstActiveTab();

  }
  // get showBackButton(): boolean {
  //   return this.currentTabData?.name !== this.initialTab?.name;
  // }

  // get showBackButton(): boolean {
  //   return this.currentTabData?.name !== this.initialTab?.name;
  // }
  setFirstActiveTab() {
    if (!this.firstActiveTabName && this.currentTabData?.name) {
      this.firstActiveTabName = this.currentTabData.name;
    }
  }
  get showBackButton(): boolean {
    const isDifferentFromInitial = this.currentTabData?.name !== this.initialTab?.name;
    const isMultipleLoop = this.activeIndex !== null;
    // Tab change ho ya activeIndex set ho → show button
    return isDifferentFromInitial || isMultipleLoop;
    
  }

  getCurrentTabCount(): number {
    const tabName = this.currentTabData?.name;
    // Agar child API count hai to wahi return karo
    if (tabName && this.currentChildAPIBody?.[tabName]?.count !== undefined) {
      return this.currentChildAPIBody[tabName].count;
    }
    // Default → parent ka count
    return this.CurrentAPIBody?.count || 0;
  }

  handleBack1() {
    this.currentTabData = this.initialTab;
    this.activeTab = this.initialTab?.name || '';
    if (this.CurrentAPIBody) {
      this.CurrentAPIBody.body = {
        ...this.CurrentAPIBody.body,
        currentTab: this.activeTab
      };
      this.CurrentAPIBody.currentTab = this.activeTab;
    }
    this.backFunction1.emit();
  }
  handleBack() {
    this.sharedRosService.clearSearchData();
    this.backFunction.emit(false);
    localStorage.removeItem("searchType");
    localStorage.removeItem("casRN");
    console.log("removed");
  }


  // shouldShowDownloadButton(): boolean {
  //   // const searchType = this.searchThrough;
  //   const currentTabName = this.activeTab;   // ✅ direct activeTab use karo
  //   // const searchToTabKeyMap: { [key: string]: string } = {
  //   //   'synthesis-search': 'technicalRoutes',
  //   //   'chemical-structure': 'chemicalDirectory',
  //   //   'intermediate-search': 'chemicalDirectory',
  //   //   'simple-search': 'productInfo',
  //   //   'advance-search': 'productInfo',
  //   // };

  //   // const expectedTabKey = searchToTabKeyMap[searchType];
  //   //  const expectedTabName = this.resultTabWithKeys?.[expectedTabKey]?.name;
  //   // ❌ Hide in Important and Chemi Tracker tabs

  //   //return currentTabName === expectedTabName;
  // }

  shouldShowDownloadButton(): boolean {
    const currentTabName = this.activeTab;

    // ❌ Hide only in impPatents and chemiTracker
    return !(currentTabName === 'impPatents' || currentTabName === 'chemiTracker');
  }

  showFullName: boolean = false;

  toggleProductName() {
    this.showFullName = !this.showFullName;
  }
  // getFirstProductName(tabData: any): string {
  //   if (!tabData || !this.initialTab?.name) return '';
  //   const tabObj = tabData[this.initialTab.name];   // 👈 fixed: activeTab ki jagah initialTab

  //   if (!tabObj) return '';
  //   // Step 2: Agar direct array hai
  //   if (Array.isArray(tabObj) && tabObj.length > 0) {
  //     return (
  //       tabObj[0]?.ACTIVE_INGREDIENT ||
  //       tabObj[0]?.chemical_name ||
  //       ''
  //     );
  //   }
  //   // Step 2: Agar direct array hai
  //   if (Array.isArray(tabObj) && tabObj.length > 0) {
  //     return (
  //       tabObj[0]?.ACTIVE_INGREDIENT ||
  //       tabObj[0]?.chemical_name ||
  //       ''
  //     );
  //   }

  //   if (tabObj.ros_data && Array.isArray(tabObj.ros_data) && tabObj.ros_data.length > 0) {
  //     return (
  //       tabObj.ros_data[0]?.ACTIVE_INGREDIENT ||
  //       tabObj.ros_data[0]?.active_ingredient ||
  //       ''
  //     );
  //   }
  //   if (tabObj.ros_data && Array.isArray(tabObj.ros_data) && tabObj.ros_data.length > 0) {
  //     return (
  //       tabObj.ros_data[0]?.ACTIVE_INGREDIENT ||
  //       tabObj.ros_data[0]?.active_ingredient ||
  //       ''
  //     );
  //   }

  //   return '';
  // }
  getFirstProductName(tabData: any): string {
    // console.log('Tab Data:', tabData);
    // console.log('Initial Tab:', this.initialTab);
    if (!tabData || !this.initialTab?.name) return '';
    const tabObj = tabData[this.initialTab.name];   // 👈 fixed: activeTab ki jagah initialTab
    // console.log('Tab Object:', tabObj);


    if (!tabObj) return '';
    // Step 2: Agar direct array hai
    if (Array.isArray(tabObj) && tabObj.length > 0) {
      return (
        tabObj[0]?.ACTIVE_INGREDIENT ||
        tabObj[0]?.chemical_name ||
        ''
      );
    }
    if (tabObj.ros_data && Array.isArray(tabObj.ros_data) && tabObj.ros_data.length > 0) {
      return (
        tabObj.ros_data[0]?.ACTIVE_INGREDIENT ||
        tabObj.ros_data[0]?.active_ingredient ||
        ''
      );
    }
    return '';
  }

  isTechnicalRoutesTabActive(): boolean {
    return this.CurrentAPIBody?.currentTab === this.resultTabWithKeys?.technicalRoutes?.name;
  }
  isDownloadAvailableFunction() {
    return this.isDownloadAvailable === 'true';
  }
  handleCurrentTab(data: any) {
    const searchThrough = Auth_operations.getActiveformValues().activeForm;

    let searchWith = '';
    let searchWithValue;

    switch (searchThrough) {
      case searchTypes.chemicalStructure:
        if (data.name === this.resultTabWithKeys.technicalRoutes.name) {
          searchWith = 'TRRN';
          searchWithValue = this.dataItem[this.resultTabWithKeys.chemicalDirectory.name][0].trrn;
        } else {
          searchWith = 'GBRN';
          searchWithValue = this.dataItem[this.resultTabWithKeys.chemicalDirectory.name][0].gbrn;
        }
        break;
      case searchTypes.synthesisSearch:
        if (data.name === this.resultTabWithKeys.chemicalDirectory.name) {
          searchWith = 'TRRN';
          searchWithValue = this.dataItem[this.resultTabWithKeys.technicalRoutes.name]?.ros_data[0]?.trrn;
        } else {
          searchWith = 'GBRN';
          searchWithValue = this.dataItem[this.resultTabWithKeys.technicalRoutes.name]?.ros_data[0]?.gbrn;
        }
        break;
      case searchTypes.intermediateSearch:
        if (data.name === this.resultTabWithKeys.technicalRoutes.name) {
          searchWith = 'TRRN';
          searchWithValue = this.dataItem[this.resultTabWithKeys.chemicalDirectory.name][0].trrn;
        } else {
          searchWith = 'GBRN';
          searchWithValue = this.dataItem[this.resultTabWithKeys.chemicalDirectory.name][0].gbrn;
        }
        break;
      case searchTypes.simpleSearch:
      case searchTypes.advanceSearch:
        searchWith = 'GBRN';
        searchWithValue = this.dataItem[this.resultTabWithKeys.productInfo.name][0].gbrn;
        break;
      default:
        console.log('No search type selected');
    }

    const tempObj =
    {
      currentTabData: data,
      index: this.index,
      dataItem: this.dataItem,
      searchWith: searchWith,
      searchWithValue: searchWithValue
    }

    this.onResultTabChange.emit(tempObj);
    this.currentTabData = data;
    this.activeTab = data.name;

    this.showTotalAfterTab = true;

  }

  OpenQueryModal() {
    const dialogRef = this.dialog.open(Chem_Robotics_QueryModalComponent, {
      width: '450px',
      height: '500px',
      data: {
        raise_query_object: this.raise_query_object,
        handleLoading: this.handleSetLoading,
      },
      panelClass: 'full-screen-modal',
    });
  }

  isDisabled() {
    // Count the number of selected checkboxes
    const selectedCount = Object.values(this.SingleDownloadCheckbox).filter(
      (checked) => checked
    ).length;
    return selectedCount >= 3;
  }
  fetchAndStoreVerticalLimits(): void {
    if (this.limitsFetched) {

      return;
    }
    this.userPriviledgeService.getverticalcategoryData().subscribe({
      next: (res: any) => {
        const verticals = res?.data?.verticals;

        if (Array.isArray(verticals)) {
          localStorage.setItem('vertical_limits', JSON.stringify(verticals));

          const pharmaVertical = verticals.find(
            (v: any) => v.slug === 'pharmvetpat-mongodb' && v.report_limit != null
          );

          if (pharmaVertical) {
            localStorage.setItem('report_limit', String(pharmaVertical.report_limit));
          } else {
            console.warn('PharmVetPat MongoDB vertical not found or report_limit is null');
          }
        }
        this.limitsFetched = true;
      },
      error: err => console.error('Vertical limit fetch failed:', err),
    });
  }
  getReportLimit(): number {
    // Step 1: Try privilege_json first
    this.fetchAndStoreVerticalLimits();
    const privRaw = localStorage.getItem('priviledge_json');
    const priv = JSON.parse(privRaw || '{}');
    const privLimit = Number(priv['pharmvetpat-mongodb']?.ReportLimit);
    if (!isNaN(privLimit) && privLimit > 0) {
      return privLimit;
    }
    // Step 2: Try vertical report_limit from localStorage
    const storedLimitRaw = localStorage.getItem('report_limit');
    const storedLimit = Number(storedLimitRaw);
    if (!isNaN(storedLimit) && storedLimit > 0) {
      return storedLimit;
    }
    return 25;
  }

  // handleGeneratePDF() {
  //   this.generatePDFloader = true;
  //   this.handleSetLoading.emit(true);

  //   const localPrivilege = localStorage.getItem('priviledge_json');
  //   const parsedPrivilege = JSON.parse(localPrivilege || '');
  //   let todays_limit: any = '';

  //   this.userPriviledgeService.getUserPriviledgesData().subscribe({
  //     next: (res: any) => {
  //       if (res?.data?.user_info) {
  //         const userInfo = res.data.user_info;
  //         this.userAuth = {
  //           name: userInfo.name,
  //           email: userInfo.email,
  //           user_id: userInfo.user_id,
  //           auth_token: userInfo.auth_token,
  //         };
  //         const privilegeKey = `user_${this.userAuth.user_id}`;
  //         const userPrivilege = userInfo?.privilege_json?.[privilegeKey];
  //         if (typeof window !== 'undefined' && window.localStorage && userPrivilege) {
  //           localStorage.setItem('priviledge_json', JSON.stringify(userPrivilege));
  //         }
  //         const pharmaPrivilege = userPrivilege?.['pharmvetpat-mongodb'];
  //         // if (
  //         //   !pharmaPrivilege ||
  //         //   pharmaPrivilege?.SplitDownload === 'false' ||
  //         //   !pharmaPrivilege?.DownloadCount ||
  //         //   pharmaPrivilege?.DownloadCount == 0 || "0"
  //         // ) {
  //         //   this.handleSetLoading.emit(false);
  //         //   this.OpenPriviledgeModal.emit(
  //         //     'Report download is only allowed with premium ID, please upgrade to a premium account.'
  //         //   );
  //         //   this.generatePDFloader = false;
  //         //   return;
  //         // }
  //         if (!pharmaPrivilege || pharmaPrivilege.SplitDownload === 'false') {
  //           // If SplitDownload is false → hide download button in UI
  //           // this.showDownloadButton = false;
  //           this.handleSetLoading.emit(false);
  //           this.generatePDFloader = false;
  //           return;
  //         }

  //         if (
  //           !pharmaPrivilege.DownloadCount ||
  //           pharmaPrivilege.DownloadCount === 0 ||
  //           pharmaPrivilege.DownloadCount === "0"
  //         ) {
  //           // If DownloadCount is 0 → show error
  //           this.handleSetLoading.emit(false);
  //           this.OpenPriviledgeModal.emit(
  //             'Your daily download limit is over for this platform.'
  //             // 'Report download is only allowed with premium ID, please upgrade to a premium account.'
  //           );
  //           this.generatePDFloader = false;
  //           return;
  //         }
  //         this.userPriviledgeService.getUserTodayPriviledgesData().subscribe({
  //           next: (res: any) => {
  //             if (res?.data) {
  //               todays_limit = res.data;
  //               const remaining = pharmaPrivilege.DailyDownloadLimit - todays_limit.downloadCount;
  //               if (remaining <= 0) {
  //                 this.handleSetLoading.emit(false);
  //                 this.OpenPriviledgeModal.emit(
  //                   'Your daily download limit is over for this platform.'
  //                 );
  //                 this.generatePDFloader = false;
  //                 return;
  //               }
  //               const searchThrough = Auth_operations.getActiveformValues()?.activeForm;
  //               const dataItem = this.dataItem?.[this.resultTabWithKeys.productInfo.name];
  //               let body_main: any = {
  //                 report_download: true,
  //                 reports: [],
  //                 limit: pharmaPrivilege.ReportLimit,
  //               };
  //               // Push report key if tab available
  //               if (this.currentTabData?.name) {
  //                 const tabName = this.currentTabData.name;
  //                 const reportKey = this.tabNameToReportKey?.[tabName] || tabName;
  //                 body_main.reports.push(reportKey);
  //               }
  //               if (body_main.reports.length === 0) {
  //                 alert('Please select at least 1 option');
  //                 this.handleSetLoading.emit(false);
  //                 this.generatePDFloader = false;
  //                 return;
  //               }
  //              // console.log(this.CurrentAPIBody, this.currentTabData.name, 'Selected Reports for PDF:', body_main.reports);
  //               // Clone CurrentAPIBody and add required flags
  //               const pdf_body = {
  //                 ...this.CurrentAPIBody,
  //                 body: {
  //                   ...this.CurrentAPIBody?.body, // preserve existing search fields
  //                   reports: [...body_main.reports],
  //                   report_download: true,
  //                   limit: this.getReportLimit(), //pharmaPrivilege.ReportLimit,
  //                 },
  //               };

  //              console.log('📄 Final PDF Request Body:', pdf_body);

  //               this.serviceResultTabFiltersService.getGeneratePDF(pdf_body).subscribe({
  //                 next: (resp: any) => {
  //                   const blob = new Blob([resp.body!], { type: 'application/pdf' });
  //                   const contentDisposition = resp.headers.get('content-disposition');

  //                   // Generate dynamic filename
  //                   const timestamp = new Date()
  //                     .toISOString()
  //                     .split('.')[0]
  //                     .replace('T', '_')
  //                     .replace(/:/g, '-');

  //                   let filename = 'basicProductReport_' + timestamp + '.pdf';
  //                   if (
  //                     searchThrough === searchTypes.chemicalStructure ||
  //                     searchThrough === searchTypes.synthesisSearch ||
  //                     searchThrough === searchTypes.intermediateSearch
  //                   ) {
  //                     filename = 'technicalRouteReport_' + timestamp + '.pdf';
  //                   }

  //                   // Override if filename is present in response headers
  //                   if (contentDisposition) {
  //                     const match = contentDisposition.match(/filename="?([^"]+)"?/);
  //                     if (match?.[1]) filename = match[1];
  //                   }

  //                   // Download PDF
  //                   const fileURL = URL.createObjectURL(blob);
  //                   const a = document.createElement('a');
  //                   a.href = fileURL;
  //                   a.download = filename;
  //                   document.body.appendChild(a);
  //                   a.click();
  //                   document.body.removeChild(a);

  //                   this.generatePDFloader = false;
  //                   this.handleSetLoading.emit(false);
  //                 },
  //                 error: (err: any) => {
  //                   this.generatePDFloader = false;
  //                   this.handleSetLoading.emit(false);
  //                   console.error('Error downloading the PDF', err);
  //                 },
  //               });
  //             }
  //           },
  //           error: (e) => {
  //             this.generatePDFloader = false;
  //             this.handleSetLoading.emit(false);
  //             console.error('Error getting today\'s privileges:', e);
  //           },
  //         });
  //       }
  //     },
  //     error: (e) => {
  //       this.generatePDFloader = false;
  //       this.handleSetLoading.emit(false);
  //       console.error('Error getting privileges:', e);
  //     },
  //   });
  // }
  handleGeneratePDF(index: number) {
    this.generatePDFloader = true;
    this.handleSetLoading.emit(true);

    const priviledge = localStorage.getItem('priviledge_json');
    const priviledge_data = JSON.parse(priviledge || '');
    let todays_limit: any = '';

    this.userPriviledgeService.getUserPriviledgesData().subscribe({
      next: (res: any) => {
        if (res?.data?.user_info) {
          const userInfo = res.data.user_info;

          this.userAuth = {
            name: userInfo.name,
            email: userInfo.email,
            user_id: userInfo.user_id,
            auth_token: userInfo.auth_token,
          };

          const privKey = `user_${this.userAuth?.user_id}`;

          if (typeof window !== 'undefined' && window.localStorage && userInfo?.privilege_json) {
            localStorage.setItem('priviledge_json', JSON.stringify(userInfo?.privilege_json[privKey]));
          }

          const pharmaPrivilege = userInfo?.privilege_json[privKey]?.['pharmvetpat-mongodb'];

          // ✅ Check privilege & limits
          if (
            !pharmaPrivilege ||
            pharmaPrivilege.Download === 'false' ||
            !pharmaPrivilege.DownloadCount ||
            pharmaPrivilege.DownloadCount === 0 ||
            pharmaPrivilege.DownloadCount === '0'
          ) {
            this.handleSetLoading.emit(false);
            this.OpenPriviledgeModal.emit('Your daily download limit is over for this platform.');
            this.generatePDFloader = false;
            return;
          }

          // ✅ Check daily download limits
          this.userPriviledgeService.getUserTodayPriviledgesData().subscribe({
            next: (res: any) => {
              if (res?.data) {
                todays_limit = res.data;

                if (pharmaPrivilege.DailyDownloadLimit - todays_limit.downloadCount <= 0) {
                  this.handleSetLoading.emit(false);
                  this.OpenPriviledgeModal.emit('Your daily download limit is over for this platform.');
                  this.generatePDFloader = false;
                  return;
                }

                // ✅ Identify correct ID depending on search type
                let id: any = '';
                const currentData = this.AllSetData[index];

                switch (this.searchThrough) {
                  case searchTypes.chemicalStructure:
                  case searchTypes.intermediateSearch:
                    id = currentData[this.resultTabWithKeys.chemicalDirectory.name]?.[0]?._id;
                    break;

                  case searchTypes.synthesisSearch:
                    id = currentData[this.resultTabWithKeys.technicalRoutes.name]?.ros_data?.[0]?._id;
                    break;

                  case searchTypes.simpleSearch:
                  case searchTypes.advanceSearch:
                  default:
                    id = currentData[this.resultTabWithKeys.productInfo.name]?.[0]?._id;
                    break;
                }

                // ✅ Build request body with CURRENT TAB
                let body_main: any = {
                  id: id,
                  reports: [],
                  limit: this.getReportLimit(),
                };

                const tabName = this.currentTabData?.name;
                if (tabName) {
                  const mappedName = this.tabNameToReportKey[tabName] || tabName;
                  body_main.reports.push(mappedName);
                }

                if (body_main.reports.length === 0) {
                  alert('Please select at least 1 option');
                  this.handleSetLoading.emit(false);
                  this.generatePDFloader = false;
                  return;
                }

                // ✅ Decide API based on search type
                let API_MAIN: any = {};
                if (this.searchThrough === searchTypes.synthesisSearch) {
                  API_MAIN = {
                    api_url: this.apiUrls.technicalRoutes.reportData,
                    body: body_main,
                  };
                } else if (
                  this.searchThrough === searchTypes.chemicalStructure ||
                  this.searchThrough === searchTypes.intermediateSearch
                ) {
                  API_MAIN = {
                    api_url: this.apiUrls.chemicalDirectory.reportData,
                    body: body_main,
                  };
                } else {
                  API_MAIN = {
                    api_url: this.apiUrls.basicProductInfo.reportData,
                    body: body_main,
                  };
                }

                // ✅ API Call
                this.serviceResultTabFiltersService.getGeneratePDF(API_MAIN).subscribe({
                  next: (resp: any) => {
                    const blob = new Blob([resp.body!], { type: 'application/pdf' });
                    const contentDisposition = resp.headers.get('content-disposition');

                    const timestamp = new Date()
                      .toISOString()
                      .split('.')[0]
                      .replace(/T/, '_')
                      .replace(/:/g, '-');

                    let filenamePrefix = 'basicProductReport';

                    if (
                      this.searchThrough === searchTypes.chemicalStructure ||
                      this.searchThrough === searchTypes.synthesisSearch ||
                      this.searchThrough === searchTypes.intermediateSearch
                    ) {
                      filenamePrefix = 'technicalRouteReport';
                    }

                    let filename = `${filenamePrefix}_${timestamp}.pdf`;

                    if (contentDisposition) {
                      const match = contentDisposition.match(/filename="?([^"]+)"?/);
                      if (match?.[1]) {
                        filename = match[1];
                      }
                    }

                    // ✅ Download PDF
                    const fileURL = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = fileURL;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    this.generatePDFloader = false;
                    this.handleSetLoading.emit(false);
                  },
                  error: (err: any) => {
                    this.generatePDFloader = false;
                    this.handleSetLoading.emit(false);
                    console.error('Error downloading the PDF', err);
                  },
                });
              }
            },
            error: (e) => {
              this.generatePDFloader = false;
              this.handleSetLoading.emit(false);
              console.error('Error:', e);
            },
          });
        }
      },
      error: (e) => {
        this.handleSetLoading.emit(false);
        this.generatePDFloader = false;
        console.error('Error:', e);
      },
    });
  }
  hasTabData(index: number): boolean {
    const currentData = this.AllSetData[index];
    const tabName = this.currentTabData?.name;
  
    if (!tabName || !currentData) return false;
  
    let tabData: any[] = [];
  
    // Handle different tab types
    switch (tabName) {
      case this.resultTabWithKeys.technicalRoutes.name:
        tabData = currentData[tabName]?.ros_data || [];
        break;
      default:
        tabData = currentData[tabName] || [];
    }
  
    return Array.isArray(tabData) && tabData.length > 0;
  }
  

  // handleGeneratePdf() {
  //   this.generatePDFloader = true;
  //   this.handleSetLoading.emit(true);
  //   const priviledge = localStorage.getItem('priviledge_json');
  //   const priviledge_data = JSON.parse(priviledge || '');

  //   let todays_limit: any = '';
  //   this.userPriviledgeService.getUserPriviledgesData().subscribe({
  //     next: (res: any) => {
  //       if (res && res?.data && res?.data?.user_info) {
  //         const userInfo = res.data.user_info;
  //         this.userAuth = {
  //           name: userInfo.name,
  //           email: userInfo.email,
  //           user_id: userInfo.user_id,
  //           auth_token: userInfo.auth_token,
  //         };
  //         let priviledge = `user_${this.userAuth?.user_id}`;

  //         if (
  //           typeof window !== 'undefined' &&
  //           window.localStorage &&
  //           userInfo?.priviledge_json
  //         ) {
  //           localStorage.setItem(
  //             'priviledge_json',
  //             JSON.stringify(userInfo?.privilege_json[priviledge])
  //           );
  //         }
  //         let priviledge_data = userInfo?.privilege_json[priviledge];
  //         if (
  //           !priviledge_data ||
  //           priviledge_data?.['pharmvetpat-mongodb']?.Download === 'false' ||
  //           priviledge_data?.['pharmvetpat-mongodb']?.DownloadCount == '' ||
  //           priviledge_data?.['pharmvetpat-mongodb']?.DownloadCount == 0 ||
  //           priviledge_data?.['pharmvetpat-mongodb']?.DownloadCount == '0'

  //         ) {
  //           this.handleSetLoading.emit(false);
  //           this.OpenPriviledgeModal.emit(
  //             'Your daily download limit is over for this platform.'
  //             // 'Report download is only allowed with premium ID, please updgrade to premium account.'
  //           );
  //           this.generatePDFloader = false;
  //           return;
  //         } else {
  //           this.userPriviledgeService.getUserTodayPriviledgesData().subscribe({
  //             next: (res: any) => {
  //               if (res && res?.data) {
  //                 todays_limit = res.data;
  //                 if (
  //                   priviledge_data?.['pharmvetpat-mongodb']?.DailyDownloadLimit -
  //                   todays_limit?.downloadCount <=
  //                   0
  //                 ) {
  //                   this.handleSetLoading.emit(false);
  //                   this.OpenPriviledgeModal.emit(
  //                     'Your daily download limit is over for this platform.'
  //                   );
  //                   this.generatePDFloader = false;
  //                   return;
  //                 }

  //                 if (
  //                   priviledge_data?.['pharmvetpat-mongodb']?.DailyDownloadLimit -
  //                   todays_limit?.downloadCount >
  //                   0
  //                 ) {

  //                   let pdf_body = { ...this.CurrentAPIBody };
  //                   pdf_body.body['report_download'] = true;
  //                   pdf_body.body['limit'] = this.getReportLimit();
  //                   if (this.CurrentAPIBody?.currentTab === 'technicalRoutes') {
  //                     pdf_body.api_url = this.apiUrls.technicalRoutes.synthesisSearch;
  //                   }
  //                   // ✅ Advance Search Case
  //                   if (this.lastSearchData?.searchType === "advance Search") {
  //                     //  const firstKeyword = this.CurrentAPIBody?.criteria?.[0]?.keyword || "";
  //                     //  console.log("First Keyword >>>", firstKeyword);
  //                     let firstKeyword = "";

  //                     if (this.CurrentAPIBody?.criteria?.length > 0) {
  //                       firstKeyword = this.CurrentAPIBody.criteria[0].keyword || "";
  //                     } else if (this.CurrentAPIBody?.body?.criteria?.length > 0) {
  //                       firstKeyword = this.CurrentAPIBody.body.criteria[0].keyword || "";
  //                     }

  //                     console.log("Extracted keyword >>>", firstKeyword);

  //                     pdf_body.body = {
  //                       report_download: true,
  //                       limit: this.getReportLimit(),
  //                       criteria: "",
  //                       filter_enable: false,
  //                       filters: {},
  //                       keyword: firstKeyword,   // 👈 now value will come
  //                       page_no: this.CurrentAPIBody.page_no || 1
  //                     };
  //                   }

  //                   console.log("Final pdf_body >>>", pdf_body);



  //                   this.serviceResultTabFiltersService
  //                     .getGeneratePDF(
  //                       pdf_body
  //                     ).subscribe({
  //                       next: (response: any) => {
  //                         const file = new Blob([response.body], {
  //                           type: 'application/pdf',
  //                         });
  //                         const contentDisposition = response.headers.get('content-disposition');
  //                         const timestamp = new Date()
  //                           .toISOString()
  //                           .split('.')[0] // remove milliseconds
  //                           .replace(/T/, '_') // replace T with _
  //                           .replace(/:/g, '-'); // format time separator

  //                         let filename = `Report_${timestamp}.pdf`;
  //                         if (contentDisposition) {
  //                           const match = contentDisposition.match(/filename="?([^"]+)"?/);
  //                           if (match && match[1]) {
  //                             filename = match[1];
  //                           }
  //                         }
  //                         const fileURL = URL.createObjectURL(file);
  //                         const a = document.createElement('a');
  //                         a.href = fileURL;
  //                         a.download = filename;
  //                         document.body.appendChild(a); // Append anchor to body
  //                         a.click(); // Trigger download
  //                         document.body.removeChild(a); // Remove the anchor from body
  //                         this.generatePDFloader = false;
  //                         this.handleSetLoading.emit(false);
  //                       },
  //                       error: (err) => {
  //                         this.generatePDFloader = false;
  //                         this.handleSetLoading.emit(false);
  //                         alert(err.response.message);
  //                         console.error('Error downloading the PDF', err);
  //                         // Handle error appropriately, e.g., show a notification to the user
  //                       },
  //                     });
  //                 }
  //               }
  //             },
  //             error: (err: any) => {
  //               this.generatePDFloader = false;
  //               this.handleSetLoading.emit(false);
  //               console.error('Error downloading the PDF', err);
  //               // Handle error appropriately, e.g., show a notification to the user
  //             },
  //           });
  //         }
  //       }
  //     },
  //     error: (err: any) => {
  //       this.generatePDFloader = false;
  //       console.error('Error downloading the PDF', err);
  //       // Handle error appropriately, e.g., show a notification to the user
  //     },
  //   });
  // }
  async generateSingleTabPDF(index: number) {
    const tab = this.resultTabs[index];
    this.generatePDFloader = true;
  
    try {
      // Convert Observable → Promise for await
      const response = await firstValueFrom(this.MainsearchService.generateSingleTabReport(tab));
  
      // Create Blob for PDF
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
  
      // Create a hidden download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tab.label}_Report_${new Date().toISOString()}.pdf`;
      a.click();
  
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
  
    this.generatePDFloader = false;
  }
  
  openDownloadModal(index?: number) {
    if (index == null) return;
    this.selectedIndex = index;  // store current tab index
  
    if (index === 0) { // full report
      const modal = new bootstrap.Modal(document.getElementById('download_btn'));
      modal.show();
    } else {
      this.generateSingleTabPDF(index); // direct download for single tab
    }
  }
  
  handleGeneratePDF1(index: number) {
    this.generatePDFloader = true;
    this.handleSetLoading.emit(true);
  
    const privilege = localStorage.getItem('priviledge_json');
    const privilegeData = JSON.parse(privilege || '{}');
    let todays_limit: any = '';
  
    this.userPriviledgeService.getUserPriviledgesData().subscribe({
      next: (res: any) => {
        if (res?.data?.user_info) {
          const userInfo = res.data.user_info;
          this.userAuth = {
            name: userInfo.name,
            email: userInfo.email,
            user_id: userInfo.user_id,
            auth_token: userInfo.auth_token,
          };
  
          const privKey = `user_${this.userAuth.user_id}`;
          const pharmaPrivilege = userInfo?.privilege_json?.[privKey]?.['pharmvetpat-mongodb'];
  
          // ✅ Privilege Check
          if (
            !pharmaPrivilege ||
            pharmaPrivilege.SplitDownload === 'false' ||
            !pharmaPrivilege.DownloadCount ||
            pharmaPrivilege.DownloadCount === '0' ||
            pharmaPrivilege.DownloadCount === 0
          ) {
            this.handleSetLoading.emit(false);
            this.generatePDFloader = false;
            this.OpenPriviledgeModal.emit('Your daily download limit is over for this platform.');
            return;
          }
  
          // ✅ Daily Limit Check
          this.userPriviledgeService.getUserTodayPriviledgesData().subscribe({
            next: (res: any) => {
              todays_limit = res?.data;
              if (
                pharmaPrivilege.DailyDownloadLimit - (todays_limit?.downloadCount || 0) <= 0
              ) {
                this.handleSetLoading.emit(false);
                this.generatePDFloader = false;
                this.OpenPriviledgeModal.emit('Your daily download limit is over for this platform.');
                return;
              }
  
              // ✅ Find ID depending on search type
              const currentData = this.AllSetData[index];
              let id: any = '';
  
              switch (this.searchThrough) {
                case searchTypes.chemicalStructure:
                case searchTypes.intermediateSearch:
                  id = currentData[this.resultTabWithKeys.chemicalDirectory.name]?.[0]?._id;
                  break;
                case searchTypes.synthesisSearch:
                  id = currentData[this.resultTabWithKeys.technicalRoutes.name]?.ros_data?.[0]?._id;
                  break;
                default:
                  id = currentData[this.resultTabWithKeys.productInfo.name]?.[0]?._id;
                  break;
              }
  
              // ✅ Build report body
              let body_main: any = {
                id,
                reports: [],
                limit: this.getReportLimit(),
              };
  
              // Push checked reports
              Object.keys(this.SingleDownloadCheckbox).forEach(key => {
                if (this.SingleDownloadCheckbox[key]) {
                  const mappedName = this.tabNameToReportKey[key];
                  body_main.reports.push(mappedName || key);
                }
              });
  
              // ⚠️ FIX: Ensure we have at least one report
              if (!body_main.reports.length) {
                alert('Please select at least one report before generating PDF.');
                this.handleSetLoading.emit(false);
                this.generatePDFloader = false;
                return;
              }
  
              // ✅ Select API endpoint
              let API_MAIN: any = {};
              if (this.searchThrough === searchTypes.synthesisSearch) {
                API_MAIN = { api_url: this.apiUrls.technicalRoutes.reportData, body: body_main };
              } else if (
                this.searchThrough === searchTypes.chemicalStructure ||
                this.searchThrough === searchTypes.intermediateSearch
              ) {
                API_MAIN = { api_url: this.apiUrls.chemicalDirectory.reportData, body: body_main };
              } else {
                API_MAIN = { api_url: this.apiUrls.basicProductInfo.reportData, body: body_main };
              }
  
              // ✅ Generate PDF
              this.serviceResultTabFiltersService.getGeneratePDF(API_MAIN).subscribe({
                next: (resp: any) => {
                  const blob = new Blob([resp.body!], { type: 'application/pdf' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Full_Selected_Report_${new Date().toISOString()}.pdf`;
                  a.click();
                  URL.revokeObjectURL(url);
  
                  this.handleSetLoading.emit(false);
                  this.generatePDFloader = false;
                },
                error: (err: any) => {
                  console.error('Error downloading PDF:', err);
                  this.handleSetLoading.emit(false);
                  this.generatePDFloader = false;
                },
              });
            },
            error: () => {
              this.handleSetLoading.emit(false);
              this.generatePDFloader = false;
            },
          });
        }
      },
      error: () => {
        this.handleSetLoading.emit(false);
        this.generatePDFloader = false;
      },
    });
  }
  
  selectDefaultDownloadTabs() {
    this.resultTabs.forEach(tab => (this.SingleDownloadCheckbox[tab.name] = false));
    
    if (this.searchThrough) {
      this.resultTabs.forEach(tab => {
        if (
          (this.searchThrough === this.searchTypes.simpleSearch && tab.name === this.resultTabWithKeys.productInfo.name) ||
          (this.searchThrough === this.searchTypes.synthesisSearch && tab.name === this.resultTabWithKeys.technicalRoutes.name) ||
          (this.searchThrough === this.searchTypes.chemicalStructure && tab.name === this.resultTabWithKeys.chemicalDirectory.name) ||
          (this.searchThrough === this.searchTypes.intermediateSearch && tab.name === this.resultTabWithKeys.chemicalDirectory.name) ||
          (this.searchThrough === this.searchTypes.advanceSearch && tab.name === this.resultTabWithKeys.productInfo.name)
        ) {
          this.SingleDownloadCheckbox[tab.name] = true;
        }
      });
    }
  }
  
  onChemicalDirectoryActiveTabChange(tabName: string) {
    this.activeTab = tabName;
  }
}