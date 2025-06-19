import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { Chem_Robotics_QueryModalComponent } from '../../components/Chem_Robotics_QueryModal/Chem_Robotics_QueryModal.component';
import { MatDialog } from '@angular/material/dialog';
import { Input } from '@angular/core';
import { ServiceResultTabFiltersService } from '../../services/result_tab/service-result-tab-filters.service';
import { FormsModule } from '@angular/forms';
import { HostListener, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';

@Component({
  selector: 'chem-child-result-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './child-result-tab.component.html',
  styleUrl: './child-result-tab.component.css',
})

export class ChildResultTabComponent {

  _currentAPIData: any;
  @Output() childFilteredData = new EventEmitter<any>();
  @Output() childFilterEvent = new EventEmitter<any>();
  @Output() handleChangeTabData: EventEmitter<any> = new EventEmitter();
  @Output() resetPagination: EventEmitter<any> = new EventEmitter();
  @Output() setLoading: EventEmitter<any> = new EventEmitter();
  @ViewChildren('dropdownRef') dropdownRefs!: QueryList<ElementRef>;

  @Input() dataItem: any;
  @Input()
  get currentAPIData() {
    return this._currentAPIData;
  }
  set currentAPIData(value: any) {
    if (value) {
      const { api_url, ...body } = value; // Remove api_url and keep the rest
      this._currentAPIData = { api_url, body };  // Store the remaining properties inside body
    }
  }

  TabFilters: any = {
    field_of_application: 'Select Option',
    company_name: 'Select Option',
    route_type: 'Select Option',
    order_by: 'Select Option',
    active_ingredient: 'Select Option',
    updation_date: 'Select Option',
    types_of_route: 'Select Option',
  };

  isKSMEnabled = false;
  showFilter: boolean = false;

  company_name_filters: any = [];
  route_type_filters: any = [];
  field_of_applications_filters: any = [];
  order_filters: any = [];
  active_ingredient_filters: any = [];
  update_date_filters: any = [];
  types_of_route_filters: any = [];

  FilterValues: any = {
    company_name: [],
    route_type: [],
    field_of_application: [],
    order_by: [],
    active_ingredient: [],
    updation_date: [],
    types_of_route: [],
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

  AllSubMainFilters: any = {
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

  filterMap: any = {
    openCompanyFilter: false,
    openFieldOfApplicationsFilter: false,
    openRouteFilter: false,
    openOrderfilter: false,
    openActiveIngredientFilter: false,
    openUpdateDateFilter: false,
    openTypeOfRouteFilter: false,
  };

  constructor(
    private dialog: MatDialog,
    private ServiceResultTabFiltersService: ServiceResultTabFiltersService
  ) { }

  ngOnInit() {
    if (
      this._currentAPIData.body.filters &&
      this._currentAPIData.body.filters['types_of_route']
    ) {
      this.isKSMEnabled = true;
    }

    this.fetchFilters();
  }
  @HostListener('document:mousedown', ['$event'])
onClickOutside(event: MouseEvent) {
  const clickedInsideAny = this.dropdownRefs?.some((dropdown: ElementRef) =>
    dropdown.nativeElement.contains(event.target)
  );

  if (!clickedInsideAny) {
    this.filterMap = {
      openCompanyFilter: false,
      openFieldOfApplicationsFilter: false,
      openRouteFilter: false,
      openOrderfilter: false,
      openActiveIngredientFilter: false,
      openUpdateDateFilter: false,
      openTypeOfRouteFilter: false,
    };

    this.OpenSuggestionBox = {
      company_name: false,
      route_type: false,
      field_of_application: false,
      order_by: false,
      active_ingredient: false,
      updation_date: false,
      types_of_route: false,
    };
  }
}

  fetchFilters() {
    this._currentAPIData.body.filter_enable = true;
    this.ServiceResultTabFiltersService.getFilterOptions(
      this._currentAPIData
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
        this._currentAPIData.body.filter_enable = false;
      },
      error: (e) => console.error(e),
    });
  }
  capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }


  OnBlur(key: string): void {
    setTimeout(() => {
      if (!document.activeElement?.closest('.filter-dropdown')) {
        this.filterMap[`open${this.capitalizeFirstLetter(key)}Filter`] = false;
      }
    }, 150);
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
  handleRemovefilterElement(filter: any, index: any) {
    let ExtraValue = this.FilterValues[filter];
    ExtraValue.splice(index, 1);
    this.FilterValues[filter] = ExtraValue;
  }

  handleReset() {
    this.setLoading.emit(true);
    let body = this._currentAPIData.body;
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
    this._currentAPIData.body = body;
    this._currentAPIData.body.page_no = 1;
    this.ServiceResultTabFiltersService.getFilterOptions(
      this._currentAPIData
    ).subscribe({
      next: (res) => {
        this.handleChangeTabData.emit(res?.data);
        this.setLoading.emit(false);
        this.resetPagination.emit(true);
      },
      error: (e) => {
        console.error(e);
        this.setLoading.emit(false);
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

  removeEmptyArrays(obj: any) {
    for (let key in obj) {
      if (Array.isArray(obj[key]) && obj[key].length === 0) {
        delete obj[key];
      }
    }
    return obj;
  }

  handleSearchFilterResults() {
    this.setLoading.emit(true);

    const body = this._currentAPIData.body;
    body.page_no = 1;
    body.filter_enable = false;

    // Set order_by separately
    body.order_by = this.FilterValues.order_by[0] || '';

    // Populate filters
    const filters: any = {};
    for (const key in this.FilterValues) {
      if (key !== 'order_by' && this.FilterValues[key].length > 0) {
        filters[key] = this.FilterValues[key];
      }
    }
    body.filters = this.removeEmptyArrays(filters);

    // Call API
    this.ServiceResultTabFiltersService.getFilterOptions(this._currentAPIData).subscribe({
      next: (res) => {
        this.handleChangeTabData.emit(res?.data);
        this.setLoading.emit(false);
        this.resetPagination.emit(true);
      },
      error: (e) => {
        console.error(e);
        this.setLoading.emit(false);
      },
    });
  }
  extractBaseCompanyName(fullName: string): string {
  // Remove suffix like " - Branch 1", " - HQ", etc.
  return fullName.split(' ')[0].trim().toLowerCase();
}

  updateChildFilterData(): void {
    // ✅ Example: Call API again with updated filters
    this.childFilterEvent.emit(this.FilterValues); // or however you're passing filters to parent

    // OR if you fetch data directly here
    // this.getFilteredDataFromAPI(); 
  }
  handleCheckFilter(key: string, selectedName: string): void {
    const allOptions = this[`${key}_filters`] || [];

    // Extract base name (e.g., remove "- Branch" part, or split on " - ")
    const baseName = selectedName.split(' - ')[0].trim();

    // Get all matching entries
    const matchingNames = allOptions
      .filter(option => option.name.startsWith(baseName))
      .map(option => option.value);

    // Check if already selected
    const allSelected = matchingNames.every(value =>
      this.FilterValues[key].includes(value)
    );

    if (allSelected) {
      // If already selected, remove all
      this.FilterValues[key] = this.FilterValues[key].filter(
        value => !matchingNames.includes(value)
      );
    } else {
      // Otherwise, add all missing matches
      matchingNames.forEach(value => {
        if (!this.FilterValues[key].includes(value)) {
          this.FilterValues[key].push(value);
        }
      });
    }

    this.updateChildFilterData(); // Optional: apply the filter immediately
  }


  emitCombinedFilters(): void {
    this.childFilteredData.emit(this.FilterValues);
  }


  handleSelectFilter(key: string, value: string) {
    this.setLoading.emit(true);
    const body = this._currentAPIData.body;
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
    body.page_no = 1;
    this._currentAPIData.body = body;

    this.ServiceResultTabFiltersService.getFilterOptions(
      this._currentAPIData
    ).subscribe({
      next: (res) => {
        this.handleChangeTabData.emit(res?.data);
        this.setLoading.emit(false);
      },
      error: (e) => {
        console.error(e);
        this.setLoading.emit(false);
      },
    });
  }

  toogleFilter() {
    this.showFilter = !this.showFilter;
  }

  getUpdationDate(data: any) {
    const date = new Date(data);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  OpenQueryModal() {
    const dialogRef = this.dialog.open(Chem_Robotics_QueryModalComponent, {
      width: '450px',
      height: '500px',
      panelClass: 'full-screen-modal',
    });
  }
}
