import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ServiceChildPaginationService } from '../../services/child-pagination/service-child-pagination.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-child-paging',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './child-paging.component.html',
  styleUrl: './child-paging.component.css',
})

export class ChildPagingComponent {
  _currentChildAPIBody: any;
  @Input() childPaginationData: any;
  @Output() handleChangeTabData: EventEmitter<any> = new EventEmitter<any>();
  @Output() setLoading: EventEmitter<any> = new EventEmitter<any>();
  MainPageNo = 1;
  PageArray = [1, 2, 3, 4, 5];
  count: any = 0;

  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    console.log("🔄 currentChildAPIBody set to:", value); // Log here

    this._currentChildAPIBody = value;
    this.PageArray = [];
    this.count = 0;


    if (this._currentChildAPIBody?.count) {
      console.log("🔄 current:", this.count = this._currentChildAPIBody?.count); // Log here
      this.count = this._currentChildAPIBody?.count;
    }

    for (let i = 1; i <= Math.min(Math.ceil(this.count / 25), 5); i++) {
      this.PageArray.push(i);
    }
  }

  constructor(
    private serviceChildPaginationService: ServiceChildPaginationService
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

  handleNextclick = () => {
    const remain = Math.ceil((this.count - this.PageArray[4] * 25) / 25);
    const count = Math.ceil(this.count / 25);
    if (this.PageArray[this.PageArray.length - 1] == count) return;
    this.MainPageNo = this.PageArray[4] + 1;

    this.PageArray = [];

    for (
      let i = this.MainPageNo;
      i < Math.min(this.MainPageNo + 5, this.MainPageNo + remain);
      i++
    ) {
      this.PageArray.push(i);
    }
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

  // handlePageClick = (page: number) => {
  //   this.setLoading.emit(true);
  //   this._currentChildAPIBody.page_no = page;
  //   this.MainPageNo = page;
  //   this.serviceChildPaginationService.getNextChildPaginationData(
  //     this._currentChildAPIBody
  //   ).subscribe({
  //     next: (res) => {
  //       this.handleChangeTabData.emit(res?.data);
  //       console.log("body uri-------------------- resposne ",res.data)
  //       this.setLoading.emit(false);
  //     },
  //     error: (e) => {
  //       console.error(e);
  //       this.setLoading.emit(false);
  //     },
  //   });
  // };
  handlePageClick = (page: number) => {
    this.setLoading.emit(true);
    this._currentChildAPIBody.page_no = page;
    // Set dynamic 'start' based on (page_no - 1) * length
    const pageSize = this._currentChildAPIBody.length || 25; // fallback 25
    this._currentChildAPIBody.start = (page - 1) * pageSize;
    this.MainPageNo = page;
    // console.log("📦 Request Body before API Call:", this._currentChildAPIBody);
    this.serviceChildPaginationService.getNextChildPaginationData(
      this._currentChildAPIBody
    ).subscribe({
      next: (res) => {
        console.log("✅ API Response:", res?.data);
        this._currentChildAPIBody.count = res?.data?.recordsFiltered ?? res?.data?.recordsTotal;
        console.log("📤 Emitting handleChangeTabData with:", res?.data);
          this.handleChangeTabData.emit(this._currentChildAPIBody);

        // this.handleChangeTabData.emit(this._currentChildAPIBody);
        //   if (res?.count) {
        //   this.count = res.count;
        // }

        this.setLoading.emit(false);
      },
      error: (e) => {
        console.error("❌ API Error:000000000000000000", e);
        this.setLoading.emit(false);
      },
    });
  };

  handleChangeData() {
    this.PageArray = [];
    if (this._currentChildAPIBody?.count) {
      this.count = this._currentChildAPIBody?.count;
    }

    this.PageArray = [];
    const pageCount = Math.ceil(this.count / 25);
    const currentPageindex = this._currentChildAPIBody?.page_no;
    const PageSetStartIndex = currentPageindex % 5;

    const startIndex =
      PageSetStartIndex != 0
        ? currentPageindex - PageSetStartIndex + 1
        : currentPageindex - 4;

    for (let i = startIndex; i <= Math.min(pageCount, startIndex + 4); i++) {
      this.PageArray.push(i);
    }
  }

  ngOnChanges(): void {
    console.log("🛠 ngOnChangescalled, currentChildAPIBody:", this._currentChildAPIBody);
    this.handleChangeData();
  }
}
