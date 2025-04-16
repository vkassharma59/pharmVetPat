import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChemiTrackerCardComponent } from '../chemi-tracker-card/chemi-tracker-card.component';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { MainSearchService } from '../../../services/main-search/main-search.service';

@Component({
  selector: 'chem-chemi-tracker',
  standalone: true,
  imports: [ChemiTrackerCardComponent, CommonModule, ChildPagingComponent],
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
  DMFAPIBody: any;
  formulation_value: any = 'Select TECH.API & FORMULATION';
  countryFilters: any = [];
  foundationsFilters: any = [];
  isCountryDropdownOpen:boolean=false;
  isOpen:boolean=false;

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
    this.DMFAPIBody = JSON.parse(JSON.stringify(value)) || value;
    this.handleFetchFilters();
  }

  constructor(
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }

  handleFetchFilters() {
    this.DMFAPIBody.filter_enable = true;
    this.mainSearchService.chemiTrackerSearchSpecific(this.DMFAPIBody).subscribe({
      next: (res) => {
        this.countryFilters = res?.data?.country_of_company;
        this.foundationsFilters = res?.data?.dummy_6;
        this.DMFAPIBody.filter_enable = false;
      },
      error: (err) => {
        console.error(err);
        this.DMFAPIBody.filter_enable = false;
      },
    });
  }
  handleFilter(){
    this.isCountryDropdownOpen=!this.isCountryDropdownOpen;
  }
  dropdown(){
    this.isOpen=!this.isOpen;
  }

  handleSelectFilter(filter: any, value: any) {
    this.isCountryDropdownOpen = false;
    this.isOpen= false;

    this.handleSetLoading.emit(true);
    if (value == '') {
      if (filter == 'country_of_company') {
        delete this.DMFAPIBody.filters['country_of_company'];
        this.country_value = 'Select Country';        
      } else {
        delete this.DMFAPIBody.filters['dummy_6'];
        this.formulation_value = 'Select Country';
      }
    } else {
      if (filter == 'country_of_company') {
        this.DMFAPIBody.filters['country_of_company'] = value;
        this.country_value = value;        
      } else {
        this.DMFAPIBody.filters['dummy_6'] = value;
        this.formulation_value = value;
      }
    }

    this._currentChildAPIBody = {
      ...this.DMFAPIBody,
      filters: { ...this.DMFAPIBody.filters }
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
}
