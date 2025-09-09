import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  NgModule
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceChildPaginationService } from '../../services/child-pagination/service-child-pagination.service';
// Optional: Define interface for cleaner code
interface ChildAPIBody {
  page_no: number;
  start: number;
  length: number;
  count?: number;
  [key: string]: any;
}

@Component({
  selector: 'app-child-pagning-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './child-pagning-table.component.html',
  styleUrls: ['./child-pagning-table.component.css'] // ✅ Fixed typo
})
export class ChildPagningTableComponent implements OnChanges {
  private _currentChildAPIBody!: ChildAPIBody;

  @Input() childPaginationData: any;
  @Input() isFilterApplied: boolean = false;

  @Output() handleChangeTabData: EventEmitter<any> = new EventEmitter<any>();
  @Output() setLoading: EventEmitter<any> = new EventEmitter<any>();

  MainPageNo = 1;
  PageArray: number[] = [];
  count: number = 0;
  blurContent: boolean = false;
  showAccessDeniedModal: boolean = false;
  reportLimitPages: number = 10;

  @Input()
  get currentChildAPIBody(): ChildAPIBody {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: ChildAPIBody) {
    console.log("childodyApi", value)
    this._currentChildAPIBody = value;
    this.count = value?.count || 0;
    this.updateInitialPageArray();
  }

  constructor(
    private serviceChildPaginationService: ServiceChildPaginationService
  ) { }

  get pageSize(): number {
    return this._currentChildAPIBody?.length || 25;
  }

  get totalPages(): number {
    return Math.ceil(this.count / this.pageSize);
  }

