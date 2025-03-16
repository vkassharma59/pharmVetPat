import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { LitigationCardComponent } from '../litigation-card/litigation-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';

@Component({
  selector: 'chem-litigation',
  standalone: true,
  imports: [CommonModule,LitigationCardComponent,ChildPagingComponent],
  templateUrl: './litigation.component.html',
  styleUrl: './litigation.component.css'
})
export class LitigationComponent {

    @Output() handleResultTabData = new EventEmitter<any>();
    @Output() handleSetLoading = new EventEmitter<boolean>();
    @Input() currentChildAPIBody: any;

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
      console.log('JapanComponent received data:', this._data);
    }
}
