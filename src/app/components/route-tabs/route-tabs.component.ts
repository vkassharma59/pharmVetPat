import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UtilityService } from '../../services/utility-service/utility.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import cloneDeep from 'lodash/cloneDeep';


@Component({
  selector: 'chem-route-tabs',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './route-tabs.component.html',
  styleUrl: './route-tabs.component.scss'
})


export class RouteTabsComponent {

  resultTabValues: any = [];
  
  @Output() handleCurrentTab = new EventEmitter<any>();
  @Input() resultTabs: any;


  constructor(private utilityService: UtilityService) { }

  ngOnInit() {
    if(this.resultTabs) {
      this.resultTabValues = JSON.parse(JSON.stringify(this.resultTabs));
      
    }
  }

  handleTabClick(data: any) {
    // Set tab active
    this.resultTabValues.forEach((tab: any) => {
      tab.isActive = tab?.name === data?.name; // Set active if names match, else false
    });

    this.handleCurrentTab.emit(data);
  }
}
