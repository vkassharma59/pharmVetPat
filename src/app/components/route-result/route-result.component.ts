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

@Component({
  selector: 'chem-route-results',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, BasicRouteComponent, TechnicalRoutesComponent,
    ImpurityComponent, ChemiTrackerComponent, ImpComponent, IndianComponent, ChemicalDirectoryComponent,
    JapanComponent, CanadaComponent, EuropeApprovalComponent, KoreaComponent, LitigationComponent,
    UsComponent, SpcdbComponent, EximComponent, RouteTabsComponent, ActivePatentComponent,
    NgSwitch, NgSwitchCase, NgSwitchDefault, ScientificDocsComponent, GppdDbComponent, NonPatentComponent, VeterinaryUsApprovalComponent],
  templateUrl: './route-result.component.html',
  styleUrl: './route-result.component.css'
})

export class RouteResultComponent {

  public scientificDocsPayload: any[] = [];
  tabNameToReportKey: { [key: string]: string } = {
    productInfo: 'basicProduct',
    chemicalDirectory: 'chemDirectory',
    chemiTracker: 'chemiTracker',
    technicalRoutes: 'techRoute',
    impurity: 'impurity',
  };

  currentTabData: any = {}
  resultTabs: any = [];
  resultTabWithKeys: any = [];
  _dataItem: any = {};
  raise_query_object: any;
  SingleDownloadCheckbox: { [key: string]: boolean } = {};
  generatePDFloader: any = false;
  userAuth: any = {};
  apiUrls = AppConfigValues.appUrls;
  searchThrough: string = '';
  isSplitDownload: boolean = false;
  isDownloadPermit: boolean = false;
  activeTab: string = '';
  report_download = true;
  isDownloadAvailable: any = false;
  @Output() handleSetLoading: EventEmitter<any> = new EventEmitter<any>();
  @Output() backFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() onResultTabChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleChildPaginationSearch: EventEmitter<any> = new EventEmitter<any>();
  @Output() OpenPriviledgeModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() resetPagination: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleROSChange: EventEmitter<any> = new EventEmitter<any>();

  _currentChildAPIBody: any;
  @Input() specialCount: any;
  @Input() currentApiData: any;
  @Input() CurrentAPIBody: any;
  @Input() index: number | undefined;
  @Input() searchData: any;

