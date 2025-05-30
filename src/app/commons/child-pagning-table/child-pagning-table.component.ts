// import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges} from '@angular/core';
// import { ServiceChildPaginationService } from '../../services/child-pagination/service-child-pagination.service';
// import { CommonModule } from '@angular/common';

// @Component({
//  selector: 'app-child-pagning-table',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './child-pagning-table.component.html',
//   styleUrl: './child-pagning-table.component.css'
// })

// export class ChildPagningTableComponent implements OnChanges{

//   _currentChildAPIBody: any;

//   @Input() childPaginationData: any;

//   @Input() isFilterApplied: boolean = false; // NEW input for custom pagination mode

//   @Output() handleChangeTabData: EventEmitter<any> = new EventEmitter<any>();
//   @Output() setLoading: EventEmitter<any> = new EventEmitter<any>();

//   MainPageNo = 1;
//   PageArray: number[] = [1, 2, 3, 4, 5];
//   count: number = 0;

//   @Input()
//   get currentChildAPIBody() {
//     return this._currentChildAPIBody;
//   }
//   set currentChildAPIBody(value: any) {
//     this._currentChildAPIBody = value;
//     this.PageArray = [];
//     this.count = 0;

//     if (this._currentChildAPIBody?.count) {
//       this.count = this._currentChildAPIBody.count;
//     }

//     // Initialize PageArray for unfiltered pagination, max 5 pages
//     for (let i = 1; i <= Math.min(Math.ceil(this.count / 25), 5); i++) {
//       this.PageArray.push(i);
//     }
//   }

//   // Calculate total pages based on count and page size 25
//   get totalPages(): number {
//     return Math.ceil(this.count / 25);
//   }

//   constructor(
//     private serviceChildPaginationService: ServiceChildPaginationService
//   ) {}

//   handleFirstClick = () => {
//     const pageCount = this.totalPages;
//     this.PageArray = [];
//     for (let i = 1; i <= Math.min(5, pageCount); i++) {
//       this.PageArray.push(i);
//     }
//     this.MainPageNo = 1;
//     this.handlePageClick(this.MainPageNo);
//   };

//   handleLastClick = () => {
//     const pageCount = this.totalPages;
//     this.PageArray = [];
//     for (let i = Math.max(1, pageCount - 4); i <= pageCount; i++) {
//       this.PageArray.push(i);
//     }
//     this.MainPageNo = pageCount;
//     this.handlePageClick(this.MainPageNo);
//   };

//   // handleNextclick = () => {
//   //   if (this.MainPageNo >= this.totalPages) return;

//   //   this.MainPageNo += 1;

//   //   if (!this.isFilterApplied) {
//   //     // Unfiltered: update PageArray sliding window
//   //     if (this.PageArray[this.PageArray.length - 1] < this.totalPages) {
//   //       this.PageArray.shift();
//   //       this.PageArray.push(this.MainPageNo + 4 <= this.totalPages ? this.MainPageNo + 4 : this.totalPages);
//   //     }
//   //   }

//   //   this.handlePageClick(this.MainPageNo);
//   // };
// handleNextclick = () => {
//   if (this.MainPageNo >= this.totalPages) return;

//   this.MainPageNo += 1;

//   if (!this.isFilterApplied) {
//     // Unfiltered: update PageArray sliding window
//     if (this.PageArray[this.PageArray.length - 1] < this.totalPages) {
//       this.PageArray.shift();
//       this.PageArray.push(
//         this.MainPageNo + 4 <= this.totalPages
//           ? this.MainPageNo + 4
//           : this.totalPages
//       );
//     }
//   }

//   this.handlePageClick(this.MainPageNo); // Always call this
// };

// handlePreviousClick = () => {
//   if (this.MainPageNo <= 1) return;

//   this.MainPageNo -= 1;

//   if (!this.isFilterApplied) {
//     // Unfiltered: update PageArray sliding window
//     if (this.PageArray[0] > 1) {
//       this.PageArray.pop();
//       this.PageArray.unshift(
//         this.MainPageNo - 4 >= 1 ? this.MainPageNo - 4 : 1
//       );
//     }
//   }

//   this.handlePageClick(this.MainPageNo); // Always call this
// };

//   // handlePreviousClick = () => {
//   //   if (this.MainPageNo <= 1) return;

//   //   this.MainPageNo -= 1;

//   //   if (!this.isFilterApplied) {
//   //     // Unfiltered: update PageArray sliding window
//   //     if (this.PageArray[0] > 1) {
//   //       this.PageArray.pop();
//   //       this.PageArray.unshift(this.MainPageNo - 4 >= 1 ? this.MainPageNo - 4 : 1);
//   //     }
//   //   }

