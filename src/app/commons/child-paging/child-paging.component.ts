import { Component, EventEmitter, Input, Output,ChangeDetectorRef, OnInit } from '@angular/core';
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

export class ChildPagingComponent implements OnInit{
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
    this._currentChildAPIBody = value;
    this.PageArray = [];
    this.count = 0;


    if (this._currentChildAPIBody?.count) {
      this.count = this._currentChildAPIBody?.count;
    }

    for (let i = 1; i <= Math.min(Math.ceil(this.count / 25), 5); i++) {
      this.PageArray.push(i);
    }
  }

  constructor(
    private serviceChildPaginationService: ServiceChildPaginationService,private cdr: ChangeDetectorRef,
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

  handlePageClick = (page: number) => {
    if (page > this.reportLimitPages) {
      this.showAccessDeniedModal = true;
      this.blurContent = true;
      return;
    }
  
    this.setLoading.emit(true);
    this._currentChildAPIBody.page_no = page;
    this.MainPageNo = page;
  
    this.serviceChildPaginationService.getNextChildPaginationData(
      this._currentChildAPIBody
    ).subscribe({
      next: (res) => {
        this.handleChangeData();
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
  
  getAllDataFromApi(): Observable<any[]> {
    const priv = JSON.parse(localStorage.getItem('priviledge_json') || '{}');
    const reportLimit = priv['pharmvetpat-mongodb']?.PageLimit ||10;
  
    const requestBody = {
      ...this._currentChildAPIBody,
      page_no: 1,
      start: 0,
      length: reportLimit,
    };
  
    console.log('📦  request body:', requestBody);
  
    return this.mainSearchService.spcdbSearchSpecific(requestBody).pipe(
      tap((response: any) => {
        console.log('📦 Full API response:', response);
      }),
      map((response: any) => {
        return response?.data?.data || [];
      }),
      catchError((error) => {
        console.error('❌ Error fetching all data:', error);
        return of([]); // fallback to empty array on error
      })
    );
  }
  

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
  ngOnInit(): void {
    const priv = JSON.parse(localStorage.getItem('priviledge_json') || '{}');
    const reportLimit = priv['pharmvetpat-mongodb']?.PageLimit || 10;
  
    // 👇 This is critical: how many pages user is allowed to access
   this.reportLimitPages = reportLimit;

  
    console.log("Allowed pages based on report limit:", this.reportLimitPages);
  }
  
  
  ngOnChanges(): void {
    this.handleChangeData();
  }
}