  @Input()
  get dataItem() {
    console.log("dataItem---hkjh", this._dataItem);
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

  constructor(
    private dialog: MatDialog,
    private serviceResultTabFiltersService: ServiceResultTabFiltersService,
    private utilityService: UtilityService,
    private userPriviledgeService: UserPriviledgeService,
    private MainsearchService: MainSearchService,
  ) {
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }

  ngOnInit() {
    this.resultTabs = Object.values(this.utilityService.getAllTabsName());
    this.currentTabData = this.resultTabs.find((tab: any) => tab.isActive);
    //
    this.resultTabWithKeys = this.utilityService.getAllTabsName();
    this.raise_query_object = this.CurrentAPIBody?.body;

    this.resultTabs.forEach(tab => {
      this.SingleDownloadCheckbox[tab.name] = false;
    });
    console.log("_dataItem searchThrough", this.CurrentAPIBody?.currentTab === this.resultTabWithKeys.technicalRoutes.name,)

    //
    const Account_type = localStorage.getItem('account_type');
    const Userdata = JSON.parse(localStorage.getItem('priviledge_json') || '');

    this.isSplitDownload =
      Userdata?.['pharmvetpat-mongodb']?.SplitDownload == 'true' ? true : false;

    this.isDownloadPermit = Account_type == 'premium' ? true : false;
  }

  handleBack() {
    this.backFunction.emit(false);
  }
  isTechnicalRoutesTabActive(): boolean {
    return this.CurrentAPIBody?.currentTab === this.resultTabs?.technicalRoutes?.name;
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

  handleGeneratePDF() {
    this.generatePDFloader = true;
    this.handleSetLoading.emit(true);

    const localPrivilege = localStorage.getItem('priviledge_json');
    const parsedPrivilege = JSON.parse(localPrivilege || '');
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

          const privilegeKey = `user_${this.userAuth.user_id}`;
          const userPrivilege = userInfo?.privilege_json?.[privilegeKey];

          if (typeof window !== 'undefined' && window.localStorage && userPrivilege) {
            localStorage.setItem('priviledge_json', JSON.stringify(userPrivilege));
          }

          const pharmaPrivilege = userPrivilege?.['pharmvetpat-mongodb'];
          if (
            !pharmaPrivilege ||
            pharmaPrivilege?.SplitDownload === 'false' ||
            !pharmaPrivilege?.DownloadCount ||
            pharmaPrivilege?.DownloadCount == 0
          ) {
            this.handleSetLoading.emit(false);
            this.OpenPriviledgeModal.emit(
              'Report download is only allowed with premium ID, please upgrade to a premium account.'
            );
            this.generatePDFloader = false;
            return;
          }

          this.userPriviledgeService.getUserTodayPriviledgesData().subscribe({
            next: (res: any) => {
              if (res?.data) {
                todays_limit = res.data;

                const remaining = pharmaPrivilege.DailyDownloadLimit - todays_limit.downloadCount;
                if (remaining <= 0) {
                  this.handleSetLoading.emit(false);
                  this.OpenPriviledgeModal.emit(
                    'Your daily download limit is over for this platform.'
                  );
                  this.generatePDFloader = false;
                  return;
                }

                const searchThrough = Auth_operations.getActiveformValues()?.activeForm;
                const dataItem = this.dataItem?.[this.resultTabWithKeys.productInfo.name];

                let body_main: any = {
                  report_download: true,
                  reports: [],
                  limit: pharmaPrivilege.ReportLimit,
                };

                // Push report key if tab available
                if (this.currentTabData?.name) {
                  const tabName = this.currentTabData.name;
                  const reportKey = this.tabNameToReportKey?.[tabName] || tabName;
                  body_main.reports.push(reportKey);
                }

                if (body_main.reports.length === 0) {
                  alert('Please select at least 1 option');
                  this.handleSetLoading.emit(false);
                  this.generatePDFloader = false;
                  return;
                }

                // Clone CurrentAPIBody and add required flags
                const pdf_body = {
                  ...this.CurrentAPIBody,
                  body: {
                    ...this.CurrentAPIBody?.body, // preserve existing search fields
                    reports: [...body_main.reports],
                    report_download: true,
                    limit: pharmaPrivilege.ReportLimit,
                  },
                };

                console.log('📄 Final PDF Request Body:', pdf_body);

                this.serviceResultTabFiltersService.getGeneratePDF(pdf_body).subscribe({
                  next: (resp: any) => {
                    const blob = new Blob([resp.body!], { type: 'application/pdf' });
                    const contentDisposition = resp.headers.get('content-disposition');

                    // Generate dynamic filename
                    const timestamp = new Date()
                      .toISOString()
                      .split('.')[0]
                      .replace('T', '_')
                      .replace(/:/g, '-');

                    let filename = 'basicProductReport_' + timestamp + '.pdf';
                    if (
                      searchThrough === searchTypes.chemicalStructure ||
                      searchThrough === searchTypes.synthesisSearch ||
                      searchThrough === searchTypes.intermediateSearch
                    ) {
                      filename = 'technicalRouteReport_' + timestamp + '.pdf';
                    }

                    // Override if filename is present in response headers
                    if (contentDisposition) {
                      const match = contentDisposition.match(/filename="?([^"]+)"?/);
                      if (match?.[1]) filename = match[1];
                    }

                    // Download PDF
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
              console.error('Error getting today\'s privileges:', e);
            },
          });
        }
      },
      error: (e) => {
        this.generatePDFloader = false;
        this.handleSetLoading.emit(false);
        console.error('Error getting privileges:', e);
      },
    });
  }


  onChemicalDirectoryActiveTabChange(tabName: string) {
    this.activeTab = tabName;
  }
}