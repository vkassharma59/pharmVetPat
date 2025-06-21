import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChemicalDirectoryDataCardComponent } from '../chemical-directory-card/chemical-directory-data-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { TechnicalRoutesComponent } from "../technical-routes/technical-routes.component";
import { UtilityService } from '../../../services/utility-service/utility.service';
import { ApiConfigService } from '../../../../appservice';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { LoadingService } from '../../../services/loading-service/loading.service';


@Component({
  selector: 'chemical-directory',
  standalone: true,
  imports: [
    ChemicalDirectoryDataCardComponent,
    CommonModule,
    ChildPagingComponent,
    TechnicalRoutesComponent
  ],
  templateUrl: './chemical-directory.component.html',
  styleUrl: './chemical-directory.component.css'
})
export class ChemicalDirectoryComponent implements OnChanges {

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @Output() activeTabChange = new EventEmitter<string>();
  @Output() handleROSChange = new EventEmitter<any>();
  @Input() CurrentAPIBody: any;
  private _currentChildAPIBody: any;

  @Input()
  set data(value: any) {
    this._data = value;
    this.handleResultTabData.emit(this._data || []);
  }

  get data() {
    return this._data;
  }

  _data: any = [];
  resultTabs: any = {};
  searchThrough: string = '';
  showTechnicalRoute = false;


  @Input()
  get currentChildAPIBody(): any {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    // optionally add logic here
  }

  @Input() index: any;
  @Input() tabName?: string;

  constructor(
    private utilityService: UtilityService,
    private apiConfigService: ApiConfigService,
    private mainSearchService: MainSearchService,
    public loadingService: LoadingService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      console.log('✅ ChemicalDirectoryComponent received new data:', this._data);
      this.handleResultTabData.emit(this._data);
    }
  }

  updateDataFromPagination(newData: any) {
    this._data = newData.chem_dir_data || [];
    this.handleResultTabData.emit(newData);
    console.log("✅ Updated data from pagination:", newData);
  }

 onROSChange(event: any) {
  console.log('📥 Received ROS change from child:', event);
}

  onActiveTabChange(tabName: string) {
       this.activeTabChange.emit(tabName);
    
  }

}

