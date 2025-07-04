import { CommonModule, NgFor } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { Auth_operations } from '../../../Utils/SetToken';
import { ChemDiscriptionViewModelComponent } from '../../../commons/chem-discription-viewmodel/chem-discription-viewmodel.component';
import { searchTypes, UtilityService } from '../../../services/utility-service/utility.service';
import { RouteResultComponent } from '../../route-result/route-result.component';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { ServiceResultTabFiltersService } from '../../../services/result_tab/service-result-tab-filters.service';
import { UserPriviledgeService } from '../../../services/user_priviledges/user-priviledge.service';
import { AppConfigValues } from '../../../config/app-config';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'chem-technical-route-card',
  standalone: true,
  imports: [CommonModule, RouteResultComponent, NgFor, FormsModule],
  templateUrl: './technical-routes-card.component.html',
  styleUrl: './technical-routes-card.component.css',
})
export class TechnicalRoutesCardComponent {
  @Output() handleSetLoading: EventEmitter<any> = new EventEmitter<any>();
  @Output() OpenPriviledgeModal: EventEmitter<any> = new EventEmitter<any>();

  static apiCallCount: number = 0; // Global static counter
  localCount: number = 0; // Instance-specific counter

  downloadable_values: string[] = [];
  doc_values: any = [];
  tech_column: any = {};
  resultTabs: any = {};
  resultTabs1: any = {};
  _data: any = [];

  currentTabData: any = {}

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
 allDataSets: any = [];
  @Input() CurrentAPIBody: any;
  @Input() index: any;
  @Input()
  get dataItem() {
    return this._dataItem;
  }
  set dataItem(value: any) {
    this._dataItem = value;
  }
 
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    if (value && Object.keys(value).length > 0) {
      TechnicalRoutesCardComponent.apiCallCount++; // Increment global counter
      this.localCount = TechnicalRoutesCardComponent.apiCallCount; // Assign to local instance
      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();
      if (column_list[this.resultTabs.technicalRoutes?.name]?.length > 0) {
        for (let i = 0; i < column_list[this.resultTabs.technicalRoutes.name].length; i++) {
          this.tech_column[column_list[this.resultTabs.technicalRoutes.name][i].value] =
            column_list[this.resultTabs.technicalRoutes.name][i].name;
        }
      }

      this._data = value;
    }
  }

  constructor(
    private dialog: MatDialog,
    private serviceResultTabFiltersService: ServiceResultTabFiltersService,
    private utilityService: UtilityService,
    private userPriviledgeService: UserPriviledgeService,
    private MainsearchService: MainSearchService,
  ) { }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
  ngOnInit() {
    this.resultTabs1 = Object.values(this.utilityService.getAllTabsName());
    this.currentTabData = this.resultTabs1.find((tab: any) => tab.isActive);
    this.resultTabWithKeys = this.utilityService.getAllTabsName();
    // Reset counter only when the component is first loaded
    if (TechnicalRoutesCardComponent.apiCallCount === 0) {
      TechnicalRoutesCardComponent.apiCallCount = 0;
    }
    this.resultTabs1.forEach(tab => {
      this.SingleDownloadCheckbox[tab.name] = false;
    });

    //
    const Account_type = localStorage.getItem('account_type');
    const Userdata = JSON.parse(localStorage.getItem('priviledge_json') || '');

    this.isSplitDownload =
      Userdata?.['pharmvetpat-mongodb']?.SplitDownload == 'true' ? true : false;

    this.isDownloadPermit = Account_type == 'premium' ? true : false;
  }
  isDisabled() {
    // Count the number of selected checkboxes
    const selectedCount = Object.values(this.SingleDownloadCheckbox).filter(
      (checked) => checked
    ).length;
    return selectedCount >= 3;
  }

  ngOnDestroy() {
    // Reset counter when navigating away from the component
    TechnicalRoutesCardComponent.apiCallCount = 0;
  }
  getColumnName(value: any) {
    return this.tech_column[value];
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

  getStringLength(value: any) {
    return value.length > 800;
  }

  isDateTimeString(dateString: any) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  getUpdationDate(data: any) {
    if (this.isDateTimeString(data)) {
      const date = new Date(data);
      return date.toISOString().split('T')[0];
    }
    return data;
  }

  getImageUrl(props: any): string {
    return `${environment.baseUrl}${environment.domainNameRouteOfSynthesis}${this.data?.route_of_synthesis}`;
  }

  getImageUrl2(props: any): string {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${this.data?.company_logo}`;
  }

  getGooglrPatentUrl(value: any): string {
    return `${environment.domianNameGooglePatent}${value}`;
  }

  getCountryUrl(value: any) {
    return `${environment.baseUrl}${environment.countryNameLogoDomain}${value?.country_of_company}.png`;
  }

  getespaceneturl(value: any): string {
    return `${environment.domainNameEspacenetUrl}${value}A1?q=${value}`;
  }

  getSplitValues(downloadable_docs: string) {
    this.downloadable_values = downloadable_docs.split(';');
    return true;
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
                    console.log('No s-----------------------earch type selected', this.dataItem);

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
                    console.log('---------------No search type selected', this.dataItem[this.resultTabWithKeys.productInfo.name]);
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
                       console.log('---------------No api MAIN', API_MAIN);
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
  getDownloadableValues(downloadable_docs: any) {
    this.doc_values = downloadable_docs.split(';');
    return true;
  }

  getDocHrefvalue(value: any) {
    return `https://chemrobotics.com/agropat/pdf/gsda/docs/${value}`;
  }

  OpenViewModal(data: any, title: any) {
    this.dialog.open(ChemDiscriptionViewModelComponent, {
      width: 'calc(100vw - 50px)',
      height: 'auto',
      panelClass: 'full-screen-modal',
      data: { dataRecord: data, title: title },
    });
  }
  openImageModal(imageUrl: string): void {
    this.dialog.open(ImageModalComponent, {
      width: 'auto',
      height: 'auto',
      panelClass: 'full-screen-modal',
      data: { dataImage: imageUrl },
    });
  }
}


