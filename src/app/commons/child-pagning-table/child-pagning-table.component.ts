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

  @Input()
  get currentChildAPIBody(): ChildAPIBody {
      console.log("🔄 currentChildAPIBody set to:", this._currentChildAPIBody); // Log here
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

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['currentChildAPIBody']?.currentValue || changes['isFilterApplied']?.currentValue !== undefined) {
  //     this.handleChangeData();
  //   }
  // }
previousAPIBody: any = null; // Add this to your component to track previous request



// ngOnChanges(changes: SimpleChanges): void {
//   const currentBody = this.currentChildAPIBody;

//   const hasBodyChanged = JSON.stringify(currentBody) !== JSON.stringify(this.previousAPIBody);

//   // Only call API if body actually changed or filter is applied newly
//   if (
//     (changes['currentChildAPIBody'] && hasBodyChanged) ||
//     changes['isFilterApplied']?.currentValue !== undefined
//   ) {
//     if (this.isFilterApplied) {
//       // 🛑 Only reset to page 1 if this is a new filter, not for pagination
//       if (hasBodyChanged) {
//         this.MainPageNo = 1;
//         this._currentChildAPIBody = {
//           ...currentBody,
//           page_no: 1,
//           start: 0
//         };
//       } else {
//         // Keep page number from currentBody if not a new filter
//         this._currentChildAPIBody = {
//           ...currentBody
//         };
//       }

//       this.previousAPIBody = { ...this._currentChildAPIBody }; // store for comparison

//       console.log("📡 API call with:", this._currentChildAPIBody);

//       // ✅ emit loading once only
//       this.setLoading.emit(true);

//       this.serviceChildPaginationService
//         .getNextChildPaginationData(this._currentChildAPIBody)
//         .subscribe({
//           next: (res) => {
//             this._currentChildAPIBody.count = res?.data?.recordsFiltered ?? res?.data?.recordsTotal;
//             this.count = this._currentChildAPIBody.count ?? 0;

//             this.handleChangeData(); // make sure this doesn't emit loading again
//             this.handleChangeTabData.emit(this._currentChildAPIBody);
//             this.setLoading.emit(false);
//           },
//           error: (e) => {
//             console.error("❌ API Error:", e);
//             this.setLoading.emit(false);
//           }
//         });
//     } else {
//       this.handleChangeData();
//     }
//   }
// }
ngOnChanges(changes: SimpleChanges): void {
  const currentBody = this.currentChildAPIBody;
  const hasBodyChanged = JSON.stringify(currentBody) !== JSON.stringify(this.previousAPIBody);

  if (
    (changes['currentChildAPIBody'] && hasBodyChanged) ||
    changes['isFilterApplied']?.currentValue !== undefined
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
  // handleNextclick1 = () => {
  //   if (this.MainPageNo >= this.totalPages) return;
  //   console.log("sfsdgbgf", this.MainPageNo)
  //   console.log("-------------", this.totalPages)
  //   this.MainPageNo += 1;

  //   if (!this.isFilterApplied) {
  //     if (this.PageArray[this.PageArray.length - 1] < this.totalPages) {
  //       this.PageArray.shift();
  //       const nextPage = this.MainPageNo + 4 <= this.totalPages ? this.MainPageNo + 4 : this.totalPages;
  //       this.PageArray.push(nextPage);
  //     }
  //   } else {
  //     // ✅ For filtered case: update PageArray for UI
  //     const currentPage = this.MainPageNo;
  //     const total = this.totalPages;
  //     const startIndex = Math.floor((currentPage - 1) / 5) * 5 + 1;

  //     this.PageArray = [];
  //     for (let i = startIndex; i <= Math.min(total, startIndex + 4); i++) {
  //       this.PageArray.push(i);
  //     }
  //   }

  //   // ✅ Always send updated page but keep filters intact
  //   this.handlePageClick1(this.MainPageNo);
  // };
handleNextclick1 = () => {
  if (this.MainPageNo >= this.totalPages) return;

  // ✅ First update MainPageNo
  this.MainPageNo += 1;

  const currentPage = this.MainPageNo;
  const total = this.totalPages;
  const startIndex = Math.floor((currentPage - 1) / 5) * 5 + 1;

  this.PageArray = [];
  for (let i = startIndex; i <= Math.min(total, startIndex + 4); i++) {
    this.PageArray.push(i);
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

  // handlePageClick1 = (page: number) => {
  //   this.setLoading.emit(true);

  //   console.log("➡️ handlePageClick1 called");
  //   console.log("🔢 Going to Page:", page);
  //   console.log("📦 Existing API Body Before Update:", this._currentChildAPIBody);

  //   // ✅ Preserve filters (search/status/etc), update only pagination
  //   this._currentChildAPIBody = {
  //     ...this._currentChildAPIBody,

  //     page_no: page,
  //     start: (page - 1) * this.pageSize
  //   };

  //   this.MainPageNo = page;

  //   console.log("📨 Final API Body to Send:", this._currentChildAPIBody);

  //   this.serviceChildPaginationService.getNextChildPaginationData(
  //     this._currentChildAPIBody
  //   ).subscribe({
  //     next: (res) => {
  //       console.log("✅ API Response:", res);

  //       this._currentChildAPIBody = {
  //         ...this._currentChildAPIBody,
  //         count: res?.data?.recordsFiltered ?? res?.data?.recordsTotal
  //       };

  //       this.count = this._currentChildAPIBody.count ?? 0;
  //       console.log("🔁 Updated Count:", this.count);

  //       this.handleChangeData();
  //       this.handleChangeTabData.emit(this._currentChildAPIBody);
  //       this.setLoading.emit(false);
  //     },
  //     error: (e) => {
  //       console.error("❌ API Error:", e);
  //       this.setLoading.emit(false);
  //     }
  //   });
  // };


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
