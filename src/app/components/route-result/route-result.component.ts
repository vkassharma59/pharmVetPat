import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { searchTypes, UtilityService } from '../../services/utility-service/utility.service';
import { JsonPipe, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { RouteTabsComponent } from '../route-tabs/route-tabs.component';
import { BasicRouteCardComponent } from '../results-common/basic-route-card/basic-route-card.component';
import { TechnicalRoutesCardComponent } from '../results-common/technical-routes-card/technical-routes-card.component';
import { ChemicalDirectoryDataCardComponent } from '../results-common/chemical-directory-card/chemical-directory-data-card.component';
import { DmfOrSuplierComponent } from '../results-common/dmf-or-suplier/dmf-or-suplier.component';
import { UserPriviledgeService } from '../../services/user_priviledges/user-priviledge.service';
import { ImpurityCardComponent } from '../results-common/impurity-card/impurity-card.component';
import { ChemiTrackerCardComponent } from '../results-common/chemi-tracker-card/chemi-tracker-card.component';
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

@Component({
  selector: 'chem-route-results',
  standalone: true,
  imports: [NgIf, ImpComponent,IndianComponent,ChemiTrackerCardComponent,ImpurityCardComponent,JapanComponent,CanadaComponent,EuropeApprovalComponent,KoreaComponent,LitigationComponent, UsComponent,SpcdbComponent,EximComponent, RouteTabsComponent,ActivePatentComponent ,BasicRouteCardComponent, TechnicalRoutesCardComponent,DmfOrSuplierComponent, ChemicalDirectoryDataCardComponent, NgSwitch, NgSwitchCase, NgSwitchDefault, JsonPipe],
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
          searchWithValue = this.dataItem[this.resultTabWithKeys.chemicalDirectory.name].trrn;
        } else {
          searchWith = 'GBRN';
          searchWithValue = this.dataItem[this.resultTabWithKeys.chemicalDirectory.name].gbrn;
        }
        break;
      case searchTypes.synthesisSearch:
        if(data.name === this.resultTabWithKeys.chemicalDirectory.name) {
          searchWith = 'TRRN';
          searchWithValue = this.dataItem[this.resultTabWithKeys.technicalRoutes.name].trrn;
        } else {
          searchWith = 'GBRN';
          searchWithValue = this.dataItem[this.resultTabWithKeys.technicalRoutes.name].gbrn;
        }
        break;        
      case searchTypes.intermediateSearch:
          if(data.name === this.resultTabWithKeys.technicalRoutes.name) {
            searchWith = 'TRRN';
            searchWithValue = this.dataItem[this.resultTabWithKeys.chemicalDirectory.name].trrn;
          } else {
            searchWith = 'GBRN';
            searchWithValue = this.dataItem[this.resultTabWithKeys.chemicalDirectory.name].gbrn;
          }
          break;
      case (searchTypes.simpleSearch || searchTypes.advanceSearch):
        searchWith = 'GBRN';
        searchWithValue = this.dataItem[this.resultTabWithKeys.productInfo.name].gbrn;
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
