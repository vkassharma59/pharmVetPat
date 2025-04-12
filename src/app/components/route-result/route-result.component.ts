import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { searchTypes, UtilityService } from '../../services/utility-service/utility.service';
import { JsonPipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { RouteTabsComponent } from '../route-tabs/route-tabs.component';
import { UserPriviledgeService } from '../../services/user_priviledges/user-priviledge.service';
import { Auth_operations } from '../../Utils/SetToken';
import { ImpComponent } from '../results-common/imp/imp.component';
import { UsComponent } from '../results-common/us/us.component';
import { KoreaComponent } from '../results-common/korea/korea.component';
import { LitigationComponent } from '../results-common/litigation/litigation.component';
import { EuropeApprovalComponent } from '../results-common/europe-approval/europe-approval.component';
import { CanadaComponent } from '../results-common/canada/canada.component';
import { JapanComponent } from '../results-common/japan/japan.component';
import { IndianComponent } from '../results-common/indian/indian.component';
import { SpcdbComponent } from '../results-common/spcdb/spcdb.component';
import { EximComponent } from '../results-common/exim/exim.component';
import { ActivePatentComponent } from '../results-common/active-patent/active-patent.component';
import { BasicRouteComponent } from '../results-common/basic-route/basic-route.component';
import { TechnicalRoutesComponent } from '../results-common/technical-routes/technical-routes.component';
import { ImpurityComponent } from '../results-common/impurity/impurity.component';
import { ChemiTrackerComponent } from '../results-common/chemi-tracker/chemi-tracker.component';
import { ChemicalDirectoryComponent } from '../results-common/chemical-directory/chemical-directory.component';

@Component({
  selector: 'chem-route-results',
  standalone: true,
  imports: [NgIf, BasicRouteComponent, TechnicalRoutesComponent, ImpurityComponent, ChemiTrackerComponent, ImpComponent,IndianComponent,ChemicalDirectoryComponent,JapanComponent,CanadaComponent,EuropeApprovalComponent,KoreaComponent,LitigationComponent, UsComponent,SpcdbComponent,EximComponent, RouteTabsComponent,ActivePatentComponent, NgSwitch, NgSwitchCase, NgSwitchDefault, JsonPipe],
  templateUrl: './route-result.component.html',
  styleUrl: './route-result.component.css'
})

export class RouteResultComponent {

  currentTabData: any = {}
  resultTabs: any = [];
  resultTabWithKeys: any = [];
  _dataItem: any = {};

  @Output() handleSetLoading: EventEmitter<any> = new EventEmitter<any>();
  @Output() backFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() onResultTabChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleChildPaginationSearch: EventEmitter<any> = new EventEmitter<any>();

  @Input() currentChildAPIBody: any;
  @Input() currentApiData: any;
  @Input() CurrentAPIBody: any;

  @Input() index: number | undefined;
  @Input() searchData: any;  

  @Input() 
  get dataItem() {
    return this._dataItem;
  }
  set dataItem(value: any) {
    this._dataItem = value;
  }
  
  constructor(private utilityService: UtilityService,
    private userPriviledgeService: UserPriviledgeService,
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
