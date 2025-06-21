import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { Chem_Robotics_QueryModalComponent } from '../../components/Chem_Robotics_QueryModal/Chem_Robotics_QueryModal.component';
import { MatDialog } from '@angular/material/dialog';
import { Input } from '@angular/core';
import { ServiceResultTabFiltersService } from '../../services/result_tab/service-result-tab-filters.service';
import { FormsModule } from '@angular/forms';
import { UserPriviledgeService } from '../../services/user_priviledges/user-priviledge.service';
import { UtilityService } from '../../services/utility-service/utility.service';

@Component({
  selector: 'app-result-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './result-tab.component.html',
  styleUrl: './result-tab.component.css',
})
export class ResultTabComponent {

  @Output() downloadPdfEvent = new EventEmitter<void>();
  @Output() showDataResultFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleLoading: EventEmitter<any> = new EventEmitter<any>();
  @Output() makePdf: EventEmitter<any> = new EventEmitter<any>();
  @Output() priviledgeModal: EventEmitter<any> = new EventEmitter<any>();
  @Input() MainDataResultShow: any;
  @Input() CurrentAPIBody: any;

  raise_query_object: any;
  isDownloadPermit = false;
  isSplitDownload: any = false;
  isDownloadAvailable: any = false;
  resultTabs: any = [];
  handlegenerateloading: any = false;

  TabFilters: any = {
    field_of_application: 'Select Option',
    company_name: 'Select Option',
    route_type: 'Select Option',
    order_by: 'Select Option',
    active_ingredient: 'Select Option',
    updation_date: 'Select Option',
    types_of_route: 'Select Option',
  };

  FilterValues: any = {
    company_name: [],
    route_type: [],
    field_of_application: [],
    order_by: [],
    active_ingredient: [],
    updation_date: [],
    types_of_route: [],
  };

  OpenSuggestionBox: any = {
    company_name: false,
    route_type: false,
    field_of_application: false,
    order_by: false,
    active_ingredient: false,
    updation_date: false,
    types_of_route: false,
  };

  userAuth: any = {};
  

  constructor(
    private dialog: MatDialog,
    private UserPriviledgeService: UserPriviledgeService,
    private ServiceResultTabFiltersService: ServiceResultTabFiltersService,
    private utilityService: UtilityService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }

  ngOnInit() {
    if (
      this.CurrentAPIBody.currentTab == this.resultTabs.technicalRoutes.name ) {
      this.raise_query_object = this.CurrentAPIBody?.body;
      this.fetchFilters();
    }

    const Account_type = localStorage.getItem('account_type');
    const Userdata = JSON.parse(localStorage.getItem('priviledge_json') || '');
    this.isSplitDownload = Userdata?.['pharmvetpat-mongodb']?.SplitDownload;
    this.isDownloadAvailable = Userdata?.['pharmvetpat-mongodb']?.Download;
    this.isDownloadPermit = Account_type == 'premium' ? true : false;
  }

  showFilter: boolean = false;
  company_name_filters: any = [];
  route_type_filters: any = [];
  field_of_applications_filters: any = [];
  order_filters: any = [];
  active_ingredient_filters: any = [];
  update_date_filters: any = [];
  types_of_route_filters: any = [];

  AllSubMainFilters: any = {
    company_name: [],
    route_type: [],
    field_of_application: [],
    order_by: [],
    active_ingredient: [],
    updation_date: [],
    types_of_route: [],
  };

  filterMap: any = {
    openCompanyFilter: false,
    openFieldOfApplicationsFilter: false,
    openRouteFilter: false,
    openOrderfilter: false,
    openActiveIngredientFilter: false,
    openUpdateDateFilter: false,
    openTypeOfRouteFilter: false,
  };

  SearchFilterValues: any = {
    company_name: '',
    route_type: '',
    field_of_application: '',
    order_by: '',
    active_ingredient: '',
    updation_date: '',
    types_of_route: '',
  };

  isDownloadAvailableFunction() {
    return this.isDownloadAvailable === 'true';
  }

  OnBlur(filterValue: any) {
    setTimeout(() => {
      this.OpenSuggestionBox[filterValue] = false;
      if (filterValue == 'active_ingredient') {
        this.filterMap['openActiveIngredientFilter'] = false;
      } else if (filterValue == 'company_name') {
        this.filterMap['openActiveIngredientFilter'] = false;
      } else if (filterValue == 'field_of_application') {
        this.filterMap['openFieldOfApplicationsFilter'] = false;
      } else if (filterValue == 'order_by') {
        this.filterMap['openOrderfilter'] = false;
      } else if (filterValue == 'route_type') {
        this.filterMap['openRouteFilter'] = false;
      } else if (filterValue == 'updation_date') {
        this.filterMap['openUpdateDateFilter'] = false;
      } else if (filterValue == 'types_of_route') {
        this.filterMap['openTypeOfRouteFilter'] = false;
      }
    }, 300);
  }

