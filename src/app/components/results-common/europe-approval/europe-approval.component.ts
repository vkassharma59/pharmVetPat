import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { EuropeApprovalCardComponent } from '../europe-approval-card/europe-approval-card.component';

@Component({
  selector: 'chem-europe-approval',
  standalone: true,
  imports: [CommonModule,EuropeApprovalCardComponent],
  templateUrl: './europe-approval.component.html',
  styleUrl: './europe-approval.component.css'
})  
export class EuropeApprovalComponent {
  
  resultTabs: any = {};
  _data: any = [];
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }

  constructor(private utilityService: UtilityService) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }
  ngOnChanges() {
   console.log('europeApproval received data:', this._data);
 }
 
}
