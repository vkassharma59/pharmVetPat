import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TechnicalRoutesCardComponent } from '../technical-routes-card/technical-routes-card.component';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { ChildResultTabComponent } from '../../../commons/child-result-tab/child-result-tab.component';
import { Auth_operations } from '../../../Utils/SetToken';

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
  @Input() MainDataResultShow: any;
    searchThrough: string = '';


  resultTabs: any = {};
  _data: any = [];
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
    console.log("r0000000000000eghrdjihborftht",value)
  }
  viewProduct: boolean = false;


  handleToggleViewProduct() {
    this.viewProduct = !this.viewProduct;
    console.log(this.viewProduct,"reghrdjihborftht", this.currentChildAPIBody)
    
  }

  constructor(private utilityService: UtilityService) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }

  isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
}
