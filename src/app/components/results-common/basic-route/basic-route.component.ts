import { Component, EventEmitter, Input, Output, AfterViewInit, OnInit } from '@angular/core';
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
export class BasicRouteComponent implements OnInit, AfterViewInit {

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
  }

  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
  
    if (value) {
      this.productInfoApiBody = JSON.parse(JSON.stringify(value)) || value;
      
    }
  }

  constructor(private utilityService: UtilityService, public loadingService: LoadingService) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
   
  }

  ngOnInit(): void {
   // console.log('Current Child API Body (index:', this.currentChildAPIBody);
  }
 


  ngAfterViewInit(): void {
    // ✅ Scroll to top after component loads
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

}
