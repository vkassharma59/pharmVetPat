import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UtilityService } from '../../services/utility-service/utility.service';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'chem-route-tabs',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './route-tabs.component.html',
  styleUrl: './route-tabs.component.scss'
})

export class RouteTabsComponent {

  @Output() handleCurrentTab = new EventEmitter<any>();
  resultTabValues: any = [];
  private _resultTabs: any;

  @Input()
  get resultTabs(): any {
    return this._resultTabs;
  }
  set resultTabs(value: any) {
    this._resultTabs = value;
    if (value) {
      this.resultTabValues = JSON.parse(JSON.stringify(value));
    }
  }

  private _activeTab: string = '';
  @Input()
  get activeTab(): string {
    return this._activeTab;
  }
  set activeTab(value: string) {    
    if (value && this.resultTabValues && Array.isArray(this.resultTabValues)) {
      this._activeTab = value;
      const data =  {};
      this.resultTabValues.forEach((tab: any) => {
        if(tab?.name === value) {
          tab.isActive = true; 
          data['isActive'] = true;
          data['label'] = tab?.label;
          data['name'] = value;
        } else {
          tab.isActive = false; // Set inactive for others
        }
      });
      // this.handleCurrentTab.emit(data);
    }
  }

  constructor(private utilityService: UtilityService) { }

  handleTabClick(data: any) {
    // Set tab active
    this.resultTabValues.forEach((tab: any) => {
      tab.isActive = tab?.name === data?.name; // Set active if names match, else false
      
    });

    this.handleCurrentTab.emit(data);
  }
 }
