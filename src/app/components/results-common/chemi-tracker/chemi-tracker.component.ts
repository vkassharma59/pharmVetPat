import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { ChemiTrackerCardComponent } from '../chemi-tracker-card/chemi-tracker-card.component';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { TruncatePipe } from '../../../pipes/truncate.pipe';
import { Auth_operations } from '../../../Utils/SetToken';
import { ViewChild, ElementRef } from '@angular/core';
import { LoadingService } from '../../../services/loading-service/loading.service';

@Component({
  selector: 'chem-chemi-tracker',
  standalone: true,
  imports: [TruncatePipe, ChemiTrackerCardComponent, CommonModule, ChildPagingComponent],
  templateUrl: './chemi-tracker.component.html',
  styleUrl: './chemi-tracker.component.css'
})
export class ChemiTrackerComponent {

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();

  resultTabs: any = {};
  _data: any = [];
  country_value: any = 'Select Country';
  _currentChildAPIBody: any = {};
  chemiAPIBody: any;
  formulation_value: any = 'Select TECH.API & FORMULATION';
  countryFilters: any = [];
  foundationsFilters: any = [];
  isCountryDropdownOpen: boolean = false;
  isOpen: boolean = false;
  searchThrough: string = '';

  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }

  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    if (value) {
      this.chemiAPIBody = JSON.parse(JSON.stringify(value)) || value;
      this.handleFetchFilters();
    }
  }

  @Input() index: any;
  @Input() tabName?: string;

  @ViewChild('countryDropdownRef') countryDropdownRef!: ElementRef;
  @ViewChild('formulationDropdownRef') formulationDropdownRef!: ElementRef;

  constructor(
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService,
    public loadingService: LoadingService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;

  }
  toggleCountryDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
    this.isOpen = false; // close other dropdown
  }

  toggleFormulationDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    this.isCountryDropdownOpen = false; // close other dropdown
  }
  handleFetchFilters() {
    this.chemiAPIBody.filter_enable = true;
    this.mainSearchService.chemiTrackerSearchSpecific(this.chemiAPIBody).subscribe({
      next: (res) => {
        console.log('🔍 Formulation Filter Values (dummy_6):', res?.data?.dummy_6);
        this.countryFilters = res?.data?.country_of_company;
        this.foundationsFilters = res?.data?.dummy_6;
        this.chemiAPIBody.filter_enable = false;
      },
      error: (err) => {
        console.error(err);
        this.chemiAPIBody.filter_enable = false;
      },
    });
  }
  handleFilter() {
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
  }
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      this.countryDropdownRef &&
      !this.countryDropdownRef.nativeElement.contains(target)
    ) {
      this.isCountryDropdownOpen = false;
    }
    if (
      this.formulationDropdownRef &&
      !this.formulationDropdownRef.nativeElement.contains(target)
    ) {
      this.isOpen = false;
    }
  }
  dropdown() {
    this.isOpen = !this.isOpen;
  }

  handleSelectFilter(filter: any, value: any) {
    this.isCountryDropdownOpen = false;
    this.isOpen = false;

    this.handleSetLoading.emit(true);
    if (value == '') {
      if (filter == 'country_of_company') {
        delete this.chemiAPIBody.filters['country_of_company'];
        this.country_value = 'Select Country';
      } else {
        delete this.chemiAPIBody.filters['dummy_6'];
        this.formulation_value = 'Select TECH.API & FORMULATION';
      }
    } else {
      if (filter == 'country_of_company') {
        this.chemiAPIBody.filters['country_of_company'] = value;
        this.country_value = value;
      } else {
        this.chemiAPIBody.filters['dummy_6'] = value;
        this.formulation_value = value;
      }
    }

    this._currentChildAPIBody = {
      ...this.chemiAPIBody,
      filters: { ...this.chemiAPIBody.filters }
    };
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.chemiTrackerSearchSpecific(
      this._currentChildAPIBody
    ).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.chemi_tracker_count
        };

        this.handleResultTabData.emit(res.data);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: (err) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          filter_enable: false
        };
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
    });
  }
  clear() {
    // Reset dropdown labels
    this.country_value = 'Select Country';
    this.formulation_value = 'Select TECH.API & FORMULATION';

    // Close dropdowns
    this.isCountryDropdownOpen = false;
    this.isOpen = false;

    // Clear filters
    this.chemiAPIBody.filters = {};

    // Prepare new API body
    this._currentChildAPIBody = {
      ...this.chemiAPIBody,
      filters: {}
    };

    // Emit loading state
    this.handleSetLoading.emit(true);

    // Call API with cleared filters
    this.mainSearchService.chemiTrackerSearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.chemi_tracker_count
        };
        this.handleResultTabData.emit(res.data);
        this.handleSetLoading.emit(false);
      },
      error: (err) => {
        console.error(err);
        this._currentChildAPIBody.filter_enable = false;
        this.handleSetLoading.emit(false);
      },
    });


    // Scroll to top


    window.scrollTo(0, 0);

    this.handleSelectFilter;
  }


}