  handleSearchFilter(filterValue: any, StoreFilters: any) {
    this.SearchFilterValues[filterValue] = this.SearchFilterValues[filterValue]
      .trim()
      .toUpperCase();

    let filteredArr = this.AllSubMainFilters[filterValue].filter((item: any) =>
      item?.name.toUpperCase().includes(this.SearchFilterValues[filterValue])
    );

    if (StoreFilters == ' active_ingredient_filters')
      this.active_ingredient_filters = filteredArr;
    else if (StoreFilters == 'company_name_filters')
      this.company_name_filters = filteredArr;
    else if (StoreFilters == 'route_type_filters')
      this.route_type_filters = filteredArr;
    else if (StoreFilters == 'field_of_applications_filters')
      this.field_of_applications_filters = filteredArr;
    else if (StoreFilters == 'order_filters') this.order_filters = filteredArr;
    else if (StoreFilters == 'update_date_filters')
      this.update_date_filters = filteredArr;
    else if (StoreFilters == 'types_of_route_filters')
      this.types_of_route_filters = filteredArr;
  }

  handleCheckFilter(filter: any, value: any) {
    let ExtraValue = this.FilterValues[filter];
    let exists = ExtraValue.includes(value);
    if (!exists) ExtraValue.push(value);
    this.FilterValues[filter] = ExtraValue;
  }

  handleRemovefilterElement(filter: any, index: any) {
    let ExtraValue = this.FilterValues[filter];
    ExtraValue.splice(index, 1);
    this.FilterValues[filter] = ExtraValue;
  }

