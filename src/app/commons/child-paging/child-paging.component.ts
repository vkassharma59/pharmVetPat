import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceChildPaginationService } from '../../services/child-pagination/service-child-pagination.service';

@Component({
  selector: 'app-child-paging-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './child-paging-table.component.html',
  styleUrls: ['./child-paging-table.component.css'], // ✅ Plural and spelled correctly
})

export class ChildPagingTableComponent implements OnInit, OnChanges {
  @Input() childPaginationData: any;
  @Output() handleChangeTabData: EventEmitter<any> = new EventEmitter<any>();
  @Output() setLoading: EventEmitter<any> = new EventEmitter<any>();

  @Input() currentChildAPIBody: any;

  MainPageNo = 1;
  PageArray: number[] = [];
  count: number = 0;

  blurContent: boolean = false;
  showAccessDeniedModal: boolean = false;
  reportLimitPages: number = 10;

  constructor(private serviceChildPaginationService: ServiceChildPaginationService) {}

  ngOnInit(): void {
    const priv = JSON.parse(localStorage.getItem('priviledge_json') || '{}');
    this.reportLimitPages = priv['pharmvetpat-mongodb']?.PageLimit || 10;
    console.log('Allowed pages based on report limit:', this.reportLimitPages);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentChildAPIBody']) {
      this.updatePagination();
    }
  }

  updatePagination() {
    this.PageArray = [];
    this.count = this.currentChildAPIBody?.count || 0;

    const totalPages = Math.ceil(this.count / 25);
    const startPage = Math.floor((this.MainPageNo - 1) / 5) * 5 + 1;

    for (let i = startPage; i <= Math.min(startPage + 4, totalPages); i++) {
      this.PageArray.push(i);
    }
  }

  handlePageClick(page: number) {
    if (page > this.reportLimitPages) {
      this.showAccessDeniedModal = true;
      this.blurContent = true;
      return;
    }

    this.setLoading.emit(true);
    this.currentChildAPIBody.page_no = page;
    this.MainPageNo = page;

    this.serviceChildPaginationService.getNextChildPaginationData(
      this.currentChildAPIBody
    ).subscribe({
      next: (res) => {
        this.handleChangeTabData.emit(res?.data);
        this.setLoading.emit(false);
        this.updatePagination();
      },
      error: (e) => {
        console.error(e);
        this.setLoading.emit(false);
      },
    });
  }

  handleFirstClick() {
    this.MainPageNo = 1;
    this.updatePagination();
    this.handlePageClick(this.MainPageNo);
  }

  handleLastClick() {
    const totalPages = Math.ceil(this.count / 25);
    this.MainPageNo = totalPages;
    this.updatePagination();
    this.handlePageClick(this.MainPageNo);
  }

  handleNextClick() {
    const totalPages = Math.ceil(this.count / 25);
    const nextStart = this.PageArray[this.PageArray.length - 1] + 1;

    if (nextStart > totalPages) return;

    this.MainPageNo = nextStart;
    this.updatePagination();
    this.handlePageClick(this.MainPageNo);
  }

  handlePreviousClick() {
    const prevStart = this.PageArray[0] - 5;
    if (prevStart < 1) return;

    this.MainPageNo = prevStart;
    this.updatePagination();
    this.handlePageClick(this.MainPageNo);
  }

  closeAccessDeniedModal() {
    this.showAccessDeniedModal = false;
    this.blurContent = false;
  }
}
