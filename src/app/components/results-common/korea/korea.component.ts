import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { KoreaOrangebookComponent } from '../korea-orangebook/korea-orangebook.component';

@Component({
  selector: 'chem-korea',
  standalone: true,
  imports: [CommonModule,KoreaOrangebookComponent],
  templateUrl: './korea.component.html',
  styleUrl: './korea.component.css'
})
export class KoreaComponent {

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

}
