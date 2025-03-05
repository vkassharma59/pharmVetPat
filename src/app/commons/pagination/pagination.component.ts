import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ServicePaginationService } from '../../services/pagination/service-pagination.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'chem-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent {
  @Output() showDataResultFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() setLoading: EventEmitter<any> = new EventEmitter<any>();
  @Input() CurrentAPIBody: any;
  @Input() MainDataResultShow: any;
  @Input() paginationRerenderTrigger: any;
  totalPageNumbers: any;
  MainPageNo = 1;
  PageArray = [1, 2, 3, 4, 5];

  ResultDataCount = 0;

  handleFirstClick = () => {
    const pageCount = Math.ceil(this.ResultDataCount / 25);
    this.PageArray = [];
    for (let i = 1; i <= Math.min(5, pageCount); i++) {
      this.PageArray.push(i);
    }

    this.MainPageNo = 1;
    this.handlePageClick(this.MainPageNo);
  };

  handleLastClick = () => {
    const pageCount = Math.ceil(this.ResultDataCount / 25);
    this.PageArray = [];
    for (let i = Math.max(1, pageCount - 4); i <= pageCount; i++) {
      this.PageArray.push(i);
    }

    this.MainPageNo = pageCount;
    this.handlePageClick(this.MainPageNo);
  };

  handleNextclick = () => {
    const remain = Math.ceil(
      (this.ResultDataCount - this.PageArray[4] * 25) / 25
    );
    const count = Math.ceil(this.ResultDataCount / 25);
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
    if (this.PageArray[0] == 1) return;
    this.MainPageNo = this.PageArray[0] - 1;
    this.PageArray = [];
    for (let i = this.MainPageNo - 4; i <= this.MainPageNo; i++) {
      this.PageArray.push(i);
    }
    this.handlePageClick(this.MainPageNo);
  };

  handleChangeDataValues() {
    if (
      this.CurrentAPIBody?.currentTab == 'active_ingredient' ||
      this.CurrentAPIBody?.currentTab == 'intermediate_synthesis'
    ) {
      this.ResultDataCount = this.MainDataResultShow?.ros_count;
    } else {
      this.ResultDataCount = this.MainDataResultShow?.chem_dir_count;
    }
    this.PageArray = [];
    const pageCount = Math.ceil(this.ResultDataCount / 25);
    const currentPageindex = this.CurrentAPIBody?.body?.page_no;
    const PageSetStartIndex = currentPageindex % 5;

    const startIndex =
      PageSetStartIndex != 0
        ? currentPageindex - PageSetStartIndex + 1
        : currentPageindex - 4;
    for (let i = startIndex; i <= Math.min(pageCount, startIndex + 4); i++) {
      this.PageArray.push(i);
    }

    this.totalPageNumbers = pageCount;
    // console.log(this.PageArray, this.CurrentAPIBody, this.MainDataResultShow);
  }

  ngOnInit(): void {
    if (
      this.CurrentAPIBody?.currentTab == 'active_ingredient' ||
      this.CurrentAPIBody?.currentTab == 'intermediate_synthesis'
    ) {
      this.ResultDataCount = this.MainDataResultShow?.ros_count;
    } else {
      this.ResultDataCount = this.MainDataResultShow?.chem_dir_count;
    }
    this.PageArray = [];
    for (
      let i = 1;
      i <= Math.min(Math.ceil(this.ResultDataCount / 25), 5);
      i++
    ) {
      this.PageArray.push(i);
    }

    this.totalPageNumbers = this.ResultDataCount;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['paginationRerenderTrigger']) {
      // console.log(
      //   'Data changed:',
      //   changes['paginationRerenderTrigger'].currentValue
      // );
    }
    this.handleChangeDataValues();
  }
  constructor(
    private http: HttpClient,
    private ServicePaginationService: ServicePaginationService
  ) {}

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'api-key': environment.headerApiKey,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  });

  handlePageClick = (page: number) => {
    this.setLoading.emit(true);
    this.CurrentAPIBody.body.page_no = page;
    this.MainPageNo = page;
    // console.log(this.CurrentAPIBody);

    this.ServicePaginationService.getNextPaginationData(
      this.CurrentAPIBody
    ).subscribe({
      next: (res) => {
        this.showDataResultFunction.emit(res?.data);
        this.setLoading.emit(false);
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
      },
      error: (e) => {
        console.error(e);
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
        this.setLoading.emit(false);
      },
    });
  };
}
