import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { IndianMedicineCardComponent } from '../indian-medicine-card/indian-medicine-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
@Component({
  selector: 'chem-indian',
  standalone: true,
  imports: [CommonModule,IndianMedicineCardComponent,ChildPagingComponent],
  templateUrl: './indian.component.html',
  styleUrl: './indian.component.css'
})
export class IndianComponent {
  
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
