import { Component, Input } from '@angular/core';
import { BasicRouteCardComponent } from '../basic-route-card/basic-route-card.component';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';

@Component({
  selector: 'chem-product-info',
  standalone: true,
  imports: [CommonModule, BasicRouteCardComponent],
  templateUrl: './basic-route.component.html',
  styleUrl: './basic-route.component.css'
})
export class BasicRouteComponent {

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
