import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { UtilityService } from '../../services/utility-service/utility.service';
import { JsonPipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { RouteTabsComponent } from '../route-tabs/route-tabs.component';
import { BasicRouteCardComponent } from '../results-common/basic-route-card/basic-route-card.component';
import { TechnicalRoutesCardComponent } from '../results-common/technical-routes-card/technical-routes-card.component';

@Component({
  selector: 'chem-route-results',
  standalone: true,
  imports: [NgIf, RouteTabsComponent, BasicRouteCardComponent, TechnicalRoutesCardComponent, NgSwitch, NgSwitchCase, NgSwitchDefault, JsonPipe],
  templateUrl: './route-result.component.html',
  styleUrl: './route-result.component.css'
})

export class RouteResultComponent {

  currentTabData: any = {}
  @Output() backFunction: EventEmitter<any> = new EventEmitter<any>();

  @Input() index: number | undefined;
  @Input() dataItem: any;
  @Input() searchData: any;
  resultTabs: any = [];

  constructor(private utilityService: UtilityService) {}

  ngOnInit() {
    this.resultTabs = Object.values(this.utilityService.getAllTabsName()) ;
    this.currentTabData = this.resultTabs.find((tab: any) => tab.isActive);
  }

  handleBack() {
    this.backFunction.emit(false);
  }

  handleCurrentTab(data: any) {    
    this.currentTabData = data;
  }
}
