import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { CanadaHealthComponent } from '../canada-health/canada-health.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';

@Component({
  selector: 'chem-canada',
  standalone: true,
  imports: [CommonModule, CanadaHealthComponent, ChildPagingComponent],
  templateUrl: './canada.component.html',
  styleUrl: './canada.component.css'
})
export class CanadaComponent {

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
  }
  @Input() index: any;

  constructor(private utilityService: UtilityService) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;

  }
}