//   //   this.handlePageClick(this.MainPageNo);
//   // };
//  handlePageClick = (page: number) => {
//     this.setLoading.emit(true);
//     this._currentChildAPIBody.page_no = page;
//     // Set dynamic 'start' based on (page_no - 1) * length
//     const pageSize = this._currentChildAPIBody.length || 25; // fallback 25
//     this._currentChildAPIBody.start = (page - 1) * pageSize;
//     this.MainPageNo = page;
//     // console.log("📦 Request Body before API Call:", this._currentChildAPIBody);
//     this.serviceChildPaginationService.getNextChildPaginationData(
//       this._currentChildAPIBody
//     ).subscribe({
//       next: (res) => {
//         console.log("✅ API Response:", res?.data);
//         this._currentChildAPIBody.count = res?.data?.recordsFiltered ?? res?.data?.recordsTotal;
//         console.log("📤 Emitting handleChangeTabData with:", res?.data);
//           this.handleChangeTabData.emit(this._currentChildAPIBody);

//         // this.handleChangeTabData.emit(this._currentChildAPIBody);
//         //   if (res?.count) {
//         //   this.count = res.count;
//         // }

//         this.setLoading.emit(false);
//       },
//       error: (e) => {
//         console.error("❌ API Error:000000000000000000", e);
//         this.setLoading.emit(false);
//       },
//     });
//   };

//   handleChangeData() {
//     if (this._currentChildAPIBody?.count) {
//       this.count = this._currentChildAPIBody.count;
//     }

//     if (this.isFilterApplied) {
//       // For filtered mode, no page array needed or you can keep only current page info
//       this.PageArray = [];
//     } else {
//       // For full pagination mode - calculate sliding window of pages
//       const pageCount = this.totalPages;
//       const currentPageIndex = this._currentChildAPIBody?.page_no || 1;
//       const PageSetStartIndex = currentPageIndex % 5;
//       const startIndex =
//         PageSetStartIndex !== 0
//           ? currentPageIndex - PageSetStartIndex + 1
//           : currentPageIndex - 4;

//       this.PageArray = [];
//       for (let i = startIndex; i <= Math.min(pageCount, startIndex + 4); i++) {
//         if (i >= 1) this.PageArray.push(i);
//       }
//     }
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['currentChildAPIBody'] || changes['isFilterApplied']) {
//       this.handleChangeData();
//     }
//   }
// }
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges
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

  @Input()
  get currentChildAPIBody(): ChildAPIBody {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: ChildAPIBody) {
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentChildAPIBody']?.currentValue || changes['isFilterApplied']?.currentValue !== undefined) {
      this.handleChangeData();
    }
  }

  handleChangeData() {
    this.count = this._currentChildAPIBody?.count || 0;

    // if (this.isFilterApplied) {
    //   this.PageArray = []; // Optionally show only current page
    // }
    if (this.isFilterApplied) {
      const currentPage = this._currentChildAPIBody?.page_no || 1;
      const total = this.totalPages;

      this.PageArray = [];
      const startIndex = Math.floor((currentPage - 1) / 5) * 5 + 1;

      for (let i = startIndex; i <= Math.min(total, startIndex + 4); i++) {
        this.PageArray.push(i);
      }
    }
    else {
      const total = this.totalPages;
      const currentPage = this._currentChildAPIBody?.page_no || 1;
      const startIndex = Math.floor((currentPage - 1) / 5) * 5 + 1;

      this.PageArray = [];
      for (let i = startIndex; i <= Math.min(total, startIndex + 4); i++) {
        if (i >= 1) this.PageArray.push(i);
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

  handlePageClick = (page: number) => {
    this.setLoading.emit(true);

    this._currentChildAPIBody.page_no = page;
    this._currentChildAPIBody.start = (page - 1) * this.pageSize;
    this.MainPageNo = page;

    this.serviceChildPaginationService.getNextChildPaginationData(
      this._currentChildAPIBody
    ).subscribe({
      next: (res) => {
        console.log("✅ API Response:", res?.data);

        this._currentChildAPIBody.count = res?.data?.recordsFiltered ?? res?.data?.recordsTotal;
        this.count = this._currentChildAPIBody.count ?? 0;

        this.handleChangeData(); // Refresh page array if count changed
        this.handleChangeTabData.emit(this._currentChildAPIBody);
        this.setLoading.emit(false);
      },
      error: (e) => {
        console.error("❌ API Error:", e);
        this.setLoading.emit(false);
      }
    });
  };
}
