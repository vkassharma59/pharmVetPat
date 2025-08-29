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
  productInfoApiBody: any;
  _data: any = [];
  count: number = 0;
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  searchThrough: string = '';
  _currentChildAPIBody: any;
  @Input() index: any;
  @Input() tabName?: string;

  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
    console.log('📦 Input `data` updated:', value); // ✅ Console log when data is updated
  }

  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    console.log('🔹 Input `currentChildAPIBody` updated:', value); // ✅ Console log when API body changes
    if (value) {
      this.productInfoApiBody = JSON.parse(JSON.stringify(value)) || value;
      console.log('📄 Copied `productInfoApiBody`:', this.productInfoApiBody);
    }
  }

  constructor(private utilityService: UtilityService, public loadingService: LoadingService) {
    this.resultTabs = this.utilityService.getAllTabsName();
    console.log('📝 Result Tabs initialized:', this.resultTabs);
    
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
    console.log('🔎 Active searchThrough value:', this.searchThrough);
  }
}
