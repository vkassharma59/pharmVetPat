import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TechnicalRoutesCardComponent } from '../technical-routes-card/technical-routes-card.component';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { ChildResultTabComponent } from '../../../commons/child-result-tab/child-result-tab.component';
import { Auth_operations } from '../../../Utils/SetToken';
import { SharedRosService } from '../../../shared-ros.service';

@Component({
  selector: 'chem-technical-route',
  standalone: true,
  imports: [TechnicalRoutesCardComponent, CommonModule, ChildPagingComponent, ChildResultTabComponent],
  templateUrl: './technical-routes.component.html',
  styleUrl: './technical-routes.component.css'
})
export class TechnicalRoutesComponent {

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() resetPagination = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @Input() currentChildAPIBody: any;
  @Input() specialCount: any;
  @Input() CurrentAPIBody: any;
  @Input() MainDataResultShow: any;
  @Input() index: any;
  searchThrough: string = '';
rosCounts: { agrochemical: number; pharmaceutical: number } = {
  agrochemical: 0,
  pharmaceutical: 0
};


  resultTabs: any = {};
  _data: any = [];
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }
  viewProduct: boolean = false;

  ngOnInit() {
  this.sharedROS.rosCount$.subscribe(count => {
    if (count) {
      console.log('Received ROS Count:', count);
      this.rosCounts = count; // ✔️ update the local variable
    }
  });
   console.log('data gvfdh Count:', this._data);
}

  handleToggleViewProduct() {
    this.viewProduct = !this.viewProduct;

  }

  constructor(private utilityService: UtilityService,
    private sharedROS: SharedRosService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
}
