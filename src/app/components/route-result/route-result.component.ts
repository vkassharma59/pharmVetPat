import { LoaderComponent } from '../../commons/loader/loader.component';
import { CommonModule } from '@angular/common';
import { AppConfigValues } from '../../config/app-config';
import { ColumnListService } from '../../services/columnList/column-list.service';
import { MainSearchService } from '../../services/main-search/main-search.service';
import { PaginationComponent } from '../../commons/pagination/pagination.component';
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
import { ResultTabComponent } from "../../commons/result-tab/result-tab.component";
@Component({
  selector: 'chem-route-results',
  standalone: true,
  imports: [NgIf, BasicRouteComponent, TechnicalRoutesComponent, ImpurityComponent, ChemiTrackerComponent, ImpComponent, IndianComponent, ChemicalDirectoryComponent, JapanComponent, CanadaComponent, EuropeApprovalComponent, KoreaComponent, LitigationComponent, UsComponent, SpcdbComponent, EximComponent, RouteTabsComponent, ActivePatentComponent, NgSwitch, NgSwitchCase, NgSwitchDefault, JsonPipe, ResultTabComponent],
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
  @Output() downloadPdfEvent = new EventEmitter<void>();
  @Output() showDataResultFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleLoading: EventEmitter<any> = new EventEmitter<any>();
  @Output() makePdf: EventEmitter<any> = new EventEmitter<any>();
  @Output() priviledgeModal: EventEmitter<any> = new EventEmitter<any>();
  @Input() MainDataResultShow: any;
  @Input() CurrentAPIBody: any;
  @Input() entryType: string='';
  @Output() showResultFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() generatePdf: EventEmitter<any> = new EventEmitter<any>();


  @Output() setLoadingState: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() allDataSets: any = [];  
  @Input() searchData: any;  
  @Input() currentChildAPIBody: any;
  @Input() currentApiData: any;

  @Input() index: number | undefined;

  @Input() 
  get dataItem() {
    return this._dataItem;
  }
  set dataItem(value: any) {
    this._dataItem = value;
  }
  
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
