import {
  Component, EventEmitter,
  Input,
  Output,
  OnChanges
} from '@angular/core';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { CommonModule } from '@angular/common';
import { GppdDbCardComponent } from '../gppd-db-card/gppd-db-card.component';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';

// @Component({
//   selector: 'app-gppd-db',
//   standalone: true,
//   imports: [ChildPagingComponent, CommonModule, GppdDbCardComponent],
//   templateUrl: './gppd-db.component.html',
//   styleUrl: './gppd-db.component.css'
// })
// export class GppdDbComponent {
//   @Output() handleResultTabData = new EventEmitter<any>();
//   @Output() handleSetLoading = new EventEmitter<boolean>();
//   @Input() currentChildAPIBody: any;

//   // fir kahi pe

//   @Input()
//   set data(value: any) {
//     this._data = value;
//     // Emit only rows to parent if needed
//     this.handleResultTabData.emit(this._data?.rows || []);
//   }

//   get data() {
//     return this._data;
//   }

//   resultTabs: any = {};
//   _data: any = { columns: [], rows: [] }; // expected structure

//   constructor(private utilityService: UtilityService) {
//     this.resultTabs = this.utilityService.getAllTabsName();
//   }
//   handleFilterApplied(event: any) {
//   this.gppdDbSearch(event, 1);
// }

//    ngOnChanges() {
//     console.log('scientificDocs received data:', this._data);
//     console.log('currentChildAPIBody:', this.currentChildAPIBody);
//     this.handleResultTabData.emit(this.currentChildAPIBody);

//   }
// }
@Component({
  selector: 'app-gppd-db',
  standalone: true,
  imports: [ChildPagingComponent, CommonModule, GppdDbCardComponent],
  templateUrl: './gppd-db.component.html',
  styleUrl: './gppd-db.component.css'
})
export class GppdDbComponent {
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @Input() currentChildAPIBody: any;

  @Input()
  set data(value: any) {
    this._data = value;
    this.handleResultTabData.emit(this._data?.rows || []);
  }

  get data() {
    return this._data;
  }

  resultTabs: any = {};
  _data: any = { columns: [], rows: [] };

  constructor(private utilityService: UtilityService, private mainSearchService: MainSearchService) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }

  ngOnChanges() {
    console.log('scientificDocs received data:', this._data);
    console.log('currentChildAPIBody:', this.currentChildAPIBody);
    this.handleResultTabData.emit(this.currentChildAPIBody);
  }

  handleFilterApplied(event: any) {
    this.gppdDbSearch(event, 1); // 👇👇👇 This method MUST exist!
  }

  gppdDbSearch(resultTabData: any, pageNo: number = 1) {
  this.handleSetLoading.emit(true);
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
console.log("resulttabData",resultTabData)
  const updatedBody = {
    ...this.currentChildAPIBody,
     ...resultTabData
    
  };

  // API call
  this.mainSearchService.gppdDbSearchSpecific(updatedBody).subscribe({
    next: (res) => {
      // Yeh _data update kar raha hai
      this._data.rows = res?.data?.rows || [];
      this._data.columns = res?.data?.columns || [];

      this.handleResultTabData.emit(this._data.rows);
      this.handleSetLoading.emit(false);
      window.scrollTo(0, scrollTop);
    },
    error: (err) => {
      console.error('Error in gppdDbSearch:', err);
      this.handleSetLoading.emit(false);
      window.scrollTo(0, scrollTop);
    }
  });
}

}