  handleGeneratePdf() {
    this.handlegenerateloading = true;

    const priviledge = localStorage.getItem('priviledge_json');

    const priviledge_data = JSON.parse(priviledge || '');

    let todays_limit: any = '';
    this.UserPriviledgeService.getUserPriviledgesData().subscribe({
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
            priviledge_data?.['pharmvetpat-mongodb']?.Download === 'false' ||
            priviledge_data?.['pharmvetpat-mongodb']?.DownloadCount == '' ||
            priviledge_data?.['pharmvetpat-mongodb']?.DownloadCount == 0
          ) {
            this.handleLoading.emit(false);
            this.priviledgeModal.emit(
              'Report download is only allowed with premium ID, please updgrade to premium account.'
            );
            this.handlegenerateloading = false;

            return;
          } else {
            this.UserPriviledgeService.getUserTodayPriviledgesData().subscribe({
              next: (res: any) => {
                if (res && res?.data) {
                  todays_limit = res.data;
                  if (
                    priviledge_data?.['pharmvetpat-mongodb']?.DailyDownloadLimit -
                      todays_limit?.downloadCount <=
                    0
                  ) {
                    this.handleLoading.emit(false);
                    this.priviledgeModal.emit(
                      'Your daily download limit is over for this platform.'
                    );
                    this.handlegenerateloading = false;
                    return;
                  }

                  if (
                    priviledge_data?.['pharmvetpat-mongodb']?.DailyDownloadLimit -
                      todays_limit?.downloadCount >
                    0
                  ) {
                    let pdf_body = this.CurrentAPIBody;

                    pdf_body.body['report_download'] = true;
                    pdf_body.body['limit'] =
                      priviledge_data?.['pharmvetpat-mongodb']?.ReportLimit;

                    this.ServiceResultTabFiltersService.getGeneratePDF(
                      pdf_body
                    ).subscribe({
                      next: (response: any) => {
                        const file = new Blob([response.body], {
                          type: 'application/pdf',
                        });

                        // Create a URL for the Blob
                        const fileURL = URL.createObjectURL(file);

                        // Create an anchor element and trigger a download
                        const a = document.createElement('a');
                        a.href = fileURL;
                        a.download = 'Report_2024-10-22_12-12-07.pdf'; // Specify the filename
                        document.body.appendChild(a); // Append anchor to body
                        a.click(); // Trigger download
                        document.body.removeChild(a); // Remove the anchor from body
                        this.handlegenerateloading = false;
                        this.handleLoading.emit(false);
                      },
                      error: (err) => {
                        this.handlegenerateloading = false;
                        this.handleLoading.emit(false);
                        alert(err.response.message);
                        console.error('Error downloading the PDF', err);
                        // Handle error appropriately, e.g., show a notification to the user
                      },
                    });
                  }
                }
              },
              error: (err: any) => {
                this.handlegenerateloading = false;
                console.error('Error downloading the PDF', err);
                // Handle error appropriately, e.g., show a notification to the user
              },
            });
          }
        }
      },
      error: (err: any) => {
        this.handlegenerateloading = false;
        console.error('Error downloading the PDF', err);
        // Handle error appropriately, e.g., show a notification to the user
      },
    });
  }

  handleListfilter(key: any) {
    if (this.filterMap[key] == false) {
      this.filterMap = {
        openCompanyFilter: false,
        openFieldOfApplicationsFilter: false,
        openRouteFilter: false,
        openOrderfilter: false,
        openActiveIngredientFilter: false,
        openUpdateDateFilter: false,
        openTypeOfRouteFilter: false,
      };
      this.filterMap[key] = !this.filterMap[key];
    } else {
      this.filterMap[key] = !this.filterMap[key];
    }

    if (key == 'openActiveIngredientFilter') {
      this.OpenSuggestionBox['active_ingredient'] = this.filterMap[key];
      if (this.OpenSuggestionBox['active_ingredient']) {
        setTimeout(() => {
          const el: any = document.getElementById('active_ingredient');
          el?.focus();
        }, 300);
      }
    } else if (key == 'openCompanyFilter') {
      this.OpenSuggestionBox['company_name'] = this.filterMap[key];
      if (this.OpenSuggestionBox['company_name']) {
        setTimeout(() => {
          const el: any = document.getElementById('company_name');
          el?.focus();
        }, 300);
      }
    } else if (key == 'openFieldOfApplicationsFilter') {
      this.OpenSuggestionBox['field_of_application'] = this.filterMap[key];
      if (this.OpenSuggestionBox['field_of_application']) {
        setTimeout(() => {
          const el: any = document.getElementById('field_of_application');
          el?.focus();
        }, 300);
      }
    } else if (key == 'openOrderfilter') {
      this.OpenSuggestionBox['order_by'] = this.filterMap[key];
      if (this.OpenSuggestionBox['order_by']) {
        setTimeout(() => {
          const el: any = document.getElementById('order_by');
          el?.focus();
        }, 300);
      }
    } else if (key == 'openRouteFilter') {
      this.OpenSuggestionBox['route_type'] = this.filterMap[key];
      if (this.OpenSuggestionBox['route_type']) {
        setTimeout(() => {
          const el: any = document.getElementById('route_type');
          el?.focus();
        }, 300);
      }
    } else if (key == 'openUpdateDateFilter') {
      this.OpenSuggestionBox['updation_date'] = this.filterMap[key];
      if (this.OpenSuggestionBox['updation_date']) {
        setTimeout(() => {
          const el: any = document.getElementById('updation_date');
          el?.focus();
        }, 300);
      }
    } else if (key == 'openTypeOfRouteFilter') {
      this.OpenSuggestionBox['types_of_route'] = this.filterMap[key];
      if (this.OpenSuggestionBox['types_of_route']) {
        setTimeout(() => {
          const el: any = document.getElementById('types_of_route');
          el?.focus();
        }, 300);
      }
    }
  }

  handleReset() {
    this.handleLoading.emit(true);
    let body = this.CurrentAPIBody.body;
    this.FilterValues = {
      company_name: [],
      route_type: [],
      field_of_application: [],
      order_by: [],
      active_ingredient: [],
      updation_date: [],
      types_of_route: [],
    };

    this.TabFilters = {
      field_of_application: 'Select Option',
      company_name: 'Select Option',
      route_type: 'Select Option',
      order_by: 'Select Option',
      active_ingredient: 'Select Option',
      updation_date: 'Select Option',
      types_of_route: 'Select Option',
    };

    body.filter_enable = false;
    body.order_by = '';
    body.filters = {};
    this.CurrentAPIBody.body = body;
    this.CurrentAPIBody.body.page_no = 1;
    this.ServiceResultTabFiltersService.getFilterOptions(
      this.CurrentAPIBody
    ).subscribe({
      next: (res) => {
        this.showDataResultFunction.emit(res?.data);

        this.handleLoading.emit(false);
      },
      error: (e) => {
        console.error(e);
        this.handleLoading.emit(false);
      },
    });
  }

  removeEmptyArrays(obj: any) {
    for (let key in obj) {
      if (Array.isArray(obj[key]) && obj[key].length === 0) {
        delete obj[key];
      }
    }
    return obj;
  }

  handleSearchFilterResults() {
    this.handleLoading.emit(true);
    let body = this.CurrentAPIBody.body;
    body.filter_enable = false;
    if (this.FilterValues?.order_by?.length > 0)
      body.order_by = this.FilterValues.order_by[0];
    if (this.FilterValues?.route_type?.length > 0)
      body.filters.route_type = this.FilterValues.route_type;
    if (this.FilterValues?.active_ingredient?.length > 0)
      body.filters.active_ingredient = this.FilterValues.active_ingredient;
    if (this.FilterValues?.company_name?.length > 0)
      body.filters.company_name = this.FilterValues.company_name;
    if (this.FilterValues?.types_of_route?.length > 0)
      body.filters.types_of_route = this.FilterValues.types_of_route;
    if (this.FilterValues?.field_of_application?.length > 0)
      body.filters.field_of_application =
        this.FilterValues.field_of_application;
    if (this.FilterValues?.updation_date?.length > 0)
      body.filters.updation_date = this.FilterValues.updation_date;

    let cleanedDataBody = this.removeEmptyArrays(body.filters);
    body.filters = cleanedDataBody;
    this.CurrentAPIBody.body = body;
    this.CurrentAPIBody.body.page_no = 1;
    this.ServiceResultTabFiltersService.getFilterOptions(
      this.CurrentAPIBody
    ).subscribe({
      next: (res) => {
        this.showDataResultFunction.emit(res?.data);

        this.handleLoading.emit(false);
      },
      error: (e) => {
        console.error(e);
        this.handleLoading.emit(false);
      },
    });
  }

  handleSelectFilter(key: string, value: string) {
    this.handleLoading.emit(true);
    let body = this.CurrentAPIBody.body;
    if (value == '') {
      if (key == 'order_by') {
        body.order_by = '';
      } else delete body.filters[key];
      this.TabFilters[key] = 'Select Option';
    } else {
      if (key === 'order_by') {
        body.order_by = value;
      } else body.filters[key] = value;
      if (key == 'updation_date') {
        this.TabFilters[key] = this.getUpdationDate(value);
      } else this.TabFilters[key] = value;
    }

    this.filterMap = {
      openCompanyFilter: false,
      openFieldOfApplicationsFilter: false,
      openRouteFilter: false,
      openOrderfilter: false,
      openActiveIngredientFilter: false,
      openUpdateDateFilter: false,
      openTypeOfRouteFilter: false,
    };

    body.filter_enable = false;
    this.CurrentAPIBody.body = body;
    this.CurrentAPIBody.body.page_no = 1;

    this.ServiceResultTabFiltersService.getFilterOptions(
      this.CurrentAPIBody
    ).subscribe({
      next: (res) => {
        this.showDataResultFunction.emit(res?.data);

        this.handleLoading.emit(false);
      },
      error: (e) => {
        console.error(e);
        this.handleLoading.emit(false);
      },
    });
  }

  toogleFilter() {
    this.showFilter = !this.showFilter;
  }

  fetchFilters() {
    this.CurrentAPIBody.body.filter_enable = true;

    this.ServiceResultTabFiltersService.getFilterOptions(
      this.CurrentAPIBody
    ).subscribe({
      next: (res) => {
        this.company_name_filters = res?.data?.company_name;
        this.AllSubMainFilters.company_name = res?.data?.company_name;
        this.route_type_filters = res?.data?.route_type;
        this.AllSubMainFilters.route_type = res?.data?.route_type;
        this.field_of_applications_filters = res?.data?.field_of_application;
        this.AllSubMainFilters.field_of_application =
          res?.data?.field_of_application;
        this.order_filters = res?.data?.order_by;
        this.AllSubMainFilters.order_by = res?.data?.order_by;
        this.active_ingredient_filters = res?.data?.active_ingredient;
        this.AllSubMainFilters.active_ingredient = res?.data?.active_ingredient;
        this.update_date_filters = res?.data?.updation_date;
        this.AllSubMainFilters.updation_date = res?.data?.updation_date;
        this.types_of_route_filters = res?.data?.types_of_route;
        this.AllSubMainFilters.types_of_route = res?.data?.types_of_route;
        this.CurrentAPIBody.body.filter_enable = false;
      },
      error: (e) => console.error(e),
    });
  }

  OpenQueryModal() {
    const dialogRef = this.dialog.open(Chem_Robotics_QueryModalComponent, {
      width: '450px',
      height: '500px',
      data: {
        raise_query_object: this.raise_query_object,
        handleLoading: this.handleLoading,
      },
      panelClass: 'full-screen-modal',
    });
  }

  getUpdationDate(data: any) {
    const date = new Date(data);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }
  downloadPdf(): void {
    this.downloadPdfEvent.emit();
  }
}
