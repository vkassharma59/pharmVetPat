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
  ) {
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }

  ngOnInit() {
    console.log("_dataItem.veterinaryUsApproval", this._dataItem.veterinaryUsApproval)
    this.resultTabs = Object.values(this.utilityService.getAllTabsName());
    this.currentTabData = this.resultTabs.find((tab: any) => tab.isActive);

    //
    this.resultTabWithKeys = this.utilityService.getAllTabsName();
    this.raise_query_object = this.CurrentAPIBody?.body;

    this.resultTabs.forEach(tab => {
      this.SingleDownloadCheckbox[tab.name] = false;
    });

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
    const priviledge = localStorage.getItem('priviledge_json');

    const priviledge_data = JSON.parse(priviledge || '');
    let todays_limit: any = '';

    this.userPriviledgeService.getUserPriviledgesData().subscribe({
      next: (res: any) => {
        if (res && res?.data && res?.data?.user_info) {
          const userInfo = res.data.user_info;
          this.userAuth = {
            name: userInfo.name,
            email: userInfo.email,
            user_id: userInfo.user_id,
            auth_token: userInfo.auth_token,
          };
          let priviledge = `user_${this.userAuth?.user_id}`;

          if (
            typeof window !== 'undefined' &&
            window.localStorage &&
            userInfo?.priviledge_json
          ) {
            localStorage.setItem(
              'priviledge_json',
              JSON.stringify(userInfo?.privilege_json[priviledge])
            );
          }
          let priviledge_data = userInfo?.privilege_json[priviledge];
          if (
            !priviledge_data ||
            priviledge_data?.['pharmvetpat-mongodb']?.SplitDownload === 'false' ||
            priviledge_data?.['pharmvetpat-mongodb']?.DownloadCount == '' ||
            priviledge_data?.['pharmvetpat-mongodb']?.DownloadCount == 0 ||
            priviledge_data?.['pharmvetpat-mongodb']?.DownloadCount == '0'
          ) {
            this.handleSetLoading.emit(false);
            this.OpenPriviledgeModal.emit(
              'Report download is only allowed with premium ID, please updgrade to premium account.'
            );
            this.generatePDFloader = false;
            return;
          } else {
            this.userPriviledgeService.getUserTodayPriviledgesData().subscribe({
              next: (res: any) => {
                if (res && res?.data) {
                  todays_limit = res.data;
                  if (
                    priviledge_data?.['pharmvetpat-mongodb']?.DailyDownloadLimit -
                    todays_limit?.downloadCount <= 0
                  ) {
                    this.handleSetLoading.emit(false);
                    this.OpenPriviledgeModal.emit(
                      'Your daily download limit is over for this platform.'
                    );
                    this.generatePDFloader = false;
                    return;
                  }
                  if (
                    priviledge_data?.['pharmvetpat-mongodb']?.DailyDownloadLimit -
                    todays_limit?.downloadCount >
                    0
                  ) {
                    console.log('priviledge_data?.DownloadCount', priviledge_data?.['pharmvetpat-mongodb']?.DownloadCount);
                    console.log(priviledge_data?.['pharmvetpat-mongodb']?.DailyDownloadLimit, 'todays_limit?.downloadCount', todays_limit?.downloadCount);

                    let id: any = '';
                    const searchThrough = Auth_operations.getActiveformValues().activeForm;
                     console.log('No s-----------------------earch type selected',this.dataItem[this.resultTabWithKeys.technicalRoutes.name]?.ros_data?.[0]._id);

                    switch (searchThrough) {
                      case searchTypes.chemicalStructure:
                      case searchTypes.intermediateSearch:
                        id = this.dataItem[this.resultTabWithKeys.chemicalDirectory.name][0]._id;
                        break;
                      case searchTypes.synthesisSearch:
                        id = this.dataItem[this.resultTabWithKeys.technicalRoutes.name]?.ros_data?.[0]._id;
                      break;
                      case searchTypes.simpleSearch:
                      case searchTypes.advanceSearch:
                        id = this.dataItem[this.resultTabWithKeys.productInfo.name][0]._id;
                        break;
                      default:
                        id = this.dataItem[this.resultTabWithKeys.productInfo.name][0]._id;
                        console.log('No search type selected');
                    }
                      console.log('---------------No search type selected',this.dataItem[this.resultTabWithKeys.productInfo.name]);
                    let body_main: any = {
                      id: id,
                      reports: [],
                      limit: priviledge_data?.['pharmvetpat-mongodb']?.ReportLimit,
                    };
                    Object.keys(this.SingleDownloadCheckbox).forEach(key => {
                      if (this.SingleDownloadCheckbox[key]) {
                        body_main.reports.push(key);
                      }
                    });
                    // ✅ Add full download flag if needed
                    if (this.searchThrough === searchTypes.simpleSearch || this.searchThrough === searchTypes.advanceSearch) {
                      body_main.report_download = true;
                    }
                    if (body_main?.reports?.length == 0) {
                      alert('please select atleast 1 option');
                      this.handleSetLoading.emit(false);
                      this.generatePDFloader = false;
                      return;
                    } else {
                      let API_MAIN = {};
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
                        // simpleSearch or advanceSearch
                        API_MAIN = {
                          api_url: this.apiUrls.basicProductInfo.reportData,
                          body: body_main,
                        };
                      }
                      try {
                        this.serviceResultTabFiltersService.getGeneratePDF(API_MAIN).subscribe({
                          next: (resp: any) => {
                            const blob = new Blob([resp.body!], { type: 'application/pdf' });
                            console.log("-----------scfsdvfsdfgv API_MAIN ", resp)
                            const contentDisposition = resp.headers.get('content-disposition');
                            console.log("-----------contentDispositionscfsdvfsdfgv API_MAIN ", contentDisposition)
                            const timestamp = new Date()
                              .toISOString()
                              .split('.')[0] // remove milliseconds
                              .replace(/T/, '_') // replace T with _
                              .replace(/:/g, '-'); // format time separator
                            // Default name
                            let filenamePrefix = 'basicProductReport';

                            // Logic to update name based on search type
                            if (
                              this.searchThrough === searchTypes.chemicalStructure ||
                              this.searchThrough === searchTypes.synthesisSearch
                            ) {
                              filenamePrefix = 'technicalRouteReport';
                            }

                            // Final filename
                            let filename = `${filenamePrefix}_${timestamp}.pdf`;
                          //  let filename = `${this.searchThrough}Report_${timestamp}.pdf`;

                            if (contentDisposition) {
                              const match = contentDisposition.match(/filename="?([^"]+)"?/);
                              if (match && match[1]) {
                                filename = match[1];
                              }
                            }
                            // Download logic
                            const fileURL = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = fileURL;
                            console.log(fileURL, "-----------scfsdvfsdfgv API_MAIN ", filename)
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
                      } catch (err) {
                        this.handleSetLoading.emit(false);
                        this.generatePDFloader = false;
                      }
                    }
                  }
                }
              },
              error: (e) => {
                this.generatePDFloader = false;
                this.handleSetLoading.emit(false);
                console.error('Error:', e);
              },
            });
          }
        }
      },
      error: (e) => {
        this.handleSetLoading.emit(false);
        this.generatePDFloader = false;
        console.error('Error:', e);
      },
    });
  }

  onChemicalDirectoryActiveTabChange(tabName: string) {
    this.activeTab = tabName;
  }
}