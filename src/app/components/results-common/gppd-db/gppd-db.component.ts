import { Component, EventEmitter,
  Input,
  Output,
  OnChanges } from '@angular/core';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { CommonModule } from '@angular/common';
import { GppdDbCardComponent } from '../gppd-db-card/gppd-db-card.component';
import { UtilityService } from '../../../services/utility-service/utility.service';

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
    // Emit only rows to parent if needed
    this.handleResultTabData.emit(this._data?.rows || []);
  }

  get data() {
    return this._data;
  }

  resultTabs: any = {};
  _data: any = { columns: [], rows: [] }; // expected structure

  constructor(private utilityService: UtilityService) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }

  ngOnChanges() {
    console.log('scientificDocs received data:', this._data);
    console.log('currentChildAPIBody:', this.currentChildAPIBody);

  }
}


