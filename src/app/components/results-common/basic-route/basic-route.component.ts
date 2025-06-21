import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BasicRouteCardComponent } from '../basic-route-card/basic-route-card.component';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { LoadingService } from '../../../services/loading-service/loading.service';

@Component({
  selector: 'chem-product-info',
  standalone: true,
  imports: [CommonModule, BasicRouteCardComponent, ChildPagingComponent],
  templateUrl: './basic-route.component.html',
  styleUrl: './basic-route.component.css'
})
export class BasicRouteComponent {

  resultTabs: any = {};
  _data: any = [];
  count: number = 0;
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  searchThrough: string = '';
  @Input() currentChildAPIBody: any;
  @Input() index: any;
  @Input() tabName?: string;
    @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }

  constructor(private utilityService: UtilityService, public loadingService: LoadingService) {
    this.resultTabs = this.utilityService.getAllTabsName();    
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }
}
