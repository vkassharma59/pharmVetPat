import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { KoreaOrangebookComponent } from '../korea-orangebook/korea-orangebook.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { LoadingService } from '../../../services/loading-service/loading.service';

@Component({
  selector: 'chem-korea',
  standalone: true,
  imports: [CommonModule,KoreaOrangebookComponent,ChildPagingComponent],
  templateUrl: './korea.component.html',
  styleUrl: './korea.component.css'
})
export class KoreaComponent {

    @Output() handleResultTabData = new EventEmitter<any>();
    @Output() handleSetLoading = new EventEmitter<boolean>();
    @Input() currentChildAPIBody: any;
    @Input() index: any;
    @Input() tabName?: string;
  searchThrough: string = '';

 resultTabs: any = {};
    _data: any = [];
    @Input()
    get data() {
      return this._data;
    }
    set data(value: any) {
      this._data = value;
    }
  
    constructor(
      private utilityService: UtilityService,
      public loadingService: LoadingService
    ) {
      this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
    }

     isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
}
