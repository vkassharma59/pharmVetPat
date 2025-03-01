import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { searchTypes, UtilityService } from '../../services/utility-service/utility.service';
import { JsonPipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { RouteTabsComponent } from '../route-tabs/route-tabs.component';
import { UserPriviledgeService } from '../../services/user_priviledges/user-priviledge.service';
import { Auth_operations } from '../../Utils/SetToken';
import { BasicRouteComponent } from '../results-common/basic-route/basic-route.component';
import { TechnicalRoutesComponent } from '../results-common/technical-routes/technical-routes.component';
import { ImpurityComponent } from '../results-common/impurity/impurity.component';
import { ChemiTrackerComponent } from '../results-common/chemi-tracker/chemi-tracker.component';
import { ChemicalDirectoryComponent } from '../results-common/chemical-directory/chemical-directory.component';

@Component({
  selector: 'chem-route-results',
  standalone: true,
  imports: [NgIf, RouteTabsComponent, ImpurityComponent, ChemiTrackerComponent, BasicRouteComponent, TechnicalRoutesComponent, ChemicalDirectoryComponent, NgSwitch, NgSwitchCase, NgSwitchDefault, JsonPipe],
  templateUrl: './route-result.component.html',
  styleUrl: './route-result.component.css'
})

export class RouteResultComponent {

  currentTabData: any = {}
  @Output() backFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() onResultTabChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() index: number | undefined;
  @Input() dataItem: any;
  @Input() searchData: any;
  resultTabs: any = [];
  resultTabWithKeys: any = [];

  constructor(private utilityService: UtilityService,
    private userPriviledgeService: UserPriviledgeService
  ) {}

  ngOnInit() {
    this.resultTabs = Object.values(this.utilityService.getAllTabsName());
    this.currentTabData = this.resultTabs.find((tab: any) => tab.isActive);

    //
    this.resultTabWithKeys = this.utilityService.getAllTabsName();        
  }

  handleBack() {
    this.backFunction.emit(false);
  }

  handleCurrentTab(data: any) { 
    const searchThrough = Auth_operations.getActiveformValues().activeForm;

    let searchWith = '';
    let searchWithValue;

    switch(searchThrough) {
      case searchTypes.chemicalStructure:
        if(data.name === this.resultTabWithKeys.technicalRoutes.name) {
          searchWith = 'TRRN';
          searchWithValue = this.dataItem[this.resultTabWithKeys.chemicalDirectory.name][0].trrn;
        } else {
          searchWith = 'GBRN';
          searchWithValue = this.dataItem[this.resultTabWithKeys.chemicalDirectory.name][0].gbrn;
        }
        break;
      case searchTypes.synthesisSearch:
        if(data.name === this.resultTabWithKeys.chemicalDirectory.name) {
          searchWith = 'TRRN';
          searchWithValue = this.dataItem[this.resultTabWithKeys.technicalRoutes.name][0].trrn;
        } else {
          searchWith = 'GBRN';
          searchWithValue = this.dataItem[this.resultTabWithKeys.technicalRoutes.name][0].gbrn;
        }
        break;        
      case searchTypes.intermediateSearch:
          if(data.name === this.resultTabWithKeys.technicalRoutes.name) {
            searchWith = 'TRRN';
            searchWithValue = this.dataItem[this.resultTabWithKeys.chemicalDirectory.name][0].trrn;
          } else {
            searchWith = 'GBRN';
            searchWithValue = this.dataItem[this.resultTabWithKeys.chemicalDirectory.name][0].gbrn;
          }
          break;
      case (searchTypes.simpleSearch || searchTypes.advanceSearch):
        searchWith = 'GBRN';
        searchWithValue = this.dataItem[this.resultTabWithKeys.productInfo.name][0].gbrn;
        break;
      default:
        console.log('No search type selected');
    }
    
    const tempObj = 
    {
      currentTabData: data,
      index: this.index,
      dataItem: this.dataItem,
      searchWith: searchWith,
      searchWithValue: searchWithValue
    }

    this.onResultTabChange.emit(tempObj);
    this.currentTabData = data;
  }
}
