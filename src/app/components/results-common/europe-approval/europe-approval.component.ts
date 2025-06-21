import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { EuropeApprovalCardComponent } from '../europe-approval-card/europe-approval-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { LoadingService } from '../../../services/loading-service/loading.service';

@Component({
  selector: 'chem-europe-approval',
  standalone: true,
  imports: [CommonModule, EuropeApprovalCardComponent, ChildPagingComponent],
  templateUrl: './europe-approval.component.html',
  styleUrl: './europe-approval.component.css'
})
export class EuropeApprovalComponent {

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @Input() currentChildAPIBody: any;
  searchThrough: string = '';
  resultTabs: any = {};
  _data: any = [];
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
    this.handleResultTabData.emit(this._data || []);
  }
  @Input() index: any;
  @Input() tabName?: string;

  constructor(
    private utilityService: UtilityService,
    public loadingService: LoadingService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }
  ngOnChanges() {
    console.log('europeApproval received data:', this._data);
    this.handleResultTabData.emit(this._data);
  }
  //  updateDataFromPagination(newData: any) {
  //   this._data = newData; // or this.data = newData; if you want setter to trigger
  //   this.handleResultTabData.emit(newData);
  //   console.log("✅ Updated data from pagination:", newData);
  // }

}
