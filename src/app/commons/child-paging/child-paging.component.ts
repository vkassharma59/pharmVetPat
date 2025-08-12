import { Component, EventEmitter, Input, Output, ChangeDetectorRef, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ServiceChildPaginationService } from '../../services/child-pagination/service-child-pagination.service';
import { CommonModule } from '@angular/common';
import { MainSearchService } from '../../services/main-search/main-search.service';

@Component({
  selector: 'app-child-paging',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './child-paging.component.html',
  styleUrl: './child-paging.component.css',
})

export class ChildPagingComponent implements OnInit {
  _currentChildAPIBody: any;
  @Input() childPaginationData: any;
  @Output() handleChangeTabData: EventEmitter<any> = new EventEmitter<any>();
  @Output() setLoading: EventEmitter<any> = new EventEmitter<any>();
  MainPageNo = 1;
  PageArray = [1, 2, 3, 4, 5];
  count: any = 0;
  blurContent: boolean = false;
  showAccessDeniedModal: boolean = false;
  reportLimitPages: number = 10;
  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    console.log("childodyApi000000000000", value)
    this._currentChildAPIBody = value;
    this.PageArray = [];

    // ✅ Defensive: use 0 if invalid
    const incomingCount = Number(value?.count);
    this.count = !isNaN(incomingCount) && incomingCount > 0 ? incomingCount : 0;

    const pageCount = Math.ceil(this.count / 25);
    for (let i = 1; i <= Math.min(pageCount, 5); i++) {
      this.PageArray.push(i);
    }
  }
  constructor(
    private serviceChildPaginationService: ServiceChildPaginationService, private cdr: ChangeDetectorRef,
    private mainSearchService: MainSearchService
  ) { }

  handleFirstClick = () => {
    const pageCount = Math.ceil(this.count / 25);
    this.PageArray = [];
    for (let i = 1; i <= Math.min(5, pageCount); i++) {
      this.PageArray.push(i);
    }

    this.MainPageNo = 1;
    this.handlePageClick(this.MainPageNo);
  };

  handleLastClick = () => {
    const pageCount = Math.ceil(this.count / 25);
    this.PageArray = [];
    for (let i = Math.max(1, pageCount - 4); i <= pageCount; i++) {
      this.PageArray.push(i);
    }

    this.MainPageNo = pageCount;
    this.handlePageClick(this.MainPageNo);
  };

  // handleNextclick = () => {
  //   console.log('➡️ handleNextclick triggered');
  
  //   const count = Math.ceil(this.count / 25); // total pages
  //   const currentLastPage = this.PageArray[this.PageArray.length - 1] ?? 0;
  
  //   console.log('📦 Total Count:', this.count);
  //   console.log('📄 Total Pages:', count);
  //   console.log('📑 Current PageArray:', this.PageArray);
  //   console.log('📍 Current Last Page:', currentLastPage);
  
  //   if (currentLastPage >= count) {
  //     console.log('⛔ Already at last page, no action needed');
  //     return;
  //   }
  
  //   this.MainPageNo = currentLastPage + 1;
  
  //   const remain = count - currentLastPage;
  //   console.log('🔢 Remaining pages:', remain);
  
  //   this.PageArray = [];
  
  //   for (
  //     let i = this.MainPageNo;
  //     i < Math.min(this.MainPageNo + 5, this.MainPageNo + remain);
  //     i++
  //   ) {
  //     this.PageArray.push(i);
  //   }
  
  //   console.log('✅ Updated PageArray:', this.PageArray);
  
  //   this.handlePageClick(this.MainPageNo);
  // };
  handleNextclick = () => {
  const totalPages = Math.ceil(this.count / 25);

  // 🚫 Already at last page
  if (this.MainPageNo >= totalPages) {
    return;
  }

  // ✅ Move to next page
  this.MainPageNo++;

  const firstPageInArray = this.PageArray[0];
  const lastPageInArray = this.PageArray[this.PageArray.length - 1];

  // 🔄 Shift PageArray window only if MainPageNo goes beyond current last page
  if (this.MainPageNo > lastPageInArray) {
    this.PageArray = [];
    const startPage = Math.min(this.MainPageNo, totalPages - 4);
    for (let i = startPage; i <= Math.min(startPage + 4, totalPages); i++) {
      this.PageArray.push(i);
    }
  }

  // 🔄 Call API for new page
  this.handlePageClick(this.MainPageNo);
};

  

  handlePreviousClick = () => {
    if (this.MainPageNo == 1) return;
    this.MainPageNo = this.MainPageNo - 1;
    this.PageArray = [];
    for (let i = this.MainPageNo - 4; i <= this.MainPageNo; i++) {
      this.PageArray.push(i);
    }
    this.handlePageClick(this.MainPageNo);
  };

  handlePageClick = (page: number) => {
    if (page > this.reportLimitPages) {
      this.showAccessDeniedModal = true;
      this.blurContent = true;
      return;
    }

    this.setLoading.emit(true);
    this._currentChildAPIBody.page_no = page;
    this.MainPageNo = page;
    console.log("Current Child API Body:", this._currentChildAPIBody);
    this.serviceChildPaginationService.getNextChildPaginationData(
      this._currentChildAPIBody
    ).subscribe({
      next: (res) => {
        this.handleChangeData();
        console.log("Child Paging Data:", res?.data);
        this.handleChangeTabData.emit(res?.data);
        this.setLoading.emit(false);
      },
      error: (e) => {
        console.error(e);
        this.setLoading.emit(false);
      },
    });
  };

  closeAccessDeniedModal() {
    this.showAccessDeniedModal = false;
    this.blurContent = false;
  }


  handleChangeData() {
    this.PageArray = [];

    const validCount = Number(this._currentChildAPIBody?.count);
    this.count = !isNaN(validCount) && validCount > 0 ? validCount : 0;

    const pageCount = Math.ceil(this.count / 25);
    const currentPageindex = this._currentChildAPIBody?.page_no || 1;
    const pageSetStartIndex = (currentPageindex - 1) - ((currentPageindex - 1) % 5) + 1;

    for (let i = pageSetStartIndex; i <= Math.min(pageCount, pageSetStartIndex + 4); i++) {
      this.PageArray.push(i);
    }
  }

  ngOnInit(): void {
    const priv = JSON.parse(localStorage.getItem('priviledge_json') || '{}');
    const reportLimit = priv['pharmvetpat-mongodb']?.PageLimit || 10;
    this.reportLimitPages = reportLimit;


    console.log("Allowed pages based on report limit:", this.reportLimitPages);
  }


  ngOnChanges(): void {
    this.handleChangeData();
  }
}