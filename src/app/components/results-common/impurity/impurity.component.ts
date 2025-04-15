import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImpurityCardComponent } from '../impurity-card/impurity-card.component';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';

@Component({
  selector: 'chem-impurity',
  standalone: true,
  imports: [CommonModule, ImpurityCardComponent, ChildPagingComponent],
  templateUrl: './impurity.component.html',
  styleUrl: './impurity.component.css'
})

export class ImpurityComponent {
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();

  resultTabs: any = {};
  isOpen: boolean = false;
  _data: any = [];
  _currentChildAPIBody: any = {};
  ImpurityBody: any;
  category_filters: any;
  category_value: any = 'Select Category';

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
    this.ImpurityBody = JSON.parse(JSON.stringify(this._currentChildAPIBody)) || this._currentChildAPIBody;
    this.handleFetchFilters();
  }

  constructor(
     private utilityService: UtilityService,
     private mainSearchService: MainSearchService) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }
  productInfo(){
    console.log("clicked");
  }
  handleFetchFilters() {
    this.ImpurityBody.filter_enable = true;
    this.mainSearchService.impuritySearchSpecific(
      this.ImpurityBody
    ).subscribe({
      next: (res) => {
        this.category_filters = res?.data?.category;
        this.ImpurityBody.filter_enable = false;
      },
      error: (err) => {
        console.error(err);
        this.ImpurityBody.filter_enable = false;
      },
    });
  }
  handleFilter(){
    this.isOpen=!this.isOpen;
    console.log(this.isOpen);
  }
  handleSelectFilter(value: string) {
    console.log("clicked");
    this.handleSetLoading.emit(true);
    if (value === '') {
      delete this.ImpurityBody.filters['category'];
      this.category_value = 'Select Category';
    } else {
      this.ImpurityBody.filters['category'] = value;
      this.category_value = value;
    }

    this._currentChildAPIBody.body = this.ImpurityBody;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.impuritySearchSpecific(
      this._currentChildAPIBody?.body
    ).subscribe({
      next: (res) => {
        this.handleResultTabData.emit(res.data);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: (err) => {
        console.error(err);
        this.handleSetLoading.emit(false);
        this._currentChildAPIBody.body.filter_enable = false;
        window.scrollTo(0, scrollTop);
      },
    });
  }
  // handleFilter() {
  //   this.isOpen = !this.isOpen;
  //   console.log('Dropdown toggled:', this.isOpen);
  // }

  // handleSelectFilter(value: string) {
  //   this.isOpen = false;
  //   if (value === '') {
  //     this.category_value = 'Select Category';
  //   } else {
  //     this.category_value = value;
  //   }
  //   console.log('Selected:', value);
  // }
}
