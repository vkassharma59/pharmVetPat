import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ImpurityCardComponent } from '../impurity-card/impurity-card.component';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { Auth_operations } from '../../../Utils/SetToken';

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

  @ViewChild('dropdownMenu') dropdownMenuRef!: ElementRef;

  searchThrough: string = '';
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
    if (value) {
      this.ImpurityBody = JSON.parse(JSON.stringify(this._currentChildAPIBody)) || this._currentChildAPIBody;
      this.handleFetchFilters();
    }
  }

  constructor(
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const clickedInside = this.dropdownMenuRef?.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isOpen = false;
    }
  }

  handleFilter() {
    this.isOpen = !this.isOpen;
  }

  clear() {
    this.handleSetLoading.emit(true);
    this.category_value = 'Select Category';
    this.isOpen = false;

    if (this.ImpurityBody.filters?.category) {
      delete this.ImpurityBody.filters['category'];
    }

    this._currentChildAPIBody = {
      ...this.ImpurityBody,
      filters: { ...this.ImpurityBody.filters }
    };

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.impuritySearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.impurity_count
        };
        this.handleResultTabData.emit(res.data);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: (err) => {
        console.error(err);
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          filter_enable: false
        };
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
    });
  }

  handleSelectFilter(value: string) {
    this.isOpen = false;
    this.handleSetLoading.emit(true);

    if (value === '') {
      delete this.ImpurityBody.filters['category'];
      this.category_value = 'Select Category';
    } else {
      this.ImpurityBody.filters['category'] = value;
      this.category_value = value;
    }

    this._currentChildAPIBody = {
      ...this.ImpurityBody,
      filters: { ...this.ImpurityBody.filters }
    };

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.mainSearchService.impuritySearchSpecific(this._currentChildAPIBody).subscribe({
      next: (res) => {
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          count: res?.data?.impurity_count
        };
        this.handleResultTabData.emit(res.data);
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
      error: (err) => {
        console.error(err);
        this._currentChildAPIBody = {
          ...this._currentChildAPIBody,
          filter_enable: false
        };
        this.handleSetLoading.emit(false);
        window.scrollTo(0, scrollTop);
      },
    });
  }

  handleFetchFilters() {
    this.ImpurityBody.filter_enable = true;
    this.mainSearchService.impuritySearchSpecific(this.ImpurityBody).subscribe({
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
}
