import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ImpPatentsCardComponent } from '../imp-patents-card/imp-patents-card.component';
@Component({
  selector: 'chem-imp',
  standalone: true,
  imports: [CommonModule,ImpPatentsCardComponent],
  templateUrl: './imp.component.html',
  styleUrl: './imp.component.css'
})
export class ImpComponent {
  
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
   console.log('impPatents received data:', this._data);
 }
 


}
