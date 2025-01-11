import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { UtilityService } from '../../services/utility-service/utility.service';
import { NgIf } from '@angular/common';
import { RouteTabsComponent } from '../route-tabs/route-tabs.component';

@Component({
  selector: 'chem-route-results',
  standalone: true,
  imports: [NgIf, RouteTabsComponent],
  templateUrl: './route-result.component.html',
  styleUrl: './route-result.component.css'
})

export class RouteResultComponent {

  currentTab: string | undefined;

  @Output() backFunction: EventEmitter<any> = new EventEmitter<any>();

  @Input() index: number | undefined;
  @Input() dataItems: any;
  @Input() productInfoData: any;
  resultTabs: any = [];

  constructor(private utilityService: UtilityService) {}

  ngOnInit() {
    this.resultTabs = Object.values(this.utilityService.getAllTabsName()) ;
  }

  handleBack() {
    this.backFunction.emit(false);
  }

  handleCurrentTab(data: any) {    
    this.currentTab = data;
  }
}