  updateInitialPageArray() {
    this.PageArray = [];
    const total = this.totalPages;
    for (let i = 1; i <= Math.min(total, 5); i++) {
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

  previousAPIBody: any = null; // Add this to your component to track previous request

  ngOnChanges(changes: SimpleChanges): void {
 console.log('isFilterApplied:', this.isFilterApplied);
    const currentBody = this.currentChildAPIBody;
    const hasBodyChanged = JSON.stringify(currentBody) !== JSON.stringify(this.previousAPIBody);

    if (
      (changes['currentChildAPIBody'] && hasBodyChanged) || changes['isFilterApplied']?.currentValue !== undefined
      
    ) {
      if (this.isFilterApplied) {
        if (hasBodyChanged && currentBody.page_no === 1) {
          this.MainPageNo = 1;
          this._currentChildAPIBody = {
            ...currentBody,
            page_no: 1,
            start: 0
          };
        } else {
          this._currentChildAPIBody = { ...currentBody };
          this.MainPageNo = currentBody.page_no || 1; // ✅ Don't reset to 1
        }

        this.previousAPIBody = { ...this._currentChildAPIBody };

        this.setLoading.emit(true);

        this.serviceChildPaginationService
          .getNextChildPaginationData(this._currentChildAPIBody)
          .subscribe({
            next: (res) => {
              this._currentChildAPIBody.count = res?.data?.recordsFiltered ?? res?.data?.recordsTotal;
              this.count = this._currentChildAPIBody.count ?? 0;

              this.handleChangeData();
              this.handleChangeTabData.emit(this._currentChildAPIBody);
              this.setLoading.emit(false);
            },
            error: (e) => {
              console.error("❌ API Error:", e);
              this.setLoading.emit(false);
            }
          });
      } else {
        this.handleChangeData();
      }
    }
  }


  // handleChangeData() {
  //   this.count = this._currentChildAPIBody?.count || 0;

  //   // if (this.isFilterApplied) {
  //   //   this.PageArray = []; // Optionally show only current page
  //   // }
  //   if (this.isFilterApplied) {
  //     const currentPage = this._currentChildAPIBody?.page_no || 1;
  //     const total = this.totalPages;

  //     this.PageArray = [];
  //     const startIndex = Math.floor((currentPage - 1) / 5) * 5 + 1;

  //     for (let i = startIndex; i <= Math.min(total, startIndex + 4); i++) {
  //       this.PageArray.push(i);
  //     }
  //   }
  //   else {
  //     const total = this.totalPages;
  //     const currentPage = this._currentChildAPIBody?.page_no || 1;
  //     const startIndex = Math.floor((currentPage - 1) / 5) * 5 + 1;

  //     this.PageArray = [];
  //     for (let i = startIndex; i <= Math.min(total, startIndex + 4); i++) {
  //       if (i >= 1) this.PageArray.push(i);
  //     }
  //   }
  // }
  handleChangeData() {
  this.count = this._currentChildAPIBody?.count || 0;

  const total = this.totalPages;
  const currentPage = this._currentChildAPIBody?.page_no || 1;

  // ✅ Keep MainPageNo consistent
  this.MainPageNo = currentPage;

  this.PageArray = [];

  if (this.isFilterApplied) {
    // 🔄 Always reset pagination window from 1 when filter is applied
    for (let i = 1; i <= Math.min(total, 5); i++) {
      this.PageArray.push(i);
    }
  } else {
    // 🔄 Normal case: pagination window shifts dynamically
    const startIndex = Math.floor((currentPage - 1) / 5) * 5 + 1;
    for (let i = startIndex; i <= Math.min(total, startIndex + 4); i++) {
      this.PageArray.push(i);
    }
  }
}


  handleFirstClick = () => {
    this.MainPageNo = 1;
    this.updateInitialPageArray();
    this.handlePageClick(this.MainPageNo);
  };

  handleLastClick = () => {
    const total = this.totalPages;
    this.PageArray = [];
    for (let i = Math.max(1, total - 4); i <= total; i++) {
      this.PageArray.push(i);
    }
    this.MainPageNo = total;
    this.handlePageClick(this.MainPageNo);
  };
  handleNextclick1 = () => {
    if (this.MainPageNo >= this.totalPages) return;
    console.log("sfsdgbgf", this.MainPageNo)
    console.log("-------------", this.totalPages)
    // ✅ First update MainPageNo
    this.MainPageNo += 1;
    if (!this.isFilterApplied) {
      if (this.PageArray[this.PageArray.length - 1] < this.totalPages) {
        this.PageArray.shift();
        const nextPage = this.MainPageNo + 4 <= this.totalPages ? this.MainPageNo + 4 : this.totalPages;
        this.PageArray.push(nextPage);
      }
    } else {

      const currentPage = this.MainPageNo;
      const total = this.totalPages;
      const startIndex = Math.floor((currentPage - 1) / 5) * 5 + 1;

      this.PageArray = [];
      for (let i = startIndex; i <= Math.min(total, startIndex + 4); i++) {
        this.PageArray.push(i);
      }
    }
      // ✅ Important: API call with new page
      this.handlePageClick1(this.MainPageNo);
    };

    handleNextclick = () => {
      if (this.MainPageNo >= this.totalPages) return;

      this.MainPageNo += 1;

      if (!this.isFilterApplied) {
        if (this.PageArray[this.PageArray.length - 1] < this.totalPages) {
          this.PageArray.shift();
          const nextPage = this.MainPageNo + 4 <= this.totalPages ? this.MainPageNo + 4 : this.totalPages;
          this.PageArray.push(nextPage);
        }
      }
      this.handlePageClick(this.MainPageNo);
    };

    handlePreviousClick = () => {
      if (this.MainPageNo <= 1) return;

      this.MainPageNo -= 1;

      if (!this.isFilterApplied) {
        if (this.PageArray[0] > 1) {
          this.PageArray.pop();
          const prevPage = this.MainPageNo - 4 >= 1 ? this.MainPageNo - 4 : 1;
          this.PageArray.unshift(prevPage);
        }
      }

      this.handlePageClick(this.MainPageNo);
    };

    handlePageClick1 = (page: number) => {
      this.setLoading.emit(true);

      // ✅ Update pagination, preserve filters
      this._currentChildAPIBody = {
        ...this._currentChildAPIBody,
        page_no: page,
        start: (page - 1) * this.pageSize
      };

      this.MainPageNo = page;

      this.serviceChildPaginationService.getNextChildPaginationData(
        this._currentChildAPIBody
      ).subscribe({
        next: (res) => {
          this._currentChildAPIBody.count = res?.data?.recordsFiltered ?? res?.data?.recordsTotal;
          this.count = this._currentChildAPIBody.count ?? 0;

          this.handleChangeData();

          // ✅ Send updated API body with filters and page info
          this.handleChangeTabData.emit(this._currentChildAPIBody);

          this.setLoading.emit(false);
        },
        error: (e) => {
          console.error("❌ API Error:", e);
          this.setLoading.emit(false);
        }
      });
    };
    handlePageClick = (page: number) => {
      if (page > this.reportLimitPages) {
        this.showAccessDeniedModal = true;
        this.blurContent = true;
        return;
      }

      this.setLoading.emit(true);
      this._currentChildAPIBody.page_no = page;
      this._currentChildAPIBody.start = (page - 1) * this.pageSize;
      this.MainPageNo = page;

      this.serviceChildPaginationService.getNextChildPaginationData(
        this._currentChildAPIBody
      ).subscribe({
        next: (res) => {
        this._currentChildAPIBody.count = res?.data?.recordsFiltered ?? res?.data?.recordsTotal;
        this.count = this._currentChildAPIBody.count ?? 0;

          this.handleChangeData();
          this.handleChangeTabData.emit(this._currentChildAPIBody);
         // this.handleChangeTabData.emit(res?.data);
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
  }
